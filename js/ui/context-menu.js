// FreeClaw - Right-click context menu
const ContextMenu = {
    show: function(event, filename, type) {
        event.preventDefault();
        var oldMenu = document.getElementById('ai-context-menu');
        if (oldMenu) oldMenu.remove();

        var menu = document.createElement('div');
        menu.id = 'ai-context-menu';
        menu.style.cssText = 'position:fixed;z-index:10000001;background:white;border:1px solid #ddd;border-radius:4px;box-shadow:0 2px 8px rgba(0,0,0,.2);padding:4px 0;min-width:140px;font-size:12px';
        menu.style.left = event.clientX + 'px';
        menu.style.top = event.clientY + 'px';

        var items = [];
        if (type === 'original') {
            items.push({ text: I18n.t('Copy'), action: function() { ContextMenu._copyFile(filename); } });
            items.push({ text: I18n.t('Download'), action: function() { ContextMenu._download(filename); } });
            items.push({ text: I18n.t('Delete'), action: function() { ContextMenu._delete(filename, type); } });
        }
        if (type === 'ai' || type === 'user') {
            items.push({ text: I18n.t('Save'), action: function() { SaveDialog.show(); } });
            items.push({ text: I18n.t('Format Code'), action: function() { ContextMenu._formatFile(filename); } });
            items.push({ text: I18n.t('Rename'), action: function() { ContextMenu._rename(filename); } });
            items.push({ text: I18n.t('Delete'), action: function() { ContextMenu._delete(filename, type); } });
        }

        items.forEach(function(item) {
            var div = document.createElement('div');
            div.textContent = item.text;
            div.style.cssText = 'padding:6px 12px;cursor:pointer';
            div.onmouseover = function() { div.style.background = '#f0f0f0'; };
            div.onmouseout = function() { div.style.background = ''; };
            div.onclick = function() { item.action(); menu.remove(); };
            menu.appendChild(div);
        });

        document.body.appendChild(menu);
        document.addEventListener('click', function() { menu.remove(); }, { once: true });
    },

    _copyFile: async function(filename) {
        var file = FileService.getFileByName(filename);
        if (file && !file.content) {
            await FileTree._loadContent(file, file._dir || Config.mainDir);
        }
        var newName = filename.replace(/(\.[^.]+)$/, '_copy$1') || filename + '_copy';
        FileService.addUserFile(newName, file ? file.content : '');
        FileTree.render();
        await DB.saveFile(Config.mainDir + '/' + newName, { name: newName, content: file ? file.content : '', type: 'user', dir: Config.mainDir });
        Toast.show(I18n.t('Copied: {0}', newName));
    },

    _download: function(filename) {
        var file = FileService.getFileByName(filename);
        if (!file || !file.content) {
            var dirs = FileService.getAllDirs();
            for (var i = 0; i < dirs.length; i++) {
                var f = FileService.findFile(filename, dirs[i]);
                if (f && f.isOriginal && !f.content) {
                    FileTree._loadContent(f, dirs[i]).then(function() {
                        ContextMenu._doDownload(filename, f.content);
                    });
                    return;
                }
            }
        }
        this._doDownload(filename, file ? file.content : '');
    },

    _doDownload: function(filename, content) {
        var blob = new Blob([content || ''], { type: 'text/plain' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url; a.download = filename; a.click();
        URL.revokeObjectURL(url);
    },

    _formatFile: function(filename) {
        var file = FileService.getFileByName(filename);
        if (!file || !file.content) return;
        var formatted = Formatter.format(file.content, filename);
        if (formatted !== file.content) {
            file.content = formatted;
            Preview.setContent(formatted);
            Toast.show(I18n.t('Formatted: {0}', filename));
        }
    },

    _rename: async function(filename) {
        var newName = prompt(I18n.t('Rename') + ':', filename);
        if (!newName) return;
        var file = FileService.getFileByName(filename);
        if (file) {
            file.name = newName;
            FileService.removeAiFile(filename);
            FileService.removeUserFile(filename);
            FileService.addUserFile(newName, file.content);
            FileTree.render();
            Toast.show(I18n.t('Renamed: {0}', newName));
        }
    },

    _delete: async function(filename, type) {
        if (!confirm(I18n.t('Delete {0}? Cannot undo!', filename))) return;
        try {
            var dirs = FileService.getAllDirs();
            var foundDir = null;
            for (var i = 0; i < dirs.length; i++) {
                var f = FileService.findFile(filename, dirs[i]);
                if (f && f.isOriginal) { foundDir = dirs[i]; break; }
            }
            if (foundDir) {
                await Api.deleteFile(foundDir, filename);
            }
            if (type === 'ai') FileTree.removeAiFile(filename);
            if (type === 'user') {
                FileService.removeUserFile(filename);
                await DB.deleteFile(Config.mainDir + '/' + filename);
            }
            Toast.show(I18n.t('Deleted: {0}', filename));
        } catch (e) {
            Toast.show(I18n.t('Failed: {0}', filename), 'error');
        }
        await FileService.refreshAndRender();
    }
};