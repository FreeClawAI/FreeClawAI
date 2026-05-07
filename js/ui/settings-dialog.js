// FreeClaw - Settings dialog (Local File Service)
const SettingsDialog = {
    _dirs: [],

    show: async function() {
        var currentUrl = Config.serverUrl || 'http://localhost:8080';
        this._dirs = (Config.workDirs && Config.workDirs.slice) ? Config.workDirs.slice() : [];
        try {
            var controller = new AbortController();
            var timeout = setTimeout(function() { controller.abort(); }, 3000);
            var j = await Api.configDirs(this._dirs);
            clearTimeout(timeout);
            if (j.success && j.dirs) { this._dirs = j.dirs; Config._data.workDirs = j.dirs; await Config.save(); }
        } catch (e) {}
        this._render(currentUrl);
        this._testConn();
    },

    _render: function(serverUrl) {
        var self = this;
        var currentUrl = serverUrl || Config.serverUrl || 'http://localhost:8080';

        var mainDir = this._dirs[0] || '';
        var sorted = [mainDir];
        this._dirs.forEach(function(d) { if (d !== mainDir) sorted.push(d); });
        this._dirs = sorted;

        var dirsHtml = '';
        this._dirs.forEach(function(d, i) {
            var isMain = i === 0;
            dirsHtml += '<div style="display:flex;align-items:center;gap:6px;padding:6px 0;border-bottom:1px solid #eee">' +
                (isMain ? '<span title="' + I18n.t('Main directory') + '" style="font-size:14px">⭐</span>' : '<button class="ai-set-main" data-idx="' + i + '" style="font-size:14px;padding:0 2px;border:none;background:transparent;cursor:pointer;opacity:0.3" title="' + I18n.t('Set as main') + '">☆</button>') +
                '<span style="flex:1;font-size:12px;word-break:break-all">' + Utils.esc(d) + '</span>' +
                '<button class="ai-del-dir" data-idx="' + i + '" style="font-size:11px;padding:2px 6px;border:1px solid #ccc;border-radius:3px;background:white;cursor:pointer">' + I18n.t('Delete') + '</button>' +
            '</div>';
        });

        var body = 
            '<label>' + I18n.t('Server URL') + '</label>' +
            '<div style="display:flex;gap:6px">' +
                '<input id="aiCfgServer" class="ai-dialog-input" value="' + Utils.escAttr(currentUrl) + '" style="flex:1">' +
                '<button id="aiCfgTestConn">🔌 ' + I18n.t('Test') + '</button>' +
            '</div>' +
            '<span id="aiCfgConnStatus" style="font-size:11px;"></span>' +
            '<label style="margin-top:8px">' + I18n.t('Work Directory') + '</label>' +
            '<div id="aiCfgDirList" style="max-height:200px;overflow:auto;border:1px solid #eee;border-radius:4px;padding:0 8px;margin-bottom:6px">' + dirsHtml + '</div>' +
            '<button id="aiCfgBrowse" style="width:100%;padding:6px;border:1px dashed #ccc;border-radius:4px;background:white;cursor:pointer;font-size:12px;color:#666">📂 ' + I18n.t('Browse & Add Directory') + '</button>' +
            '<span id="aiCfgAddStatus" style="font-size:11px;"></span>' +
            '<div style="margin-top:10px;padding:10px;background:#e7f3ff;border-radius:4px;font-size:12px;color:#0c5460">' +
                '<strong>💡 ' + I18n.t('Start Local File Service') + '</strong><br>' +
                I18n.t('Open terminal in the plugin folder, run <code>node server.js</code><br>Or double-click <code>server.bat</code> (Windows)<br>Or run <code>server.sh</code> (Mac/Linux)') +
            '</div>';

        DialogStack.refresh('settings', {
            title: I18n.t('Local File Service'),
            body: body,
            buttons: [
                { text: I18n.t('Confirm'), id: 'aiCfgClose', primary: true, onClick: async function() {
                    DialogStack.closeAll();
                    await FileService.refresh();
                    FileTree.render();
                    FileTree.initEvents();
                }}
            ],
            onRender: function() {
                document.getElementById('aiCfgTestConn').onclick = function() { self._testConn(); };
                document.getElementById('aiCfgBrowse').onclick = function() {
                    self._testConn().then(function(connected) {
                        if (!connected) { Toast.show(I18n.t('Cannot connect. Start node server.js'), 'error'); return; }
                        DirPicker.show(Config.mainDir, function(selectedPath) {
                            self._addDirByPath(selectedPath).then(function() {
                                self._render(currentUrl);
                            });
                        });
                    });
                };
                document.querySelectorAll('.ai-set-main').forEach(function(btn) {
                    btn.onclick = async function() {
                        var idx = parseInt(this.dataset.idx);
                        var dir = self._dirs.splice(idx, 1)[0];
                        self._dirs.unshift(dir);
                        Config._data.workDirs = self._dirs.slice();
                        await Config.save();
                        await FileService.refresh();
                        FileTree.render();
                        FileTree.initEvents();
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
                                var j = await Api.configDirs([]);
                                if (j.success && j.dirs) { self._dirs = j.dirs; Config._data.workDirs = j.dirs; await Config.save(); }
                            } catch (e) {}
                        }
                        await FileService.refresh();
                        FileTree.render();
                        FileTree.initEvents();
                        self._render(currentUrl);
                    };
                });
            }
        });
    },

    _addDirByPath: async function(newDir) {
        if (!newDir) return;
        Toast.show(I18n.t('Validating...'));
        try {
            var allDirs = this._dirs.concat([newDir]);
            var j = await Api.configDirs(allDirs);
            if (j.success) {
                this._dirs = j.dirs;
                Config._data.workDirs = j.dirs;
                await Config.save();
                await FileService.refresh();
                FileTree.render();
                FileTree.initEvents();
                Toast.show(I18n.t('✅ Added'));
            } else {
                Toast.show(I18n.t('❌ Cannot access this directory'), 'error');
            }
        } catch (e) {
            Toast.show(I18n.t('❌ Cannot connect'), 'error');
        }
    },

    _testConn: async function() {
        var url = document.getElementById('aiCfgServer');
        var status = document.getElementById('aiCfgConnStatus');
        if (!url || !status) return false;
        url = url.value.trim();
        status.textContent = I18n.t('Testing...'); status.style.color = '#666';
        try {
            var connected = await Api.ping();
            if (connected) { status.textContent = I18n.t('✅ Connected'); status.style.color = '#28a745'; return true; }
            else { status.textContent = I18n.t('❌ Cannot connect'); status.style.color = '#dc3545'; return false; }
        } catch (e) { status.textContent = I18n.t('❌ Cannot connect'); status.style.color = '#dc3545'; return false; }
    }
};