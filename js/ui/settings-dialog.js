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

        var dirsHtml = '';
        this._dirs.forEach(function(d, i) {
            var isMain = i === 0;
            dirsHtml += '<div style="display:flex;align-items:center;gap:6px;padding:4px 0">' +
                (isMain ? '<span title="' + I18n.t('settings.mainDir') + '">⭐</span>' : '<span style="width:14px"></span>') +
                '<span style="flex:1;font-size:12px;word-break:break-all">' + Utils.esc(d) + '</span>' +
                '<button class="ai-del-dir" data-idx="' + i + '" style="font-size:11px;padding:2px 6px;border:1px solid #ccc;border-radius:3px;background:white;cursor:pointer">' + I18n.t('btn.delete') + '</button>' +
            '</div>';
        });

        Dialog.show(
            '<h3>' + I18n.t('settings.title') + '</h3>' +
            '<label>' + I18n.t('settings.serverUrl') + '</label>' +
            '<div style="display:flex;gap:6px">' +
                '<input id="aiCfgServer" class="ai-dialog-input" value="' + Utils.escAttr(currentUrl) + '" style="flex:1">' +
                '<button id="aiCfgTestConn">🔌 ' + I18n.t('settings.test') + '</button>' +
            '</div>' +
            '<span id="aiCfgConnStatus" style="font-size:11px;"></span>' +
            '<label style="margin-top:8px">' + I18n.t('settings.workDir') + '</label>' +
            '<div id="aiCfgDirList" style="max-height:120px;overflow:auto;margin-bottom:6px">' + dirsHtml + '</div>' +
            '<div style="display:flex;gap:6px">' +
                '<input id="aiCfgNewDir" class="ai-dialog-input" placeholder="' + (I18n._lang === 'zh' ? '输入新目录路径' : 'Enter new directory path') + '" style="flex:1">' +
                '<button id="aiCfgAddDir">➕ ' + I18n.t('settings.add') + '</button>' +
            '</div>' +
            '<span id="aiCfgAddStatus" style="font-size:11px;"></span>' +
            '<div style="margin-top:10px;padding:10px;background:#e7f3ff;border-radius:4px;font-size:12px;color:#0c5460">' +
                '<strong>💡 ' + I18n.t('settings.howto') + '</strong><br>' +
                I18n.t('settings.howtoDesc') +
            '</div>' +
            '<div class="ai-dialog-btns" style="justify-content:center">' +
                '<button id="aiCfgClose">' + I18n.t('btn.confirm') + '</button>' +
            '</div>'
        );

        document.getElementById('aiCfgClose').onclick = function() { Dialog.close(); };
        document.getElementById('aiCfgTestConn').onclick = function() { self._testConn(); };
        document.getElementById('aiCfgAddDir').onclick = function() { self._addDir(); };

        document.querySelectorAll('.ai-del-dir').forEach(function(btn) {
            btn.onclick = async function() {
                var idx = parseInt(this.dataset.idx);
                self._dirs.splice(idx, 1);
                Config._data.workDirs = self._dirs.slice();
                await Config.save();

                var url = document.getElementById('aiCfgServer').value.trim() || Config.serverUrl;

                if (!self._dirs.length) {
                    try {
                        var r = await fetch(url + '/api/config', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
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

                self._render(url);
            };
        });
    },

    _testConn: async function() {
        var url = document.getElementById('aiCfgServer').value.trim();
        var status = document.getElementById('aiCfgConnStatus');
        status.textContent = I18n.t('settings.testing');
        status.style.color = '#666';
        try {
            var r = await fetch(url + '/api/ping');
            if (r.ok) {
                status.textContent = I18n.t('settings.connected');
                status.style.color = '#28a745';
            } else {
                status.textContent = I18n.t('settings.httpError', r.status);
                status.style.color = '#dc3545';
            }
        } catch (e) {
            status.textContent = I18n.t('settings.cannotConnect');
            status.style.color = '#dc3545';
        }
    },

    _addDir: async function() {
        var url = document.getElementById('aiCfgServer').value.trim() || Config.serverUrl;
        var newDir = document.getElementById('aiCfgNewDir').value.trim();
        var status = document.getElementById('aiCfgAddStatus');
        if (!newDir) return;

        status.textContent = I18n.t('settings.validating');
        status.style.color = '#666';

        try {
            var allDirs = this._dirs.concat([newDir]);
            var r = await fetch(url + '/api/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dirs: allDirs })
            });
            var j = await r.json();
            if (j.success) {
                this._dirs = j.dirs;
                Config._data.workDirs = j.dirs;
                await Config.save();
                document.getElementById('aiCfgNewDir').value = '';
                status.textContent = I18n.t('settings.added');
                status.style.color = '#28a745';
                this._render(url);
            } else {
                status.textContent = I18n.t('settings.accessDenied');
                status.style.color = '#dc3545';
            }
        } catch (e) {
            status.textContent = I18n.t('settings.cannotConnect');
            status.style.color = '#dc3545';
        }
    }
};