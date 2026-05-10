// FreeClaw - Send dialog
const SendDialog = {
    _selectedKeys: [],

    show: function() {
        this._selectedKeys = [];
        this._render();
    },

    _render: function() {
        var self = this;
        var body =
            '<div style="display:flex;gap:0;height:55vh;border:1px solid #ddd;border-radius:4px;overflow:hidden">' +
                '<div style="width:55%;overflow:auto;border-right:1px solid #eee" id="aiSendFileList"><div style="text-align:center;color:#999;padding:20px">Loading...</div></div>' +
                '<div style="width:45%;overflow:auto;padding:8px" id="aiSendSelectedList"><div style="color:#999;font-size:12px;text-align:center;padding:20px">-</div></div>' +
            '</div>' +
            '<div style="padding:8px 0;font-size:12px;color:#666"><span id="aiSendInfo">0 / 100K</span></div>';

        DialogStack.show('send', {
            title: null, body: body,
            buttons: [
                { text: I18n.t('Send'), id: 'aiSendSend', primary: true, onClick: function() { DialogStack.close(); self._doSend(); }},
                { text: I18n.t('Cancel'), id: 'aiSendCancel', onClick: function() { DialogStack.close(); } }
            ],
            onRender: async function() {
                var c = document.getElementById('aiDialog');
                if (c) { c.style.width = '750px'; c.style.maxWidth = '95%'; c.style.minHeight = '300px'; c.style.maxHeight = '85vh'; }
                await self._buildTree();
                self._bindEvents();
            }
        });
    },

    _buildTree: async function() {
        var self = this;
        var container = document.getElementById('aiSendFileList');
        var html = '';

        var dir = Config.mainDir;
        if (dir) {
            await FileService.loadDir(dir);
            var node = FileService.getTree(dir);
            if (node) {
                node._expanded = true;
                html += self._renderNode(dir, node, 0, true);
            }
        }

        container.innerHTML = html || '<div style="text-align:center;color:#999;padding:20px">No files</div>';
    },

    _renderNode: function(dir, node, depth, autoExpand) {
        var indent = depth * 16;
        var isDir = node.type === 'dir' || node.fileType === 'dir';
        if (isDir) {
            var collapsed = !node._expanded;
            var arrow = collapsed ? '▶' : '▼';
            var childrenHtml = '';
            if (!collapsed && node.children) {
                var self = this;
                childrenHtml = node.children.map(function(c) {
                    if (c.type === 'dir') {
                        var cd = c.fullPath || (dir.replace(/\\/g, '/').replace(/\/$/, '') + '/' + c.name);
                        return self._renderNode(cd, c, depth + 1, false);
                    } else {
                        return self._renderNode(dir, c, depth + 1, false);
                    }
                }).join('');
            }
            return '<div style="padding-left:' + indent + 'px">' +
                '<div class="ai-tree-folder" data-dir="' + Utils.escAttr(dir) + '" data-depth="' + depth + '" style="display:flex;align-items:center;gap:4px;padding:3px 4px;cursor:pointer;font-size:12px">' +
                    '<input type="checkbox" class="ai-send-cb ai-folder-cb" data-dir="' + Utils.escAttr(dir) + '" style="width:13px;height:13px;flex-shrink:0">' +
                    '<span class="ai-tree-arrow">' + arrow + '</span>📁 ' + Utils.esc(getShortName(node.name || dir)) +
                '</div>' +
                '<div class="ai-tree-children" style="display:' + (collapsed ? 'none' : 'block') + '">' + childrenHtml + '</div>' +
                '</div>';
        } else {
            var ft = node.fileType || 'original';
            var icon = ft === 'ai' ? '🤖' : (ft === 'user' ? '✏️' : '📄');
            return '<div class="ai-send-file" data-name="' + Utils.escAttr(node.name) + '" data-dir="' + Utils.escAttr(node.workDir || dir) + '" data-size="' + (node.size || 0) + '" style="padding-left:16px;display:flex;align-items:center;gap:4px;padding-top:3px;padding-bottom:3px;cursor:pointer;font-size:12px">' +
                '<input type="checkbox" class="ai-send-cb ai-file-cb" data-dir="' + Utils.escAttr(node.workDir || dir) + '" data-name="' + Utils.escAttr(node.name) + '" style="width:13px;height:13px;flex-shrink:0">' +
                icon + ' ' + Utils.esc(getShortName(node.name)) +
            '</div>';
        }
    },

    _bindEvents: function() {
        var self = this;
        var left = document.getElementById('aiSendFileList');
        if (!left || left._sendBound) return;
        left._sendBound = true;

        left.addEventListener('click', async function(e) {
            var cb = e.target.tagName === 'INPUT' ? e.target : null;
            if (cb && cb.classList.contains('ai-folder-cb')) {
                var dir = cb.dataset.dir;
                if (cb.checked) self._selectDir(dir); else self._deselectDir(dir);
                self._updateAll(); return;
            }
            if (cb && cb.classList.contains('ai-file-cb')) {
                var key = cb.dataset.dir + '|' + cb.dataset.name;
                if (cb.checked) { if (self._selectedKeys.indexOf(key) === -1) self._selectedKeys.push(key); }
                else { var idx = self._selectedKeys.indexOf(key); if (idx >= 0) self._selectedKeys.splice(idx, 1); }
                self._updateAll(); return;
            }

            var folder = e.target.closest('.ai-tree-folder');
            if (folder) {
                var dir = folder.dataset.dir;
                var depth = parseInt(folder.dataset.depth || 0);
                var children = folder.parentElement.querySelector('.ai-tree-children');
                if (!children) return;
                if (children.style.display === 'none' || !children.style.display) {
                    children.innerHTML = '<div style="padding:10px;text-align:center;color:#999;font-size:11px">Loading...</div>';
                    children.style.display = 'block';
                    folder.querySelector('.ai-tree-arrow').textContent = '▼';
                    try {
                        await FileService.loadDir(dir);
                        var node = FileService.getTree(dir);
                        if (node && node.children) {
                            var childDepth = depth + 1;
                            children.innerHTML = node.children.map(function(c) {
                                if (c.type === 'dir') {
                                    var cd = c.fullPath || (dir.replace(/\\/g, '/').replace(/\/$/, '') + '/' + c.name);
                                    return self._renderNode(cd, c, childDepth, false);
                                } else {
                                    return self._renderNode(dir, c, childDepth, false);
                                }
                            }).join('');
                        }
                    } catch (err) {
                        children.innerHTML = '<div style="padding:10px;text-align:center;color:#dc3545;font-size:11px">Error</div>';
                    }
                    self._updateAll();
                } else {
                    children.style.display = 'none';
                    folder.querySelector('.ai-tree-arrow').textContent = '▶';
                }
            }
        });
    },

    _selectDir: function(dir) {
        var self = this;
        var node = FileService.getTree(dir);
        if (!node || !node.children) return;
        node.children.forEach(function(c) {
            if (c.type === 'dir') self._selectDir((dir.replace(/\\/g, '/').replace(/\/$/, '') + '/' + c.name));
            else { var k = dir + '|' + c.name; if (self._selectedKeys.indexOf(k) === -1) self._selectedKeys.push(k); }
        });
    },

    _deselectDir: function(dir) {
        var self = this;
        var node = FileService.getTree(dir);
        if (!node || !node.children) return;
        node.children.forEach(function(c) {
            if (c.type === 'dir') self._deselectDir((dir.replace(/\\/g, '/').replace(/\/$/, '') + '/' + c.name));
            else { var k = dir + '|' + c.name; var idx = self._selectedKeys.indexOf(k); if (idx >= 0) self._selectedKeys.splice(idx, 1); }
        });
    },

    _getDirKeys: function(dir) {
        var r = [];
        var node = FileService.getTree(dir);
        if (!node || !node.children) return r;
        var self = this;
        node.children.forEach(function(c) {
            if (c.type === 'dir') r = r.concat(self._getDirKeys(dir.replace(/\\/g, '/').replace(/\/$/, '') + '/' + c.name));
            else r.push(dir + '|' + c.name);
        });
        return r;
    },

    _updateAll: function() {
        var self = this;
        var total = 0;
        for (var i = 0; i < this._selectedKeys.length; i++) {
            var p = this._selectedKeys[i].split('|'), n = p.slice(1).join('|');
            var f = FileService.getFileByName(n);
            if (f && f.size) total += f.size;
        }
        var info = document.getElementById('aiSendInfo');
        info.textContent = this._selectedKeys.length + ' files / ' + formatSize(total) + ' / 100K';
        info.style.color = total > 100000 ? '#dc3545' : '#666';

        document.querySelectorAll('.ai-folder-cb').forEach(function(cb) {
            var d = cb.dataset.dir;
            var all = self._getDirKeys(d);
            if (!all.length) { cb.checked = false; cb.indeterminate = false; return; }
            var cnt = 0;
            all.forEach(function(k) { if (self._selectedKeys.indexOf(k) !== -1) cnt++; });
            cb.checked = cnt === all.length;
            cb.indeterminate = cnt > 0 && cnt < all.length;
        });

        document.querySelectorAll('.ai-file-cb').forEach(function(cb) {
            var k = cb.dataset.dir + '|' + cb.dataset.name;
            cb.checked = self._selectedKeys.indexOf(k) !== -1;
        });

        var sel = document.getElementById('aiSendSelectedList');
        if (this._selectedKeys.length === 0) {
            sel.innerHTML = '<div style="color:#999;font-size:12px;text-align:center;padding:20px">-</div>';
            return;
        }
        var h = '';
        this._selectedKeys.forEach(function(k) {
            var p = k.split('|'), n = p.slice(1).join('|');
            var f = FileService.getFileByName(n);
            var icon = f && f.fileType === 'ai' ? '🤖' : (f && f.fileType === 'user' ? '✏️' : '📄');
            h += '<div class="ai-sel-tag" data-key="' + Utils.escAttr(k) + '" style="display:inline-flex;align-items:center;gap:4px;padding:4px 8px;background:#e3f2fd;border-radius:4px;font-size:11px;cursor:pointer;margin:3px" title="' + Utils.escAttr(n) + '">' + icon + ' ' + Utils.esc(getShortName(n)) + '<span style="margin-left:4px;color:#999">✕</span></div>';
        });
        sel.innerHTML = h;
        sel.querySelectorAll('.ai-sel-tag').forEach(function(tag) {
            tag.onclick = function() {
                var k = tag.dataset.key;
                var idx = self._selectedKeys.indexOf(k);
                if (idx >= 0) self._selectedKeys.splice(idx, 1);
                self._updateAll();
            };
        });
    },

    _doSend: async function() {
        if (!this._selectedKeys.length) return;
        var msg = '';
        if (Config.workDirs && Config.workDirs.length > 0) msg += '## ' + Config.mainDir + '\n\n';
        var total = 0;
        for (var i = 0; i < this._selectedKeys.length; i++) {
            var p = this._selectedKeys[i].split('|'), dir = p[0], name = p.slice(1).join('|');
            try {
                var r = await Api.readFile(dir, name);
                var content = r.content || '';
                total += content.length;
                if (total > 100000) { Toast.show(I18n.t('Content exceeds limit ({0}/100000)', total), 'error'); return; }
                msg += '## ' + name + '\n```\n' + content + '\n```\n\n';
            } catch (e) {}
        }
        var editor = Sender._findEditor();
        if (editor) { editor.value = msg; editor.dispatchEvent(new Event('input', { bubbles: true })); editor.focus(); }
    }
};

function formatSize(bytes) {
    if (!bytes) return '0B';
    if (bytes < 1024) return bytes + 'B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + 'K';
    return (bytes / 1048576).toFixed(1) + 'M';
}