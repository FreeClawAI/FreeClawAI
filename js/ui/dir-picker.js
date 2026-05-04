// FreeClaw - Directory picker dialog (Windows-style)
var DirPicker = {
    _currentPath: '',
    _onSelect: null,
    _paths: {},

    show: function(currentPath, onSelect) {
        this._currentPath = currentPath || Config.mainDir || '';
        this._onSelect = onSelect;
        this._loadPaths().then(function() {
            DirPicker._render();
            DirPicker._navigate(DirPicker._currentPath);
        });
    },

    _loadPaths: async function() {
        try {
            var r = await fetch(Config.serverUrl + '/api/paths');
            if (r.ok) { var j = await r.json(); this._paths = j; }
        } catch (e) {
            this._paths = { desktop: '', documents: '', downloads: '', home: '', drives: [] };
        }
    },

    _render: function() {
        var self = this;

        var desktopPath = (typeof self._paths.desktop === 'string') ? self._paths.desktop : '';
        var documentsPath = (typeof self._paths.documents === 'string') ? self._paths.documents : '';
        var downloadsPath = (typeof self._paths.downloads === 'string') ? self._paths.downloads : '';

        var workDirs = Config.workDirs || [];
        var workDirsHtml = '';
        workDirs.forEach(function(d) {
            var dirName = String(d || '').split('\\').pop().split('/').pop() || d;
            workDirsHtml += '<div class="ai-picker-quick" data-path="' + Utils.escAttr(String(d || '')) + '" style="padding:6px 10px;cursor:pointer;font-size:12px;border-bottom:1px solid #f0f0f0" title="' + Utils.escAttr(String(d || '')) + '">📁 ' + Utils.esc(dirName) + '</div>';
        });

        var body =
            '<div class="ai-picker-path-bar"><div id="aiPickerBreadcrumb" style="flex:1;font-size:12px;overflow:hidden;white-space:nowrap"></div></div>' +
            '<div class="ai-picker-input-bar">' +
                '<span style="font-size:12px;margin-right:6px">' + I18n.t('Folder:') + '</span>' +
                '<input id="aiPickerPathInput" class="ai-dialog-input" value="' + Utils.escAttr(String(self._currentPath || '')) + '" style="flex:1">' +
                '<button id="aiPickerGoBtn" style="padding:5px 10px;border:1px solid #ccc;border-radius:4px;background:white;cursor:pointer">' + I18n.t('Go') + '</button>' +
            '</div>' +
            '<div class="ai-picker-body">' +
                '<div class="ai-picker-sidebar">' +
                    '<div style="padding:6px 10px;font-size:11px;color:#999;font-weight:bold">' + I18n.t('Workspace') + '</div>' +
                    workDirsHtml +
                    '<div style="padding:6px 10px;font-size:11px;color:#999;font-weight:bold;border-top:1px solid #eee">' + I18n.t('Quick access') + '</div>' +
                    '<div class="ai-picker-quick" data-path="' + Utils.escAttr(desktopPath) + '" style="padding:6px 10px;cursor:pointer;font-size:12px;border-bottom:1px solid #f0f0f0">🖥 ' + I18n.t('Desktop') + '</div>' +
                    '<div class="ai-picker-quick" data-path="' + Utils.escAttr(documentsPath) + '" style="padding:6px 10px;cursor:pointer;font-size:12px;border-bottom:1px solid #f0f0f0">📂 ' + I18n.t('Documents') + '</div>' +
                    '<div class="ai-picker-quick" data-path="' + Utils.escAttr(downloadsPath) + '" style="padding:6px 10px;cursor:pointer;font-size:12px;border-bottom:1px solid #f0f0f0">⬇ ' + I18n.t('Downloads') + '</div>' +
                    '<div class="ai-picker-quick" data-path="__drives__" style="padding:6px 10px;cursor:pointer;font-size:12px;border-bottom:1px solid #f0f0f0">💻 ' + I18n.t('This PC') + '</div>' +
                '</div>' +
                '<div class="ai-picker-main"><div id="aiPickerList" style="flex:1;overflow:auto;padding:4px"><div style="text-align:center;color:#999;padding:20px">' + I18n.t('Loading...') + '</div></div></div>' +
            '</div>';

        var footerHtml =
            '<div class="ai-dialog-footer">' +
                '<button id="aiPickerCancel" class="ai-dialog-btn" style="background:white;color:#333">' + I18n.t('Cancel') + '</button>' +
                '<button id="aiPickerConfirm" class="ai-dialog-btn primary" style="background:#007bff;color:white">' + I18n.t('Confirm') + '</button>' +
            '</div>';

        DialogStack.show('picker', {
            title: I18n.t('Select Folder'),
            body: body,
            footer: footerHtml,
            onRender: function() {
                var list = document.getElementById('aiPickerList');

                document.getElementById('aiPickerConfirm').onclick = function() {
                    var path = self._currentPath;
                    if (path === '__drives__') { Toast.show('Invalid path', 'error'); return; }
                    var selected = list.querySelector('.ai-picker-item.active');
                    if (selected && selected.dataset.fullpath) {
                        path = selected.dataset.fullpath;
                    }
                    if (self._onSelect) self._onSelect(path);
                    DialogStack.close();
                };
                document.getElementById('aiPickerCancel').onclick = function() {
                    DialogStack.close();
                };
                document.getElementById('aiPickerGoBtn').onclick = function() {
                    var p = document.getElementById('aiPickerPathInput').value.trim();
                    if (p) self._navigate(p);
                };
                document.getElementById('aiPickerPathInput').addEventListener('keydown', function(e) {
                    if (e.key === 'Enter') { var p = this.value.trim(); if (p) self._navigate(p); }
                });
                document.querySelectorAll('.ai-picker-quick').forEach(function(item) {
                    item.onclick = function() {
                        var path = this.dataset.path;
                        if (path === '__drives__') self._loadDrives();
                        else if (path) self._navigate(path);
                    };
                });
            }
        });
    },

    _getDirName: function(fullPath) {
        if (!fullPath) return '';
        var parts = fullPath.replace(/\\/g, '/').split('/').filter(Boolean);
        return parts[parts.length - 1] || fullPath;
    },

    _navigate: async function(dir) {
        if (!dir || typeof dir !== 'string') return;
        this._currentPath = dir.replace(/\\/g, '/');
        this._updatePathInput();
        this._renderBreadcrumb();
        var list = document.getElementById('aiPickerList');
        if (!list) return;
        list.innerHTML = '<div style="text-align:center;color:#999;padding:20px">' + I18n.t('Loading...') + '</div>';
        if (dir === '__drives__') { this._loadDrives(); return; }
        try {
            var r = await fetch(Config.serverUrl + '/api/files/list', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dir: dir, flat: true })
            });
            var j = await r.json();
            var files = j.files || [];
            var dirs = files.filter(function(f) { return f.isDir === true; });
            var html = '';
            if (dirs.length === 0) {
                html = '<div style="text-align:center;color:#999;padding:20px">' + I18n.t('No subfolders') + '</div>';
            } else {
                var self = this;
                dirs.forEach(function(d) {
                    var entryName = self._getDirName(d.fullPath || '');
                    html += '<div class="ai-picker-item" data-fullpath="' + Utils.escAttr(String(d.fullPath || '')) + '" style="padding:6px 8px;cursor:pointer;border-bottom:1px solid #f0f0f0">📁 ' + Utils.esc(entryName) + '</div>';
                });
            }
            list.innerHTML = html;
            var self = this;
            list.querySelectorAll('.ai-picker-item').forEach(function(item) {
                item.ondblclick = function() {
                    var fp = this.dataset.fullpath;
                    if (fp) self._navigate(fp);
                };
                item.onclick = function() {
                    list.querySelectorAll('.ai-picker-item').forEach(function(el) { el.classList.remove('active'); });
                    this.classList.add('active');
                };
            });
        } catch (e) {
            list.innerHTML = '<div style="text-align:center;color:#dc3545;padding:20px">❌ ' + I18n.t('Cannot connect. Start node server.js') + '</div>';
            Toast.show(I18n.t('Cannot connect. Start node server.js'), 'error');
        }
    },

    _loadDrives: function() {
        this._currentPath = '__drives__';
        var drives = this._paths.drives || [];
        var list = document.getElementById('aiPickerList');
        if (!list) return;
        var self = this;
        var html = '';
        drives.forEach(function(drive) {
            html += '<div class="ai-picker-item" data-fullpath="' + Utils.escAttr(String(drive || '')) + '" style="padding:6px 8px;cursor:pointer;border-bottom:1px solid #f0f0f0">💿 ' + Utils.esc(String(drive || '')) + '</div>';
        });
        if (!html) html = '<div style="text-align:center;color:#999;padding:20px">' + I18n.t('No subfolders') + '</div>';
        list.innerHTML = html;
        list.querySelectorAll('.ai-picker-item').forEach(function(item) {
            item.ondblclick = function() { self._navigate(this.dataset.fullpath); };
        });
    },

    _renderBreadcrumb: function() {
        var bc = document.getElementById('aiPickerBreadcrumb');
        if (!bc) return;
        var path = this._currentPath;
        if (path === '__drives__') { bc.innerHTML = '<strong>' + I18n.t('This PC') + '</strong>'; return; }
        var parts = path.replace(/\\/g, '/').split('/').filter(Boolean);
        var html = '';
        var current = '';
        var self = this;
        parts.forEach(function(part, i) {
            if (part.indexOf(':') !== -1) {
                current = part + '/';
            } else {
                current = current.replace(/\/$/, '') + '/' + part;
            }
            if (i === parts.length - 1) {
                html += '<strong>' + Utils.esc(part) + '</strong>';
            } else {
                html += '<span class="ai-breadcrumb-link" data-path="' + Utils.escAttr(current) + '" style="cursor:pointer;color:#007bff">' + Utils.esc(part) + '</span> &gt; ';
            }
        });
        bc.innerHTML = html;
        bc.querySelectorAll('.ai-breadcrumb-link').forEach(function(link) {
            link.onclick = function() { self._navigate(this.dataset.path); };
        });
    },

    _updatePathInput: function() {
        var input = document.getElementById('aiPickerPathInput');
        if (input) input.value = this._currentPath === '__drives__' ? '' : this._currentPath;
    }
};