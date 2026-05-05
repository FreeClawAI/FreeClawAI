// FreeClaw - Content Script Entry Point
var FreeClawFirstRun = true;

(function() {
    I18n.init();
    Formatter.load();
    Panel.init();
    QuickSave.init();

    DB.open().then(function() {
        return Config.load();
    }).then(function() {
        return TemplatesBar.load();
    }).then(function() {
        DnD.init();
        Keyboard.init();
    });

    var _eventsBound = false;

    function _bindEvents() {
        if (_eventsBound) return;
        if (!document.getElementById('aiRefreshBtn')) return;
        _eventsBound = true;

        document.getElementById('aiConfigBtn').onclick = function() { SettingsDialog.show(); };
        document.getElementById('aiRefreshBtn').onclick = function() { FileService.refreshAndRender(); };
        document.getElementById('aiSaveBtn2').onclick = function() { SaveDialog.show(); };
        document.getElementById('aiSendBtn').onclick = function() { Sender.send(); };
        document.getElementById('aiClosePanelBtn').onclick = function() { Panel.close(); };

        var menuBtn = document.getElementById('aiMenuBtn');
        var menuDropdown = document.getElementById('aiMenuDropdown');

        menuBtn.onclick = function(e) {
            e.stopPropagation();
            if (menuDropdown.style.display === 'block') {
                menuDropdown.style.display = 'none';
                return;
            }
            var rect = menuBtn.getBoundingClientRect();
            menuDropdown.style.display = 'block';
            menuDropdown.style.top = (rect.bottom + 4) + 'px';
            menuDropdown.style.left = (rect.left - 120) + 'px';
        };

        menuDropdown.addEventListener('click', async function(e) {
            var item = e.target.closest('.ai-menu-item');
            if (!item) return;
            var action = item.dataset.action;
            menuDropdown.style.display = 'none';

            if (action === 'newFile') {
                Keyboard._newFile();
            } else if (action === 'newFolder') {
                var name = prompt(I18n.t('Folder name:'));
                if (name) {
                    try {
                        await Api.mkdir(Config.mainDir, name);
                        Toast.show(I18n.t('Folder: {0}', name));
                        await FileService.loadDir(Config.mainDir);
                        FileTree.render();
                    } catch (e) {
                        Toast.show(I18n.t('Failed: {0}', name), 'error');
                    }
                }
            }
        });

        document.addEventListener('click', function(e) {
            if (!menuBtn.contains(e.target) && !menuDropdown.contains(e.target)) {
                menuDropdown.style.display = 'none';
            }
        });

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
    }

    var heartbeatTimer = null;
    var wasConnected = false;
    var panelWasOpen = false;

    function updateStatusLight(connected) {
        var btn = document.getElementById('aiConfigBtn');
        if (btn) {
            btn.textContent = connected ? '🔗' : '🔌';
            btn.title = connected ? I18n.t('Connected') + ' - ' + I18n.t('Settings') : I18n.t('Disconnected') + ' - ' + I18n.t('Settings');
            if (connected) {
                btn.classList.remove('disconnected');
            } else {
                btn.classList.add('disconnected');
            }
        }
    }

    function heartbeat() {
        Api.ping().then(function(connected) {
            updateStatusLight(connected);
            if (wasConnected && !connected) {
                Toast.show(I18n.t('Cannot connect. Start node server.js'), 'error');
            }
            if (!wasConnected && connected && panelWasOpen) {
                FileService.refreshAndRender();
                PromptsBar.load();
                TemplatesBar.render();
            }
            wasConnected = connected;
        }).catch(function() {
            updateStatusLight(false);
            wasConnected = false;
        });
    }

    var _origOpen = Panel.open;
    Panel.open = async function() {
        _origOpen.call(Panel);
        _bindEvents();
        heartbeat();
        heartbeatTimer = setInterval(heartbeat, 5000);
        panelWasOpen = true;

        var connected = await Api.ping();
        updateStatusLight(connected);

        if (!connected) {
            if (FreeClawFirstRun) {
                FreeClawFirstRun = false;
            }
            Toast.show(I18n.t('Cannot connect. Start node server.js'), 'error');
        } else {
            FreeClawFirstRun = false;
            await FileService.refreshAndRender();
            await PromptsBar.load();
            TemplatesBar.render();
        }
        wasConnected = connected;
    };

    var _origClose = Panel.close;
    Panel.close = function() {
        if (Editor && typeof Editor.hasChanges === 'function' && Editor.hasChanges()) {
            if (!confirm(I18n.t('Unsaved changes. Close anyway?'))) return;
        }
        clearInterval(heartbeatTimer);
        panelWasOpen = false;
        _origClose.call(Panel);
    };
})();