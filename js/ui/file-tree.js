// FreeClaw - File tree UI rendering
const FileTree = {
    _collapsed: {},

    async refresh() {
        await FileService.refresh();
        this.render();
        this._restoreState();
    },

    async _restoreState() {
        var state = await DB.getState();
        if (state && state.inputText) document.getElementById('aiInput').value = state.inputText;
    },

    async saveState() {
        await DB.saveState({
            workDir: FileService.getActiveDir(),
            inputText: document.getElementById('aiInput').value
        });
    },

    render: function() {
        var self = this;
        var container = document.getElementById('aiFileList');
        var search = (document.getElementById('aiSearchFiles')?.value || '').toLowerCase();
        var html = '';
        var dirs = FileService.getAllDirs();

        dirs.forEach(function(dir) {
            var folderName = dir.split('\\').pop().split('/').pop();
            var collapsed = self._collapsed[dir] !== false;
            var arrow = collapsed ? '▶' : '▼';
            var display = collapsed ? 'none' : 'block';

            html += '<div class="ai-dir-node">' +
                '<div class="ai-dir-header" data-dir="' + Utils.escAttr(dir) + '">' +
                    '<span class="ai-dir-arrow">' + arrow + '</span>' +
                    '<span class="ai-dir-icon">📁</span>' +
                    '<span class="ai-dir-name">' + Utils.esc(folderName) + '</span>' +
                '</div>' +
                '<div class="ai-dir-files" style="display:' + display + '">';

            if (!collapsed) {
                var files = FileService.getFilesForDir(dir);
                if (search) {
                    files = files.filter(function(f) { return f.name.toLowerCase().indexOf(search) !== -1; });
                }

                files.forEach(function(f) {
                    var icon = '';
                    var type = 'original';
                    if (f.isAi) {
                        icon = '🤖';
                        type = 'ai';
                    } else if (f._hasAi) {
                        icon = '🤖';
                        type = 'ai';
                    }

                    html += '<div class="ai-file-item" data-name="' + Utils.escAttr(f.name) + '" data-dir="' + Utils.escAttr(dir) + '" oncontextmenu="ContextMenu.show(event,\'' + Utils.escAttr(f.name) + '\',\'' + type + '\')">' +
                        (icon ? '<span class="ai-file-icon">' + icon + '</span>' : '') +
                        '<span class="ai-file-name"' + (icon ? '' : ' style="padding-left:20px"') + '>' + Utils.esc(f.name) + '</span>' +
                    '</div>';
                });

                FileService.getUserFiles().forEach(function(uf) {
                    if (uf.dir === dir || !uf.dir) {
                        html += '<div class="ai-file-item" data-name="' + Utils.escAttr(uf.name) + '" data-dir="' + Utils.escAttr(dir) + '" oncontextmenu="ContextMenu.show(event,\'' + Utils.escAttr(uf.name) + '\',\'user\')">' +
                            '<span class="ai-file-icon">✏️</span>' +
                            '<span class="ai-file-name">' + Utils.esc(uf.name) + '</span>' +
                        '</div>';
                    }
                });
            }

            html += '</div></div>';
        });

        container.innerHTML = html;

        container.querySelectorAll('.ai-dir-header').forEach(function(header) {
            header.onclick = async function() {
                var dir = this.dataset.dir;
                var filesDiv = this.nextElementSibling;
                var arrowEl = this.querySelector('.ai-dir-arrow');

                if (filesDiv.style.display === 'none') {
                    await FileService.loadDir(dir);
                    self._collapsed[dir] = false;
                    self.render();
                } else {
                    filesDiv.style.display = 'none';
                    arrowEl.textContent = '▶';
                    self._collapsed[dir] = true;
                }
            };
        });

        container.querySelectorAll('.ai-file-item').forEach(function(item) {
            item.onclick = function(e) {
                var name = this.dataset.name;
                var dir = this.dataset.dir;
                FileService.setActiveDir(dir);
                var file = FileService.findFile(name, dir);
                if (file) {
                    Preview.show(file);
                    if (file.isUser) Editor.startEdit(file);
                    if (file.isOriginal && !file.content) self._loadContent(file, dir);
                }
            };
        });
    },

    async _loadContent(file, dir) {
        try {
            var r = await fetch(Config.serverUrl + '/api/files/read', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dir: dir, filename: file.name })
            });
            var j = await r.json();
            file.content = j.content;
            file.md5 = j.md5;
            Preview.show(file);
        } catch (e) {
            Preview.show({ name: file.name, content: I18n.t('toast.unableRead') });
        }
    },

    getSelectedFiles: function() {
        return FileService.getAiFiles().map(function(f) {
            f._dir = Config.mainDir;
            return f;
        });
    },

    getFileByName: function(name) {
        return FileService.getFileByName(name);
    },

    removeAiFile: function(name) {
        FileService.removeAiFile(name);
        this.render();
    },

    removeUserFile: function(name) {
        FileService.removeUserFile(name);
        this.render();
    },

    addUserFile: function(name, content) {
        FileService.addUserFile(name, content);
        this.render();
    }
};