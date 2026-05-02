// FreeClaw - Directory picker dialog
var DirPicker = {
    _currentPath: '',
    _onSelect: null,

    show: function(currentPath, onSelect) {
        this._currentPath = currentPath || Config.mainDir || '';
        this._onSelect = onSelect;
        this._render();
        this._navigate(this._currentPath);
    },

    _render: function() {
        var self = this;

        var html =
            '<div class="ai-picker-container">' +
                '<div class="ai-picker-header">' +
                    '<h3>' + I18n.t('Select Folder') + '</h3>' +
                '</div>' +
                '<div class="ai-picker-path-bar">' +
                    '<span style="font-size:12px;margin-right:6px">' + I18n.t('Folder:') + '</span>' +
                    '<input id="aiPickerPathInput" class="ai-dialog-input" value="' + Utils.escAttr(self._currentPath) + '" style="flex:1">' +
                    '<button id="aiPickerGoBtn" style="padding:5px 10px;border:1px solid #ccc;border-radius:4px;background:white;cursor:pointer">' + I18n.t('Go') + '</button>' +
                '</div>' +
                '<div class="ai-picker-body">' +
                    '<div id="aiPickerNav" style="padding:4px 8px;border-bottom:1px solid #eee;font-size:12px">' +
                        '<span class="ai-picker-up" style="cursor:pointer;color:#007bff">📁 ..</span>' +
                    '</div>' +
                    '<div id="aiPickerList" style="flex:1;overflow:auto;padding:4px">' +
                        '<div style="text-align:center;color:#999;padding:20px">' + I18n.t('Loading...') + '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="ai-picker-footer">' +
                    '<span id="aiPickerSelected" style="font-size:11px;color:#666;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + I18n.t('Selected') + ': ' + Utils.esc(self._currentPath) + '</span>' +
                    '<button id="aiPickerConfirm" class="ai-dialog-btn primary">' + I18n.t('Confirm') + '</button>' +
                    '<button id="aiPickerCancel" class="ai-dialog-btn">' + I18n.t('Cancel') + '</button>' +
                '</div>' +
            '</div>';

        Dialog.show(html);

        document.getElementById('aiPickerConfirm').onclick = function() {
            if (self._onSelect) self._onSelect(self._currentPath);
            Dialog.close();
        };
        document.getElementById('aiPickerCancel').onclick = function() { Dialog.close(); };
        document.getElementById('aiPickerGoBtn').onclick = function() {
            var p = document.getElementById('aiPickerPathInput').value.trim();
            if (p) self._navigate(p);
        };
        document.getElementById('aiPickerPathInput').addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                var p = this.value.trim();
                if (p) self._navigate(p);
            }
        });
        document.querySelector('.ai-picker-up').onclick = function() {
            if (self._currentPath) {
                var parts = self._currentPath.replace(/\\/g, '/').split('/').filter(Boolean);
                parts.pop();
                var parent = parts.join('/');
                if (parent && parent.indexOf(':') === -1) parent = self._currentPath.charAt(0) + ':\\';
                self._navigate(parent || self._currentPath.charAt(0) + ':\\');
            }
        };

        if (this._currentPath.match(/^[A-Za-z]:\\?$/)) {
            this._loadDrives();
        }
    },

    _navigate: async function(dir) {
        this._currentPath = dir.replace(/\\/g, '/');
        this._updatePathInput();
        this._updateFooter();

        var list = document.getElementById('aiPickerList');
        if (!list) return;
        list.innerHTML = '<div style="text-align:center;color:#999;padding:20px">' + I18n.t('Loading...') + '</div>';

        if (dir.match(/^[A-Za-z]:\/?$/)) { this._loadDrives(); return; }

        try {
            var r = await fetch(Config.serverUrl + '/api/files/list', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dir: dir, flat: true })
            });
            var j = await r.json();
            var files = j.files || [];

            var html = '';
            files.forEach(function(f) {
                var name = f.name || f;
                if (name.indexOf('.') === -1) {
                    html += '<div class="ai-picker-item" data-dir="' + Utils.escAttr(name) + '" style="padding:6px 8px;cursor:pointer;border-bottom:1px solid #f0f0f0">📁 ' + Utils.esc(name) + '</div>';
                }
            });

            if (!html) {
                html = '<div style="text-align:center;color:#999;padding:20px">' + I18n.t('No subfolders') + '</div>';
            }

            list.innerHTML = html;

            var self = this;
            list.querySelectorAll('.ai-picker-item').forEach(function(item) {
                item.onclick = function() {
                    var d = this.dataset.dir;
                    var newPath = self._currentPath.replace(/\/$/, '') + '/' + d;
                    self._navigate(newPath);
                };
            });
        } catch (e) {
            list.innerHTML = '<div style="text-align:center;color:#999;padding:20px">' + I18n.t('Cannot load folders') + '</div>';
        }
    },

    _loadDrives: function() {
        var drives = [];
        for (var i = 65; i <= 90; i++) { drives.push(String.fromCharCode(i) + ':\\'); }
        var list = document.getElementById('aiPickerList');
        if (!list) return;
        var self = this;
        var html = '';
        drives.forEach(function(drive) {
            html += '<div class="ai-picker-item" data-dir="' + drive + '" style="padding:6px 8px;cursor:pointer;border-bottom:1px solid #f0f0f0">💿 ' + drive + '</div>';
        });
        list.innerHTML = html;
        list.querySelectorAll('.ai-picker-item').forEach(function(item) {
            item.onclick = function() { self._navigate(this.dataset.dir); };
        });
    },

    _updatePathInput: function() {
        var input = document.getElementById('aiPickerPathInput');
        if (input) input.value = this._currentPath;
    },

    _updateFooter: function() {
        var span = document.getElementById('aiPickerSelected');
        if (span) span.textContent = I18n.t('Selected') + ': ' + this._currentPath;
    }
};