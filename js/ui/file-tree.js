// FreeClaw - File tree rendering with multi-directory support
const FileTree = {
    _aiFiles: [],
    _workFiles: {},
    _userFiles: [],
    _activeDir: null,
    _collapsed: {},

    async refresh() {
        this._aiFiles = Extractor.extract();
        this._activeDir = Config.mainDir;
        await this._loadAllWorkFiles();
        await this._loadUserFiles();
        this.render();
        this._restoreState();
    },

    async _loadAllWorkFiles() {
        this._workFiles = {};
        var dirs = Config.workDirs;
        for (var i = 0; i < dirs.length; i++) {
            try {
                var r = await fetch(Config.serverUrl + '/api/files/list?dir=' + encodeURIComponent(dirs[i]) + '&flat=1');
                var j = await r.json();
                this._workFiles[dirs[i]] = (j.files || []).map(function(f) {
                    return { name: f.name || f, size: f.size || 0, isOriginal: true };
                });
            } catch (e) {
                this._workFiles[dirs[i]] = [];
            }
        }

        var aiNames = this._aiFiles.map(function(f) { return f.name; });
        var allExistingNames = [];
        for (var d in this._workFiles) {
            this._workFiles[d].forEach(function(f) {
                f._hasAi = aiNames.indexOf(f.name) !== -1;
                allExistingNames.push(f.name);
            });
        }

        var mainDir = Config.mainDir;
        var self = this;
        this._aiFiles.forEach(function(aiFile) {
            if (allExistingNames.indexOf(aiFile.name) === -1) {
                if (!self._workFiles[mainDir]) self._workFiles[mainDir] = [];
                self._workFiles[mainDir].push({
                    name: aiFile.name,
                    content: aiFile.content,
                    isAi: true,
                    isNew: true
                });
            }
        });
    },

    async _loadUserFiles() {
        var all = await DB.getAllFiles();
        this._userFiles = all
            .filter(function(f) { return f.type === 'user'; })
            .map(function(f) { return { name: f.name, content: f.content, isUser: true, dbKey: f.key, dir: f.dir || Config.mainDir }; });
    },

    async _restoreState() {
        var state = await DB.getState();
        if (state && state.inputText) document.getElementById('aiInput').value = state.inputText;
    },

    async saveState() {
        await DB.saveState({
            workDir: this._activeDir,
            inputText: document.getElementById('aiInput').value
        });
    },

    render: function() {
        var self = this;
        var container = document.getElementById('aiFileList');
        var search = (document.getElementById('aiSearchFiles')?.value || '').toLowerCase();
        var html = '';
        var dirs = Config.workDirs;
        if (!dirs.length) dirs = ['workspace'];

        dirs.forEach(function(dir) {
            var folderName = dir.split('\\').pop().split('/').pop();
            var collapsed = self._collapsed[dir] || false;
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
                var files = self._workFiles[dir] || [];
                if (search) {
                    files = files.filter(function(f) { return f.name.toLowerCase().indexOf(search) !== -1; });
                }

                files.forEach(function(f) {
                    var icon = f.isAi ? '🤖' : (f._hasAi ? '🤖' : (f._updated ? '✅' : '📄'));
                    var type = f.isAi ? 'ai' : 'original';
                    html += '<div class="ai-file-item" data-name="' + Utils.escAttr(f.name) + '" data-dir="' + Utils.escAttr(dir) + '" oncontextmenu="ContextMenu.show(event,\'' + Utils.escAttr(f.name) + '\',\'' + type + '\')">' +
                        '<span class="ai-file-icon">' + icon + '</span>' +
                        '<span class="ai-file-name">' + Utils.esc(f.name) + '</span>' +
                    '</div>';
                });

                self._userFiles.forEach(function(uf) {
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
            header.onclick = function() {
                var dir = this.dataset.dir;
                var filesDiv = this.nextElementSibling;
                var arrowEl = this.querySelector('.ai-dir-arrow');
                if (filesDiv.style.display === 'none') {
                    filesDiv.style.display = 'block';
                    arrowEl.textContent = '▼';
                    self._collapsed[dir] = false;
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
                self._activeDir = dir;
                var file = self._findFile(name, dir);
                if (file) {
                    Preview.show(file);
                    if (file.isUser) Editor.startEdit(file);
                    if (file.isOriginal && !file.content) self._loadContent(file, dir);
                }
            };
        });
    },

    _findFile: function(name, dir) {
        var files = (this._workFiles[dir] || [])
            .concat(this._aiFiles)
            .concat(this._userFiles);
        return files.find(function(f) { return f.name === name; });
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
        var result = [];
        this._aiFiles.forEach(function(f) {
            f._dir = Config.mainDir;
            result.push(f);
        });
        return result;
    },

    getFileByName: function(name) {
        var dirs = Config.workDirs;
        for (var i = 0; i < dirs.length; i++) {
            var f = this._findFile(name, dirs[i]);
            if (f) return f;
        }
        return null;
    },

    removeAiFile: function(name) {
        this._aiFiles = this._aiFiles.filter(function(f) { return f.name !== name; });
        this.render();
    },

    removeUserFile: function(name) {
        this._userFiles = this._userFiles.filter(function(f) { return f.name !== name; });
        this.render();
    },

    addUserFile: function(name, content) {
        this._userFiles.push({ name: name, content: content, isUser: true });
        this.render();
    }
};