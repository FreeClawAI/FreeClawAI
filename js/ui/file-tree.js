// FreeClaw - File tree UI rendering (lazy loading)
const FileTree = {
    async refresh() {
        await FileService.refresh();
        this.render();
        this._restoreState();
    },

    async _restoreState() {
        var state = await DB.getState();
        if (state && state.inputText) {
            document.getElementById('aiInput').value = state.inputText;
        }
    },

    async saveState() {
        await DB.saveState({
            workDir: FileService.getActiveDir(),
            inputText: document.getElementById('aiInput').value
        });
    },

    render: function() {
        var container = document.getElementById('aiFileList');
        if (!container) {
            return;
        }
        var html = '';
        var dirs = FileService.getRootDirs();
        var self = this;
        dirs.forEach(function(dir) {
            var node = FileService.getTree(dir);
            if (!node) {
                return;
            }
            html += self._renderTree(dir, node, 0);
        });
        container.innerHTML = html || '<div style="text-align:center;color:#999;padding:20px">' + I18n.t('Click a file to view') + '</div>';
    },

    _renderTree: function(dir, node, depth) {
        var self = this;
        var indent = depth * 16;
        var collapsed = !node._expanded;
        var arrow = collapsed ? '▶' : '▼';
        var display = collapsed ? 'none' : 'block';

        var html = '<div class="ai-tree-folder" data-dir="' + Utils.escAttr(dir) + '" style="padding-left:' + indent + 'px">' +
            '<span class="ai-tree-arrow">' + arrow + '</span>' +
            '<span class="ai-tree-icon">📁</span>' +
            '<span class="ai-tree-name">' + Utils.esc(node.name) + '</span>' +
            '</div>';
        html += '<div class="ai-tree-children" style="display:' + display + '">';
        if (!collapsed && node.children) {
            node.children.forEach(function(child) {
                if (child.type === 'dir') {
                    var childDir = dir.replace(/\\/g, '/').replace(/\/$/, '') + '/' + child.name;
                    var childNode = FileService.getTree(childDir);
                    if (childNode) {
                        html += self._renderTree(childDir, childNode, depth + 1);
                    } else {
                        html += '<div class="ai-tree-folder" data-dir="' + Utils.escAttr(childDir) + '" style="padding-left:' + (indent + 16) + 'px">' +
                            '<span class="ai-tree-arrow">▶</span><span class="ai-tree-icon">📁</span>' + Utils.esc(child.name) +
                            '</div><div class="ai-tree-children" style="display:none"></div>';
                    }
                } else {
                    var icon = child.isAi ? '🤖' : (child.isUser ? '✏️' : (child._hasAi ? '🤖' : ''));
                    var cls = 'ai-tree-file';
                    if (child.isAi) {
                        cls += ' ai-ai-file';
                    } else if (child._hasAi) {
                        cls += ' ai-has-ai';
                    }
                    html += '<div class="' + cls + '" data-name="' + Utils.escAttr(child.name) + '" data-dir="' + Utils.escAttr(dir) + '" style="padding-left:' + (indent + 16) + 'px">' +
                        (icon ? '<span class="ai-tree-icon">' + icon + '</span>' : '') +
                        '<span class="ai-tree-name"' + (icon ? '' : ' style="padding-left:20px"') + '>' + Utils.esc(child.name) + '</span>' +
                        '</div>';
                }
            });
        }
        html += '</div>';
        return html;
    },

    initEvents: function() {
        var container = document.getElementById('aiFileList');
        if (!container || container._eventsBound) {
            return;
        }
        container._eventsBound = true;
        var self = this;

        container.addEventListener('click', async function(e) {
            var folder = e.target.closest('.ai-tree-folder');
            if (folder) {
                e.stopPropagation();
                var dir = folder.dataset.dir;
                var childrenDiv = folder.nextElementSibling;
                if (!childrenDiv || !childrenDiv.classList.contains('ai-tree-children')) {
                    return;
                }

                if (childrenDiv.style.display === 'none' || !childrenDiv.style.display) {
                    if (!FileService.isDirLoaded(dir)) {
                        await FileService.loadDir(dir);
                    }
                    var node = FileService.getTree(dir);
                    if (node && node.children) {
                        var html = '';
                        var parentIndent = parseInt(folder.style.paddingLeft || 0);
                        node.children.forEach(function(child) {
                            if (child.type === 'dir') {
                                var childDir = dir.replace(/\\/g, '/').replace(/\/$/, '') + '/' + child.name;
                                html += '<div class="ai-tree-folder" data-dir="' + Utils.escAttr(childDir) + '" style="padding-left:' + (parentIndent + 16) + 'px">' +
                                    '<span class="ai-tree-arrow">▶</span><span class="ai-tree-icon">📁</span>' + Utils.esc(child.name) +
                                    '</div><div class="ai-tree-children" style="display:none"></div>';
                            } else {
                                var icon = child.isAi ? '🤖' : (child.isUser ? '✏️' : (child._hasAi ? '🤖' : ''));
                                html += '<div class="ai-tree-file" data-name="' + Utils.escAttr(child.name) + '" data-dir="' + Utils.escAttr(dir) + '" style="padding-left:' + (parentIndent + 16) + 'px">' +
                                    (icon ? '<span class="ai-tree-icon">' + icon + '</span>' : '') +
                                    '<span class="ai-tree-name"' + (icon ? '' : ' style="padding-left:20px"') + '>' + Utils.esc(child.name) + '</span>' +
                                    '</div>';
                            }
                        });
                        childrenDiv.innerHTML = html;
                    }
                    childrenDiv.style.display = 'block';
                    var arrow = folder.querySelector('.ai-tree-arrow');
                    if (arrow) {
                        arrow.textContent = '▼';
                    }
                } else {
                    childrenDiv.style.display = 'none';
                    var arrow = folder.querySelector('.ai-tree-arrow');
                    if (arrow) {
                        arrow.textContent = '▶';
                    }
                }
                return;
            }

            var fileEl = e.target.closest('.ai-tree-file');
            if (fileEl) {
                var fileName = fileEl.dataset.name;
                var fileDir = fileEl.dataset.dir;
                if (fileDir) {
                    FileService.setActiveDir(fileDir);
                }
                var file = FileService.getFileByName(fileName);
                if (file) {
                    Preview.show(file);
                    if (file.isUser) {
                        Editor.startEdit(file);
                    }
                    if (!file.content && !file.isAi && !file.isUser) {
                        self._loadContent(file);
                    }
                }
                return;
            }
        });

        container.addEventListener('contextmenu', function(e) {
            var target = e.target.closest('.ai-tree-file');
            if (!target) {
                return;
            }
            e.preventDefault();
            var name = target.dataset.name;
            var file = FileService.getFileByName(name);
            var type = file ? (file.isAi ? 'ai' : (file.isUser ? 'user' : 'original')) : 'original';
            ContextMenu.show(e, name, type);
        });
    },

    async _loadContent(file) {
        try {
            var dir = Config.mainDir;
            var r = await fetch(Config.serverUrl + '/api/files/read', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    dir: dir,
                    filename: file.name
                })
            });
            var j = await r.json();
            file.content = j.content;
            file.md5 = j.md5;
            Preview.show(file);
        } catch (e) {
            Preview.show({
                name: file.name,
                content: I18n.t('[Unable to read file]')
            });
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