// FreeClaw - Send dialog (check files and send to AI)
const SendDialog = {
    _selectedKeys: [],
    _loadedDirs: {},

    show: function() {
        this._selectedKeys = [];
        this._loadedDirs = {};
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
            '<div style="display:flex;gap:0;height:55vh;border:1px solid #ddd;border-radius:4px;overflow:hidden">' +
                '<div style="width:55%;overflow:auto;border-right:1px solid #eee" id="aiSendFileList">' + treeHtml + '</div>' +
                '<div style="width:45%;overflow:auto;padding:8px;display:flex;flex-wrap:wrap;align-content:flex-start;gap:6px" id="aiSendSelectedList">' +
                    '<div style="color:#999;font-size:12px;width:100%;text-align:center;padding:20px">-</div>' +
                '</div>' +
            '</div>' +
            '<div style="padding:8px 0;display:flex;align-items:center;font-size:12px;color:#666">' +
                '<span id="aiSendInfo">0 files / 0B / ' + formatNum(100000) + ' limit</span>' +
            '</div>';

        DialogStack.show('send', {
            title: null,
            body: body,
            buttons: [
                { text: I18n.t('Send'), id: 'aiSendSend', primary: true, onClick: function() { DialogStack.close(); self._doSend(); }},
                { text: I18n.t('Cancel'), id: 'aiSendCancel', onClick: function() { DialogStack.close(); } }
            ],
            onRender: function() {
                var container = document.getElementById('aiDialog');
                if (container) { container.style.width = '750px'; container.style.maxWidth = '95%'; container.style.minHeight = '300px'; container.style.maxHeight = '85vh'; }
                self._bindTreeClick();
                self._updateAllCheckboxes();
            }
        });
    },

    _renderTree: function(dir, node, depth) {
        var indent = depth * 14;
        var collapsed = !node._expanded;
        var arrow = collapsed ? '▶' : '▼';
        var display = collapsed ? 'none' : 'block';

        var dirsHtml = '';
        var filesHtml = '';
        if (!collapsed && node.children) {
            var self = this;
            node.children.forEach(function(child) {
                if (child.type === 'dir') {
                    var cd = child.fullPath || (dir.replace(/\\/g, '/').replace(/\/$/, '') + '/' + child.name);
                    var cn = FileService.getTree(cd);
                    if (cn) { dirsHtml += self._renderTree(cd, cn, depth + 1); }
                    else { dirsHtml += '<div><div class="ai-tree-folder" data-dir="' + Utils.escAttr(cd) + '" style="display:flex;align-items:center;gap:4px;padding:3px 4px;cursor:pointer;font-size:12px"><input type="checkbox" class="ai-send-cb ai-folder-cb" data-dir="' + Utils.escAttr(cd) + '" style="width:13px;height:13px;flex-shrink:0;cursor:pointer"><span class="ai-tree-arrow">▶</span><span class="ai-tree-icon">📁</span>' + Utils.esc(getShortName(child.name)) + '</div><div class="ai-tree-children" style="display:none"></div></div>'; }
                } else {
                    var ft = child.fileType || 'original';
                    var icon = '📄'; if (ft === 'ai') icon = '🤖'; else if (ft === 'user') icon = '✏️';
                    filesHtml += '<div class="ai-send-file" data-name="' + Utils.escAttr(child.name) + '" data-dir="' + Utils.escAttr(child.workDir || dir) + '" data-size="' + (child.size || 0) + '" style="display:flex;align-items:center;gap:4px;padding:3px 4px;cursor:pointer;font-size:12px"><input type="checkbox" class="ai-send-cb ai-file-cb" data-dir="' + Utils.escAttr(child.workDir || dir) + '" data-name="' + Utils.escAttr(child.name) + '" style="width:13px;height:13px;flex-shrink:0;cursor:pointer"><span class="ai-tree-icon">' + icon + '</span><span class="ai-tree-name">' + Utils.esc(getShortName(child.name)) + '</span></div>';
                }
            });
        }

        var html = '<div style="padding-left:' + indent + 'px">' +
            '<div class="ai-tree-folder" data-dir="' + Utils.escAttr(dir) + '" style="display:flex;align-items:center;gap:4px;padding:3px 4px;cursor:pointer;font-size:12px">' +
                '<input type="checkbox" class="ai-send-cb ai-folder-cb" data-dir="' + Utils.escAttr(dir) + '" style="width:13px;height:13px;flex-shrink:0;cursor:pointer">' +
                '<span class="ai-tree-arrow">' + arrow + '</span><span class="ai-tree-icon">📁</span>' +
                '<span class="ai-tree-name">' + Utils.esc(getShortName(node.name)) + '</span>' +
            '</div>' +
            '<div class="ai-tree-children" style="display:' + display + '">' +
                dirsHtml + filesHtml +
            '</div>' +
            '</div>';
        return html;
    },

    _bindTreeClick: function() {
        var self = this;
        var left = document.getElementById('aiSendFileList');
        left.addEventListener('click', async function(e) {
            var folder = e.target.closest('.ai-tree-folder');
            if (folder) {
                if (e.target.tagName === 'INPUT') {
                    var cb = e.target; var dir = cb.dataset.dir;
                    if (cb.checked) { self._selectDir(dir); } else { self._deselectDir(dir); }
                    self._updateAllCheckboxes(); self._updateCount(); self._renderSelectedList();
                    return;
                }
                var dir = folder.dataset.dir, children = folder.parentElement.querySelector('.ai-tree-children');
                if (!children) return;
                if (children.style.display === 'none' || !children.style.display) {
                    if (!FileService.isDirLoaded(dir)) await FileService.loadDir(dir);
                    var node = FileService.getTree(dir);
                    if (node && node.children) {
                        var diHtml = '', fiHtml = '';
                        node.children.forEach(function(c) {
                            if (c.type === 'dir') {
                                var cd = c.fullPath || (dir.replace(/\\/g, '/').replace(/\/$/, '') + '/' + c.name);
                                var cn = FileService.getTree(cd);
                                if (cn) { diHtml += self._renderTree(cd, cn, 0); }
                                else { diHtml += '<div><div class="ai-tree-folder" data-dir="' + Utils.escAttr(cd) + '" style="display:flex;align-items:center;gap:4px;padding:3px 4px;cursor:pointer;font-size:12px"><input type="checkbox" class="ai-send-cb ai-folder-cb" data-dir="' + Utils.escAttr(cd) + '" style="width:13px;height:13px;flex-shrink:0;cursor:pointer"><span class="ai-tree-arrow">▶</span><span class="ai-tree-icon">📁</span>' + Utils.esc(getShortName(c.name)) + '</div><div class="ai-tree-children" style="display:none"></div></div>'; }
                            } else {
                                var ft = c.fileType || 'original', icon = '📄'; if (ft === 'ai') icon = '🤖'; else if (ft === 'user') icon = '✏️';
                                fiHtml += '<div class="ai-send-file" data-name="' + Utils.escAttr(c.name) + '" data-dir="' + Utils.escAttr(c.workDir || dir) + '" data-size="' + (c.size || 0) + '" style="display:flex;align-items:center;gap:4px;padding:3px 4px;cursor:pointer;font-size:12px"><input type="checkbox" class="ai-send-cb ai-file-cb" data-dir="' + Utils.escAttr(c.workDir || dir) + '" data-name="' + Utils.escAttr(c.name) + '" style="width:13px;height:13px;flex-shrink:0;cursor:pointer"><span class="ai-tree-icon">' + icon + '</span><span class="ai-tree-name">' + Utils.esc(getShortName(c.name)) + '</span></div>';
                            }
                        });
                        children.innerHTML = diHtml + fiHtml;
                    }
                    children.style.display = 'block'; folder.querySelector('.ai-tree-arrow').textContent = '▼';
                    self._loadedDirs[dir] = true; self._updateAllCheckboxes();
                } else { children.style.display = 'none'; folder.querySelector('.ai-tree-arrow').textContent = '▶'; }
                return;
            }
            if (e.target.tagName === 'INPUT' && e.target.classList.contains('ai-file-cb')) {
                var cb = e.target; var key = cb.dataset.dir + '|' + cb.dataset.name;
                if (cb.checked) { if (self._selectedKeys.indexOf(key) === -1) self._selectedKeys.push(key); cb.closest('.ai-send-file').style.background = '#e3f2fd'; }
                else { var idx = self._selectedKeys.indexOf(key); if (idx >= 0) self._selectedKeys.splice(idx, 1); cb.closest('.ai-send-file').style.background = ''; }
                self._updateAllCheckboxes(); self._updateCount(); self._renderSelectedList();
            }
        });
    },

    _selectDir: function(dir) { var self = this; var node = FileService.getTree(dir); if (!node || !node.children) return; node.children.forEach(function(c) { if (c.type === 'dir') { self._selectDir(dir.replace(/\\/g, '/').replace(/\/$/, '') + '/' + c.name); } else { var key = dir + '|' + c.name; if (self._selectedKeys.indexOf(key) === -1) self._selectedKeys.push(key); } }); },
    _deselectDir: function(dir) { var self = this; var node = FileService.getTree(dir); if (!node || !node.children) return; node.children.forEach(function(c) { if (c.type === 'dir') { self._deselectDir(dir.replace(/\\/g, '/').replace(/\/$/, '') + '/' + c.name); } else { var key = dir + '|' + c.name; var idx = self._selectedKeys.indexOf(key); if (idx >= 0) self._selectedKeys.splice(idx, 1); } }); },
    _getDirFiles: function(dir) { var result = []; var node = FileService.getTree(dir); if (!node || !node.children) return result; var self = this; node.children.forEach(function(c) { if (c.type === 'dir') { result = result.concat(self._getDirFiles(dir.replace(/\\/g, '/').replace(/\/$/, '') + '/' + c.name)); } else { result.push(dir + '|' + c.name); } }); return result; },

    _updateAllCheckboxes: function() {
        var self = this;
        document.querySelectorAll('.ai-folder-cb').forEach(function(cb) { var dir = cb.dataset.dir; var allKeys = self._getDirFiles(dir); if (!allKeys.length) { cb.checked = false; cb.indeterminate = false; return; } var cnt = 0; allKeys.forEach(function(k) { if (self._selectedKeys.indexOf(k) !== -1) cnt++; }); cb.checked = cnt === allKeys.length; cb.indeterminate = cnt > 0 && cnt < allKeys.length; });
        document.querySelectorAll('.ai-file-cb').forEach(function(cb) { var key = cb.dataset.dir + '|' + cb.dataset.name; cb.checked = self._selectedKeys.indexOf(key) !== -1; cb.closest('.ai-send-file').style.background = cb.checked ? '#e3f2fd' : ''; });
    },

    _renderSelectedList: function() {
        var container = document.getElementById('aiSendSelectedList'); if (!container) return;
        if (!this._selectedKeys.length) { container.innerHTML = '<div style="color:#999;font-size:12px;width:100%;text-align:center;padding:20px">-</div>'; return; }
        var self = this; var html = '';
        this._selectedKeys.forEach(function(k) { var parts = k.split('|'), name = parts.slice(1).join('|'); var f = FileService.getFileByName(name); var icon = '📄'; if (f && f.fileType === 'ai') icon = '🤖'; else if (f && f.fileType === 'user') icon = '✏️'; html += '<div class="ai-sel-tag" data-key="' + Utils.escAttr(k) + '" style="display:flex;align-items:center;gap:4px;padding:4px 8px;background:#e3f2fd;border-radius:4px;font-size:11px;cursor:pointer" title="' + Utils.escAttr(name) + '">' + icon + ' ' + Utils.esc(getShortName(name)) + '<span style="margin-left:4px;color:#999">✕</span></div>'; });
        container.innerHTML = html;
        container.querySelectorAll('.ai-sel-tag').forEach(function(tag) { tag.onclick = function() { var key = tag.dataset.key; var idx = self._selectedKeys.indexOf(key); if (idx >= 0) self._selectedKeys.splice(idx, 1); self._updateAllCheckboxes(); self._updateCount(); self._renderSelectedList(); }; });
    },

    _updateCount: function() {
        var info = document.getElementById('aiSendInfo'); if (!info) return;
        var totalSize = 0;
        for (var i = 0; i < this._selectedKeys.length; i++) { var parts = this._selectedKeys[i].split('|'), name = parts.slice(1).join('|'); var f = FileService.getFileByName(name); if (f && f.size) totalSize += f.size; }
        info.textContent = this._selectedKeys.length + ' files / ' + formatSize(totalSize) + ' / ' + formatNum(100000) + ' limit';
        info.style.color = totalSize > 100000 ? '#dc3545' : '#666';
    },

    _doSend: async function() {
        if (!this._selectedKeys.length) return;
        var msg = ''; if (Config.workDirs && Config.workDirs.length > 0) { msg += '## ' + Config.mainDir + '\n\n'; }
        var total = 0;
        for (var i = 0; i < this._selectedKeys.length; i++) { var parts = this._selectedKeys[i].split('|'), dir = parts[0], name = parts.slice(1).join('|'); try { var result = await Api.readFile(dir, name); var content = result.content || ''; total += content.length; if (total > 100000) { Toast.show(I18n.t('send.overLimit', total, '100000'), 'error'); return; } msg += '## ' + name + '\n```\n' + content + '\n```\n\n'; } catch (e) {} }
        if (!msg.trim()) return;
        var editor = Sender._findEditor(); if (editor) { editor.value = msg; editor.dispatchEvent(new Event('input', { bubbles: true })); editor.focus(); }
    }
};

function formatSize(bytes) { if (!bytes) return '0B'; if (bytes < 1024) return bytes + 'B'; if (bytes < 1048576) return (bytes / 1024).toFixed(1) + 'K'; return (bytes / 1048576).toFixed(1) + 'M'; }
function formatNum(n) { if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'; if (n >= 1000) return (n / 1000).toFixed(1) + 'K'; return '' + n; }