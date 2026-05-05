// FreeClaw - Sync dialog (file tree + preview + selection + send to AI)
const SyncDialog = {
    _selectedFiles: [],

    show: function() {
        this._selectedFiles = [];
        this._render();
    },

    _render: function() {
        var self = this;
        var dirs = FileService.getRootDirs();
        var treeHtml = '';
        dirs.forEach(function(dir) {
            var node = FileService.getTree(dir);
            if (!node) return;
            treeHtml += self._renderTree(dir, node, 0);
        });

        var body =
            '<div style="display:flex;gap:0;height:60vh;border:1px solid #ddd;border-radius:4px;overflow:hidden">' +
                '<div id="aiSyncLeft" style="width:300px;overflow:auto;border-right:1px solid #eee;position:relative;user-select:none">' +
                    treeHtml +
                '</div>' +
                '<div style="flex:1;display:flex;flex-direction:column">' +
                    '<div style="padding:4px 10px;background:#f5f5f5;border-bottom:1px solid #eee;font-size:11px;color:#888">' + I18n.t('Preview') + '</div>' +
                    '<textarea id="aiSyncPreview" readonly style="flex:1;padding:10px;border:none;outline:none;resize:none;font-family:monospace;font-size:12px;line-height:1.5;white-space:pre;background:#1e1e1e;color:#d4d4d4"></textarea>' +
                '</div>' +
            '</div>' +
            '<div class="ai-sync-bottom">' +
                '<span class="ai-sync-info" id="aiSyncInfo">0 / 100000</span>' +
            '</div>';

        DialogStack.show('sync', {
            title: null,
            body: body,
            buttons: [
                { text: I18n.t('Sync'), id: 'aiSyncSend', primary: true, onClick: function() {
                    DialogStack.close();
                    SyncDialog._sendToAI();
                }},
                { text: I18n.t('Cancel'), id: 'aiSyncCancel', onClick: function() { DialogStack.close(); } }
            ],
            onRender: function() {
                SyncDialog._initSelection();
                SyncDialog._bindTreeClick();
            }
        });
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
                    var icon = '📄';
                    if (ft === 'ai') icon = '🤖';
                    else if (ft === 'user') icon = '✏️';
                    var cls = 'ai-sync-file';
                    if (ft === 'ai') cls += ' ai-ai-file';
                    html += '<div class="' + cls + '" data-name="' + Utils.escAttr(child.name) + '" data-dir="' + Utils.escAttr(child.workDir || dir) +
                        '" data-filetype="' + Utils.escAttr(ft) + '" style="padding-left:' + (indent + 16) + 'px;display:flex;align-items:center;gap:4px;padding:4px 8px;cursor:pointer;font-size:12px">' +
                        '<span class="ai-tree-icon">' + icon + '</span>' +
                        '<span class="ai-tree-name" style="padding-left:2px">' + Utils.esc(getShortName(child.name)) + '</span></div>';
                }
            });
        }
        html += '</div>';
        return html;
    },

    _initSelection: function() {
        var self = this;
        var leftPanel = document.getElementById('aiSyncLeft');
        var selectBox = null;
        var startX, startY;

        leftPanel.addEventListener('mousedown', function(e) {
            if (e.target.closest('.ai-tree-folder') || e.target.closest('.ai-tree-arrow')) return;
            var fileEl = e.target.closest('.ai-sync-file');
            if (!fileEl) {
                selectBox = document.createElement('div');
                selectBox.className = 'ai-select-box';
                selectBox.style.left = e.clientX + 'px';
                selectBox.style.top = e.clientY + 'px';
                document.body.appendChild(selectBox);
                startX = e.clientX;
                startY = e.clientY;
            }
        });

        document.addEventListener('mousemove', function(e) {
            if (!selectBox) return;
            var left = Math.min(startX, e.clientX);
            var top = Math.min(startY, e.clientY);
            var width = Math.abs(e.clientX - startX);
            var height = Math.abs(e.clientY - startY);
            selectBox.style.left = left + 'px';
            selectBox.style.top = top + 'px';
            selectBox.style.width = width + 'px';
            selectBox.style.height = height + 'px';
        });

        document.addEventListener('mouseup', function(e) {
            if (!selectBox) return;
            var rect = selectBox.getBoundingClientRect();
            leftPanel.querySelectorAll('.ai-sync-file').forEach(function(file) {
                var fileRect = file.getBoundingClientRect();
                if (fileRect.left < rect.right && fileRect.right > rect.left &&
                    fileRect.top < rect.bottom && fileRect.bottom > rect.top) {
                    self._toggleFile(file);
                }
            });
            selectBox.remove();
            selectBox = null;
            self._updateCount();
        });
    },

    _bindTreeClick: function() {
        var self = this;
        var leftPanel = document.getElementById('aiSyncLeft');

        leftPanel.addEventListener('click', async function(e) {
            var folder = e.target.closest('.ai-tree-folder');
            if (folder) {
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
                                var icon = '📄';
                                if (ft === 'ai') icon = '🤖';
                                else if (ft === 'user') icon = '✏️';
                                var cls = 'ai-sync-file';
                                if (ft === 'ai') cls += ' ai-ai-file';
                                html += '<div class="' + cls + '" data-name="' + Utils.escAttr(child.name) + '" data-dir="' + Utils.escAttr(child.workDir || dir) +
                                    '" data-filetype="' + Utils.escAttr(ft) + '" style="padding-left:' + (parentIndent + 16) + 'px;display:flex;align-items:center;gap:4px;padding:4px 8px;cursor:pointer;font-size:12px">' +
                                    '<span class="ai-tree-icon">' + icon + '</span>' +
                                    '<span class="ai-tree-name" style="padding-left:2px">' + Utils.esc(getShortName(child.name)) + '</span></div>';
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

            var fileEl = e.target.closest('.ai-sync-file');
            if (fileEl && !e.ctrlKey && !e.metaKey) {
                self._selectedFiles = [];
                leftPanel.querySelectorAll('.ai-sync-file').forEach(function(f) { f.style.background = ''; });
            }
            if (fileEl) {
                self._toggleFile(fileEl);
                self._updateCount();
                var fileName = fileEl.dataset.name;
                var fileDir = fileEl.dataset.dir;
                var file = FileService.getFileByName(fileName);
                if (file && file.content) {
                    document.getElementById('aiSyncPreview').value = file.content;
                } else {
                    document.getElementById('aiSyncPreview').value = '';
                }
            }
        });
    },

    _toggleFile: function(fileEl) {
        var key = fileEl.dataset.dir + '|' + fileEl.dataset.name;
        var idx = this._selectedFiles.indexOf(key);
        if (idx >= 0) {
            this._selectedFiles.splice(idx, 1);
            fileEl.style.background = '';
        } else {
            this._selectedFiles.push(key);
            fileEl.style.background = '#e3f2fd';
        }
    },

    _updateCount: function() {
        var info = document.getElementById('aiSyncInfo');
        if (!info) return;
        info.textContent = this._selectedFiles.length + ' / 100000';
        if (this._selectedFiles.length > 100000) {
            info.classList.add('warning');
        } else {
            info.classList.remove('warning');
        }
    },

    _sendToAI: function() {
        if (!this._selectedFiles.length) return;
        var msg = '';
        var totalChars = 0;
        var self = this;

        this._selectedFiles.forEach(function(key) {
            var parts = key.split('|');
            var dir = parts[0];
            var name = parts.slice(1).join('|');
            var file = FileService.getFileByName(name);
            if (!file || !file.content) return;
            var content = file.content;
            totalChars += content.length;
            msg += '## ' + name + '\n```\n' + content + '\n```\n\n';
        });

        if (totalChars > 100000) {
            Toast.show(I18n.t('Content exceeds limit ({0}/100000)', totalChars), 'error');
            return;
        }

        var editor = Sender._findEditor();
        if (editor) {
            editor.value = msg;
            editor.dispatchEvent(new Event('input', { bubbles: true }));
            editor.focus();
        }
    }
};