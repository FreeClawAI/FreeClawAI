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
            var name = prompt(I18n._lang === 'zh' ? '文件夹名:' : 'Folder name:');
            if (name) {
                try {
                    await fetch(Config.serverUrl + '/api/files/mkdir', {
                        method: 'POST', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ dir: Config.mainDir, name: name })
                    });
                    Toast.show(I18n.t('toast.folder', name));
                    await FileTree._loadWorkFiles();
                    FileTree.render();
                } catch (e) { Toast.show(I18n.t('toast.saveFail', name), 'error'); }
            }
        };
        document.getElementById('aiStarBtn').onclick = async function() {
            var text = document.getElementById('aiInput').value.trim();
            var name = prompt(I18n._lang === 'zh' ? '模板名称:' : 'Template name:');
            if (name && text) { await TemplatesBar.add(name, text); Toast.show(I18n.t('toast.template', name)); }
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

        // Override Panel.open with server check
        var origOpen = Panel.open;
        Panel.open = async function() {
            origOpen.call(Panel);
            var connected = await _checkServer();
            if (!connected) {
                SettingsDialog.show();
                Toast.show(I18n._lang === 'zh' ? '无法连接服务器，请启动 node server.js' : 'Cannot connect. Start node server.js', 'error');
                return;
            }
            await FileTree.refresh();
            await PromptsBar.load();
            TemplatesBar.render();
        };

        var origClose = Panel.close;
        Panel.close = function() {
            if (Editor && typeof Editor.hasChanges === 'function' && Editor.hasChanges()) {
                if (!confirm(I18n.t('toast.unsaved'))) return;
            }
            origClose.call(Panel);
        };
    });

    // Check if server is reachable
    async function _checkServer() {
        try {
            var r = await fetch(Config.serverUrl + '/api/files/list?dir=' + encodeURIComponent(Config.mainDir));
            return r.ok;
        } catch (e) {
            return false;
        }
    }
})();