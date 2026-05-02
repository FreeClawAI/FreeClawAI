// FreeClaw - Right-click context menu
const ContextMenu = {
    show(event, filename, type) {
        event.preventDefault();
        const oldMenu = document.getElementById('ai-context-menu');
        if (oldMenu) oldMenu.remove();

        const menu = document.createElement('div');
        menu.id = 'ai-context-menu';
        menu.style.cssText = 'position:fixed;z-index:10000001;background:white;border:1px solid #ddd;border-radius:4px;box-shadow:0 2px 8px rgba(0,0,0,.2);padding:4px 0;min-width:140px;font-size:12px';
        menu.style.left = event.clientX + 'px';
        menu.style.top = event.clientY + 'px';

        const items = [];
        if (type === 'original') {
            items.push({ text: I18n.t('context.copy'), action: () => this._copyFile(filename) });
            items.push({ text: I18n.t('context.download'), action: () => this._download(filename) });
        }
        if (type === 'ai' || type === 'user') {
            items.push({ text: I18n.t('context.save'), action: () => Saver._batchSave([FileTree.getFileByName(filename)].filter(Boolean)) });
            items.push({ text: I18n.t('context.format'), action: () => this._formatFile(filename) });
            items.push({ text: I18n.t('context.rename'), action: () => this._rename(filename) });
        }
        items.push({ text: I18n.t('context.delete'), action: () => this._delete(filename, type) });

        items.forEach(item => {
            const div = document.createElement('div');
            div.textContent = item.text;
            div.style.cssText = 'padding:6px 12px;cursor:pointer';
            div.onmouseover = () => div.style.background = '#f0f0f0';
            div.onmouseout = () => div.style.background = '';
            div.onclick = () => { item.action(); menu.remove(); };
            menu.appendChild(div);
        });

        document.body.appendChild(menu);
        document.addEventListener('click', () => menu.remove(), { once: true });
    },

    async _copyFile(filename) {
        const file = FileTree.getFileByName(filename);
        await FileTree._loadContent(file);
        const newName = filename.replace(/(\.[^.]+)$/, '_copy$1') || filename + '_copy';
        FileTree.addUserFile(newName, file.content);
        await DB.saveFile(Config.mainDir + '/' + newName, { name: newName, content: file.content, type: 'user', dir: Config.mainDir });
        Toast.show(I18n.t('toast.copy', newName));
    },

    _download(filename) {
        const file = FileTree.getFileByName(filename);
        FileTree._loadContent(file).then(() => {
            const blob = new Blob([file.content || ''], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = filename; a.click();
            URL.revokeObjectURL(url);
        });
    },

    _formatFile(filename) {
        const file = FileTree.getFileByName(filename);
        if (!file?.content) return;
        const formatted = Formatter.format(file.content, filename);
        if (formatted !== file.content) {
            file.content = formatted;
            Preview.setContent(formatted);
            Toast.show(I18n.t('toast.format', filename));
        }
    },

    async _rename(filename) {
        const newName = prompt(I18n.t('context.rename') + ':', filename);
        if (!newName) return;
        const file = FileTree.getFileByName(filename);
        if (file) {
            file.name = newName;
            FileTree.removeAiFile(filename);
            FileTree.removeUserFile(filename);
            FileTree.addUserFile(newName, file.content);
            Toast.show(I18n.t('toast.rename', newName));
        }
    },

    async _delete(filename, type) {
        if (type === 'original') {
            if (!confirm(I18n.t('context.deleteConfirm', filename))) return;
            try {
                await fetch(`${Config.serverUrl}/api/files/delete`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ dir: Config.mainDir, filename })
                });
                Toast.show(I18n.t('toast.delete', filename));
            } catch (e) { Toast.show(I18n.t('toast.saveFail', filename), 'error'); }
        } else {
            if (type === 'ai') FileTree.removeAiFile(filename);
            if (type === 'user') { FileTree.removeUserFile(filename); await DB.deleteFile(Config.mainDir + '/' + filename); }
            Toast.show(I18n.t('toast.delete', filename));
        }
        await FileTree.refresh();
    }
};