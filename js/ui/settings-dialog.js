// FreeClaw - Settings dialog (Local File Service)
const SettingsDialog = {
    _dirs: [],

    show: async function() {
        var currentUrl = Config.serverUrl || 'http://localhost:8080';
        this._dirs = Config.workDirs ? Config.workDirs.slice() : [];

        try {
            var r = await fetch(currentUrl + '/api/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dirs: this._dirs })
            });
            if (r.ok) {
                var j = await r.json();
                if (j.success && j.dirs) {
                    this._dirs = j.dirs;
                    Config._data.workDirs = j.dirs;
                    await Config.save();
                }
            }
        } catch (e) {}

        this._render(currentUrl);
    },

    _render: async function(serverUrl) {
        var self = this;
        var currentUrl = serverUrl || Config.serverUrl || 'http://localhost:8080';

        var mainDir = this._dirs[0] || '';
        var sorted = [mainDir];
        this._dirs.forEach(function(d) { if (d !== mainDir) sorted.push(d); });
        this._dirs = sorted;

        var dirsHtml = '';
        this._dirs.forEach(function(d, i) {
            var isMain = i === 0;
            dirsHtml += '<div style="display:flex;align-items:center;gap:6px;padding:4px 0">' +
                (isMain
                    ? '<span title="' + I18n.t('Main directory') + '" style="font-size:14px">⭐</span>'
                    : '<button class="ai-set-main" data-idx="' + i + '" style="font-size:14px;padding:0 2px;border:none;background:transparent;cursor:pointer;opacity:0.3" title="' + I18n.t('Set as main') + '">☆</button>') +
                '<span style="flex:1;font-size:12px;word-break:break-all">' + Utils.esc(d) + '</span>' +
                '<button class="ai-del-dir" data-idx="' + i + '" style="font-size:11px;padding:2px 6px;border:1px solid #ccc;border-radius:3px;background:white;cursor:pointer">' + I18n.t('Delete') + '</button>' +
            '</div>';
        });

        Dialog.show(
            '<h3>' + I18n.t('Local File Service') + '</h3>' +
            '<label>' + I18n.t('Server URL') + '</label>' +
            '<div style="display:flex;gap:6px">' +
                '<input id="aiCfgServer" class="ai-dialog-input" value="' + Utils.escAttr(currentUrl) + '" style="flex:1">' +
                '<button id="aiCfgTestConn">🔌 ' + I18n.t('Test') + '</button>' +
            '</div>' +
            '<span id="aiCfgConnStatus" style="font-size:11px;"></span>' +
            '<label style="margin-top:8px">' + I18n.t('Work Directory') + '</label>' +
            '<div id="aiCfgDirList" style="max-height:120px;overflow:auto;margin-bottom:6px">' + dirsHtml + '</div>' +
            '<button id="aiCfgBrowse" style="width:100%;padding:6px;border:1px dashed #ccc;border-radius:4px;background:white;cursor:pointer;font-size:12px;color:#666">📂 ' + I18n.t('Browse & Add Directory') + '</button>' +
            '<span id="aiCfgAddStatus" style="font-size:11px;"></span>' +
            '<div style="margin-top:10px;padding:10px;background:#e7f3ff;border-radius:4px;font-size:12px;color:#0c5460">' +
                '<strong>💡 ' + I18n.t('Start Local File Service') + '</strong><br>' +
                I18n.t('Open terminal in the plugin folder, run <code>node server.js</code><br>Or double-click <code>server.bat</code> (Windows)<br>Or run <code>server.sh</code> (Mac/Linux)') +
            '</div>' +
            '<div class="ai-dialog-btns" style="justify-content:center">' +
                '<button id="aiCfgClose">' + I18n.t('Confirm') + '</button>' +
            '</div>'
        );

        document.getElementById('aiCfgClose').onclick = function() { Dialog.close(); };
        document.getElementById('aiCfgTestConn').onclick = function() { self._testConn(); };
        document.getElementById('aiCfgBrowse').onclick = function() {
            DirPicker.show(Config.mainDir, function(selectedPath) {
                self._addDirByPath(selectedPath);
            });
        };

        document.querySelectorAll('.ai-set-main').forEach(function(btn) {
            btn.onclick = async function() {
                var idx = parseInt(this.dataset.idx);
                var dir = self._dirs.splice(idx, 1)[0];
                self._dirs.unshift(dir);
                Config._data.workDirs = self._dirs.slice();
                await Config.save();
                self._render(currentUrl);
            };
        });

        document.querySelectorAll('.ai-del-dir').forEach(function(btn) {
            btn.onclick = async function() {
                var idx = parseInt(this.dataset.idx);
                self._dirs.splice(idx, 1);
                Config._data.workDirs = self._dirs.slice();
                await Config.save();
                if (!self._dirs.length) {
                    try {
                        var r = await fetch(currentUrl + '/api/config', {
                            method: 'POST', headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ dirs: [] })
                        });
                        if (r.ok) {
                            var j = await r.json();
                            if (j.success && j.dirs) {
                                self._dirs = j.dirs;
                                Config._data.workDirs = j.dirs;
                                await Config.save();
                            }
                        }
                    } catch (e) {}
                }
                self._render(currentUrl);
            };
        });
    },

    _addDirByPath: async function(newDir) {
        var url = document.getElementById('aiCfgServer').value.trim() || Config.serverUrl;
        var status = document.getElementById('aiCfgAddStatus');
        if (!newDir) return;
        status.textContent = I18n.t('Validating...');
        status.style.color = '#666';
        try {
            var allDirs = this._dirs.concat([newDir]);
            var r = await fetch(url + '/api/config', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dirs: allDirs })
            });
            var j = await r.json();
            if (j.success) {
                this._dirs = j.dirs;
                Config._data.workDirs = j.dirs;
                await Config.save();
                status.textContent = I18n.t('✅ Added');
                status.style.color = '#28a745';
                this._render(url);
            } else {
                status.textContent = I18n.t('❌ Cannot access this directory');
                status.style.color = '#dc3545';
            }
        } catch (e) {
            status.textContent = I18n.t('❌ Cannot connect');
            status.style.color = '#dc3545';
        }
    },

    _testConn: async function() {
        var url = document.getElementById('aiCfgServer').value.trim();
        var status = document.getElementById('aiCfgConnStatus');
        status.textContent = I18n.t('Testing...');
        status.style.color = '#666';
        try {
            var r = await fetch(url + '/api/ping');
            if (r.ok) {
                status.textContent = I18n.t('✅ Connected');
                status.style.color = '#28a745';
            } else {
                status.textContent = I18n.t('❌ HTTP {0}', r.status);
                status.style.color = '#dc3545';
            }
        } catch (e) {
            status.textContent = I18n.t('❌ Cannot connect');
            status.style.color = '#dc3545';
        }
    }
};