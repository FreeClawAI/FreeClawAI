// FreeClaw - File tree UI rendering (lazy loading)
const FileTree = {
    async refresh() { await FileService.refreshAndRender(); },

    async _restoreState() {
        var state = await DB.getState();
        if (state && state.inputText) document.getElementById('aiInput').value = state.inputText;
    },
    async saveState() {
        await DB.saveState({ workDir: FileService.getActiveDir(), inputText: document.getElementById('aiInput').value });
    },

    render: function() {
        var container = document.getElementById('aiFileList');
        if (!container) return;
        var html = '';
        var dirs = FileService.getRootDirs();
        var self = this;
        dirs.forEach(function(dir) {
            var node = FileService.getTree(dir);
            if (!node) return;
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
            '<span class="ai-tree-arrow">' + arrow + '</span><span class="ai-tree-icon">📁</span>' +
            '<span class="ai-tree-name">' + Utils.esc(getShortName(node.name)) + '</span></div>' +
            '<div class="ai-tree-children" style="display:' + display + '">';
        if (!collapsed && node.children) {
            node.children.forEach(function(child) {
                if (child.type === 'dir') {
                    var childDir = child.fullPath || (dir.replace(/\\/g, '/').replace(/\/$/, '') + '/' + child.name);
                    var childNode = FileService.getTree(childDir);
                    if (childNode) {
                        html += self._renderTree(childDir, childNode, depth + 1);
                    } else {
                        html += '<div class="ai-tree-folder" data-dir="' + Utils.escAttr(childDir) + '" style="padding-left:' + (indent + 16) + 'px">' +
                            '<span class="ai-tree-arrow">▶</span><span class="ai-tree-icon">📁</span>' + Utils.esc(getShortName(child.name)) +
                            '</div><div class="ai-tree-children" style="display:none"></div>';
                    }
                } else {
                    var ft = child.fileType || 'original';
                    var icon = '';
                    if (ft === 'ai') icon = '🤖';
                    else if (ft === 'user') icon = '✏️';
                    var cls = 'ai-tree-file';
                    if (ft === 'ai') cls += ' ai-ai-file';
                    var displayName = getShortName(child.name);
                    if (child.range) {
                        displayName += ' [' + child.range.start + ',' + child.range.end + ']';
                    }
                    var sizeStr = child.size ? ' <span style="color:#999;font-size:11px">(' + self._formatSize(child.size) + ')</span>' : '';
                    html += '<div class="' + cls + '" data-name="' + Utils.escAttr(child.name) + '" data-dir="' + Utils.escAttr(child.workDir || dir) +
                        '" data-filetype="' + Utils.escAttr(ft) + '" data-fullpath="' + Utils.escAttr(child.fullPath || '') +
                        '" data-size="' + (child.size || 0) + '" style="padding-left:' + (indent + 16) + 'px">' +
                        (icon ? '<span class="ai-tree-icon">' + icon + '</span>' : '') +
                        '<span class="ai-tree-name"' + (icon ? '' : ' style="padding-left:20px"') + '>' + Utils.esc(displayName) + '</span>' + sizeStr + '</div>';
                }
            });
        }
        html += '</div>';
        return html;
    },

    _formatSize: function(bytes) {
        if (!bytes) return '';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
        return (bytes / 1073741824).toFixed(2) + ' GB';
    },

    _isMediaFile: function(name) {
        var ext = name.split('.').pop().toLowerCase();
        var mediaExts = ['png','jpg','jpeg','gif','svg','webp','ico','bmp',
                         'mp4','webm','avi','mov','mkv','mp3','wav','ogg','flac','aac',
                         'woff','woff2','ttf','eot','pdf','zip','tar','gz','rar','7z'];
        return mediaExts.indexOf(ext) !== -1;
    },

    _isPreviewableFile: function(name) {
        var ext = name.split('.').pop().toLowerCase();
        var binaryExts = ['png','jpg','jpeg','gif','svg','webp','ico','bmp',
                          'mp4','webm','avi','mov','mkv','mp3','wav','ogg','flac','aac',
                          'woff','woff2','ttf','eot','pdf','zip','tar','gz','rar','7z'];
        if (binaryExts.indexOf(ext) !== -1) return false;
        return true;
    },

    _openRaw: function(fileDir, fileName) {
        var absolutePath = fileDir.replace(/\\/g, '/').replace(/\/$/, '') + '/' + fileName;
        var rawUrl = Config.serverUrl + '/api/files/raw?path=' + encodeURIComponent(absolutePath);
        window.open(rawUrl, '_blank');
    },

    initEvents: function() {
        var container = document.getElementById('aiFileList');
        if (!container || container._eventsBound) return;
        container._eventsBound = true;
        var self = this;

        container.addEventListener('click', async function(e) {
            var folder = e.target.closest('.ai-tree-folder');
            if (folder) {
                e.stopPropagation();
                var dir = folder.dataset.dir;
                var childrenDiv = folder.nextElementSibling;
                if (!childrenDiv || !childrenDiv.classList.contains('ai-tree-children')) return;
                if (childrenDiv.style.display === 'none' || !childrenDiv.style.display) {
                    if (!FileService.isDirLoaded(dir)) await FileService.loadDir(dir);
                    var node = FileService.getTree(dir);
                    if (node && node.children) {
                        var html = '', parentIndent = parseInt(folder.style.paddingLeft || 0);
                        node.children.forEach(function(child) {
                            if (child.type === 'dir') {
                                var childDir = child.fullPath || (dir.replace(/\\/g, '/').replace(/\/$/, '') + '/' + child.name);
                                html += '<div class="ai-tree-folder" data-dir="' + Utils.escAttr(childDir) + '" style="padding-left:' + (parentIndent + 16) + 'px">' +
                                    '<span class="ai-tree-arrow">▶</span><span class="ai-tree-icon">📁</span>' + Utils.esc(getShortName(child.name)) +
                                    '</div><div class="ai-tree-children" style="display:none"></div>';
                            } else {
                                var ft = child.fileType || 'original';
                                var icon = '';
                                if (ft === 'ai') icon = '🤖';
                                else if (ft === 'user') icon = '✏️';
                                var displayName = getShortName(child.name);
                                if (child.range) {
                                    displayName += ' [' + child.range.start + ',' + child.range.end + ']';
                                }
                                var sizeStr = child.size ? ' <span style="color:#999;font-size:11px">(' + self._formatSize(child.size) + ')</span>' : '';
                                html += '<div class="ai-tree-file' + (ft === 'ai' ? ' ai-ai-file' : '') + '" data-name="' + Utils.escAttr(child.name) +
                                    '" data-dir="' + Utils.escAttr(child.workDir || dir) + '" data-filetype="' + Utils.escAttr(ft) +
                                    '" data-fullpath="' + Utils.escAttr(child.fullPath || '') + '" data-size="' + (child.size || 0) +
                                    '" style="padding-left:' + (parentIndent + 16) + 'px">' +
                                    (icon ? '<span class="ai-tree-icon">' + icon + '</span>' : '') +
                                    '<span class="ai-tree-name"' + (icon ? '' : ' style="padding-left:20px"') + '>' + Utils.esc(displayName) + '</span>' + sizeStr + '</div>';
                            }
                        });
                        childrenDiv.innerHTML = html;
                    }
                    childrenDiv.style.display = 'block';
                    var arrow = folder.querySelector('.ai-tree-arrow'); if (arrow) arrow.textContent = '▼';
                } else {
                    childrenDiv.style.display = 'none';
                    var arrow = folder.querySelector('.ai-tree-arrow'); if (arrow) arrow.textContent = '▶';
                }
                return;
            }

            var fileEl = e.target.closest('.ai-tree-file');
            if (fileEl) {
                var fileName = fileEl.dataset.name;
                var fileDir = fileEl.dataset.workDir || fileEl.dataset.dir;
                var fileSize = parseInt(fileEl.dataset.size) || 0;
                var fileType = fileEl.dataset.filetype || 'original';

                if (fileDir) FileService.setActiveDir(fileDir);

                if (self._isMediaFile(fileName)) {
                    self._openRaw(fileDir, fileName);
                    return;
                }

                if (fileSize > 10485760) {
                    Preview.show({
                        name: getShortName(fileName),
                        content: I18n.t('[File too large to preview]') + ' (' + self._formatSize(fileSize) + ')\n\n' + I18n.t('Opening in browser...')
                    });
                    self._openRaw(fileDir, fileName);
                    return;
                }

                if (!self._isPreviewableFile(fileName)) {
                    self._openRaw(fileDir, fileName);
                    return;
                }

                var file = FileService.getFileByName(fileName, fileType);
                if (!file) return;

                if (fileType === 'original') {
                    await self._loadContent(file, file.workDir || fileDir);
                    Editor.startEdit(file);
                    return;
                }

                if (fileType === 'ai') {
                    if (file.content) {
                        DiffDialog.show(fileName, file);
                    }
                    return;
                }

                if (fileType === 'user') {
                    if (file.content) {
                        Preview.show(file);
                        Editor.startEdit(file);
                    }
                    return;
                }
            }
        });

        container.addEventListener('contextmenu', function(e) {
            var target = e.target.closest('.ai-tree-file');
            if (!target) return;
            e.preventDefault();
            var name = target.dataset.name, file = FileService.getFileByName(name);
            var type = file ? file.fileType : 'original';
            ContextMenu.show(e, getShortName(name), type);
        });
    },

    _loadContent: async function(file, dir) {
        try {
            var result = await Api.readFile(dir, file.name);
            if (result.content !== undefined) { file.content = result.content; Preview.show(file); }
            else Preview.show({ name: getShortName(file.name), content: I18n.t('[Unable to read file]') });
        } catch (e) {
            Preview.show({ name: getShortName(file.name), content: I18n.t('[Unable to read file]') });
        }
    },

    getSelectedFiles: function() { return FileService.getAiFiles().map(function(f) { f._dir = Config.mainDir; return f; }); },
    getFileByName: function(name) { return FileService.getFileByName(name); },
    removeAiFile: function(name) { FileService.removeAiFile(name); this.render(); },
    removeUserFile: function(name) { FileService.removeUserFile(name); this.render(); },
    addUserFile: function(name, content) { FileService.addUserFile(name, content); this.render(); }
};