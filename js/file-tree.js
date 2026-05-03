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
                    var isModified = child.isAi || child.isUser;
                    var icon = isModified ? '✏️' : '';
                    var cls = 'ai-tree-file';
                    if (isModified) {
                        cls += ' ai-ai-file';
                    }
                    var sizeStr = child.size !== undefined && child.size !== null ? ' <span style="color:#999;font-size:11px">(' + self._formatSize(child.size) + ')</span>' : '';
                    html += '<div class="' + cls + '" data-name="' + Utils.escAttr(child.name) + '" data-dir="' + Utils.escAttr(dir) + '" data-filetype="' + Utils.escAttr(child.fileType || 'original') + '" data-size="' + (child.size || 0) + '" style="padding-left:' + (indent + 16) + 'px">' +
                        (icon ? '<span class="ai-tree-icon">' + icon + '</span>' : '') +
                        '<span class="ai-tree-name"' + (icon ? '' : ' style="padding-left:20px"') + '>' + Utils.esc(child.name) + '</span>' +
                        sizeStr +
                        '</div>';
                }
            });
        }
        html += '</div>';
        return html;
    },

    _formatSize: function(bytes) {
        if (bytes === undefined || bytes === null) {
            return '';
        }
        if (bytes < 1024) {
            return bytes + ' B';
        }
        if (bytes < 1024 * 1024) {
            return (bytes / 1024).toFixed(1) + ' KB';
        }
        if (bytes < 1024 * 1024 * 1024) {
            return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
        }
        return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    },

    _isMediaFile: function(name) {
        var ext = name.split('.').pop().toLowerCase();
        var mediaExts = [
            'png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico', 'bmp',
            'mp4', 'webm', 'avi', 'mov', 'mkv',
            'mp3', 'wav', 'ogg', 'flac', 'aac',
            'pdf',
            'woff', 'woff2', 'ttf', 'eot',
            'zip', 'tar', 'gz', 'rar', '7z'
        ];
        return mediaExts.indexOf(ext) !== -1;
    },

    _isPreviewableFile: function(name) {
        var ext = name.split('.').pop().toLowerCase();
        var previewable = [
            'cs', 'js', 'ts', 'jsx', 'tsx', 'html', 'htm', 'css', 'scss', 'less',
            'json', 'xml', 'yaml', 'yml', 'md', 'txt', 'py', 'java', 'rs', 'go',
            'c', 'cpp', 'h', 'hpp', 'sh', 'bat', 'cmd', 'ps1', 'sql', 'vue',
            'svelte', 'rb', 'php', 'swift', 'kt', 'dart', 'lua', 'r', 'm', 'mm',
            'toml', 'ini', 'cfg', 'conf', 'log', 'csv', 'tsv'
        ];
        if (previewable.indexOf(ext) !== -1) {
            return true;
        }
        var basename = name.toLowerCase();
        if (basename === 'makefile' || basename === 'dockerfile' || basename === 'license' || basename === 'gitignore' || basename === 'env' || basename === 'editorconfig' || basename === 'prettierrc' || basename === 'eslintrc') {
            return true;
        }
        return false;
    },

    _openRaw: function(fileDir, fileName) {
        var absolutePath = fileDir.replace(/\\/g, '/').replace(/\/$/, '') + '/' + fileName;
        var rawUrl = Config.serverUrl + '/api/files/raw?path=' + encodeURIComponent(absolutePath);
        window.open(rawUrl, '_blank');
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
                                var isModified = child.isAi || child.isUser;
                                var icon = isModified ? '✏️' : '';
                                var sizeStr = child.size !== undefined && child.size !== null ? ' <span style="color:#999;font-size:11px">(' + self._formatSize(child.size) + ')</span>' : '';
                                html += '<div class="ai-tree-file" data-name="' + Utils.escAttr(child.name) + '" data-dir="' + Utils.escAttr(dir) + '" data-filetype="' + Utils.escAttr(child.fileType || 'original') + '" data-size="' + (child.size || 0) + '" style="padding-left:' + (parentIndent + 16) + 'px">' +
                                    (icon ? '<span class="ai-tree-icon">' + icon + '</span>' : '') +
                                    '<span class="ai-tree-name"' + (icon ? '' : ' style="padding-left:20px"') + '>' + Utils.esc(child.name) + '</span>' +
                                    sizeStr +
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
                var fileSize = parseInt(fileEl.dataset.size) || 0;
                var fileType = fileEl.dataset.filetype || 'original';

                if (fileDir) {
                    FileService.setActiveDir(fileDir);
                }

                if (self._isMediaFile(fileName)) {
                    self._openRaw(fileDir, fileName);
                    return;
                }

                if (fileSize > 10 * 1024 * 1024) {
                    Preview.show({
                        name: fileName,
                        content: I18n.t('[File too large to preview]') + ' (' + self._formatSize(fileSize) + ')\n\n' + I18n.t('Opening in browser...')
                    });
                    self._openRaw(fileDir, fileName);
                    return;
                }

                var file = null;
                var types = ['ai', 'user', 'original'];
                for (var t = 0; t < types.length; t++) {
                    var tryId = fileDir + '|' + fileName + '|' + types[t];
                    if (FileService._fileMap && FileService._fileMap[tryId]) {
                        file = FileService._fileMap[tryId];
                        break;
                    }
                }

                if (file && file.content) {
                    Preview.show(file);
                    if (file.isUser) {
                        Editor.startEdit(file);
                    }
                    return;
                }

                if (self._isPreviewableFile(fileName)) {
                    try {
                        var r = await fetch(Config.serverUrl + '/api/files/read', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                dir: fileDir,
                                filename: fileName
                            })
                        });
                        var j = await r.json();
                        if (j.content !== undefined) {
                            Preview.show({
                                name: fileName,
                                content: j.content
                            });
                        } else {
                            Preview.show({
                                name: fileName,
                                content: I18n.t('[Unable to read file]')
                            });
                        }
                    } catch (err) {
                        Preview.show({
                            name: fileName,
                            content: I18n.t('[Unable to read file]')
                        });
                    }
                    return;
                }

                try {
                    var r = await fetch(Config.serverUrl + '/api/files/read', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            dir: fileDir,
                            filename: fileName
                        })
                    });
                    var j = await r.json();
                    if (j.hex) {
                        Preview.show({
                            name: fileName,
                            content: j.content,
                            hex: true
                        });
                    } else {
                        Preview.show({
                            name: fileName,
                            content: j.content || I18n.t('[Unable to read file]')
                        });
                    }
                } catch (err) {
                    Preview.show({
                        name: fileName,
                        content: I18n.t('[Unable to read file]')
                    });
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