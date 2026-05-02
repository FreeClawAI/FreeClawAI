// FreeClaw - Content Script Entry Point
(function() {
    I18n.init();
    Formatter.load();
    Panel.init();

    DB.open().then(function() {
        return Config.load();
    }).then(function() {
        return TemplatesBar.load();
    }).then(function() {
        DnD.init();
        Keyboard.init();

        document.getElementById('aiRefreshBtn').onclick = function() { FileTree.refresh(); };
        document.getElementById('aiSaveBtn').onclick = function() { Saver.saveSelected(); };
        document.getElementById('aiSendBtn').onclick = function() { Sender.send(); };
        document.getElementById('aiClosePanelBtn').onclick = function() { Panel.close(); };
        document.getElementById('aiNewFileBtn').onclick = function() { Keyboard._newFile(); };
        document.getElementById('aiNewFolderBtn').onclick = async function() {
            var name = prompt(I18n.t('Folder name:'));
            if (name) {
                try {
                    await fetch(Config.serverUrl + '/api/files/mkdir', {
                        method: 'POST', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ dir: Config.mainDir, name: name })
                    });
                    Toast.show(I18n.t('Folder: {0}', name));
                    await FileService._loadAllWorkFiles();
                    FileTree.render();
                } catch (e) { Toast.show(I18n.t('Failed: {0}', name), 'error'); }
            }
        };
        document.getElementById('aiStarBtn').onclick = async function() {
            var text = document.getElementById('aiInput').value.trim();
            var name = prompt(I18n.t('Template name:'));
            if (name && text) { await TemplatesBar.add(name, text); Toast.show(I18n.t('Template: {0}', name)); }
        };
        document.getElementById('aiInput').addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); Sender.send(); }
        });
        document.getElementById('aiPreviewCode').addEventListener('input', function() {
            Preview.syncLineNumbers(); Editor.markDirty();
        });
        document.getElementById('aiSearchFiles').addEventListener('input',
            Utils.debounce(function() { FileTree.render(); }, 300)
        );
        Preview.scrollSync();

        document.getElementById('aiConfigBtn').onclick = function() { SettingsDialog.show(); };

        var heartbeatTimer = null;
        var wasConnected = false;

        function updateStatusLight(connected) {
            var btn = document.getElementById('aiConfigBtn');
            if (btn) {
                if (connected) {
                    btn.textContent = '🔗';
                    btn.title = I18n.t('Connected');
                } else {
                    btn.textContent = '🔌';
                    btn.title = I18n.t('Disconnected');
                }
            }
            if (wasConnected && !connected) {
                SettingsDialog.show();
                Toast.show(I18n.t('Cannot connect. Start node server.js'), 'error');
            }
            wasConnected = connected;
        }

        function heartbeat() {
            var url = Config.serverUrl;
            if (!url) { updateStatusLight(false); return; }
            fetch(url + '/api/ping')
                .then(function(r) { updateStatusLight(r.ok); })
                .catch(function() { updateStatusLight(false); });
        }

        var origOpen = Panel.open;
        Panel.open = async function() {
            origOpen.call(Panel);
            heartbeat();
            heartbeatTimer = setInterval(heartbeat, 5000);

            var connected = false;
            try {
                var r = await fetch(Config.serverUrl + '/api/ping');
                connected = r.ok;
            } catch (e) {}
            updateStatusLight(connected);

            if (!connected) {
                setTimeout(function() {
                    fetch(Config.serverUrl + '/api/ping')
                        .then(function(r) {
                            if (!r.ok) {
                                SettingsDialog.show();
                                Toast.show(I18n.t('Cannot connect. Start node server.js'), 'error');
                            }
                        })
                        .catch(function() {
                            SettingsDialog.show();
                            Toast.show(I18n.t('Cannot connect. Start node server.js'), 'error');
                        });
                }, 3000);
            } else {
                try {
                    var vr = await fetch(Config.serverUrl + '/api/config', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ dirs: Config.workDirs })
                    });
                    if (vr.ok) {
                        var vj = await vr.json();
                        if (vj.success && vj.dirs) {
                            Config._data.workDirs = vj.dirs;
                            await Config.save();
                        }
                    }
                } catch (e) {}

                await FileTree.refresh();
                await PromptsBar.load();
                TemplatesBar.render();
            }
        };

        var origClose = Panel.close;
        Panel.close = function() {
            if (Editor && typeof Editor.hasChanges === 'function' && Editor.hasChanges()) {
                if (!confirm(I18n.t('Unsaved changes. Close anyway?'))) return;
            }
            clearInterval(heartbeatTimer);
            origClose.call(Panel);
        };
    });
})();