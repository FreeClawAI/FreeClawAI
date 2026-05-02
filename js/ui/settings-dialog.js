// FreeClaw - Settings dialog (Local File Service)
const SettingsDialog = {
    show: function() {
        var currentUrl = Config.serverUrl || 'http://127.0.0.1:8080';
        var currentDirs = (Config.workDirs || ['workspace']).join(',');
        Dialog.show(
            '<h3>' + (I18n._lang === 'zh' ? '本地文件服务' : 'Local File Service') + '</h3>' +
            '<label>' + (I18n._lang === 'zh' ? '服务器地址' : 'Server URL') + '</label>' +
            '<div style="display:flex;gap:6px">' +
                '<input id="aiCfgServer" class="ai-dialog-input" value="' + Utils.escAttr(currentUrl) + '" style="flex:1">' +
                '<button id="aiCfgTestConn">🔌 ' + (I18n._lang === 'zh' ? '测试' : 'Test') + '</button>' +
            '</div>' +
            '<span id="aiCfgConnStatus" style="font-size:11px;"></span>' +
            '<label>' + (I18n._lang === 'zh' ? '工作目录' : 'Work Directory') + '</label>' +
            '<div style="display:flex;gap:6px">' +
                '<input id="aiCfgDirs" class="ai-dialog-input" value="' + Utils.escAttr(currentDirs) + '" style="flex:1">' +
                '<button id="aiCfgPickDir">📂 ' + (I18n._lang === 'zh' ? '选择' : 'Pick') + '</button>' +
            '</div>' +
            '<div style="margin-top:10px;padding:10px;background:#e7f3ff;border-radius:4px;font-size:12px;color:#0c5460">' +
                '<strong>💡 ' + (I18n._lang === 'zh' ? '保存到本地' : 'Save Locally') + '</strong><br>' +
                (I18n._lang === 'zh'
                    ? '在插件目录下打开终端，执行 <code>node server.js</code><br>或双击 <code>server.bat</code>（Windows）<br>或运行 <code>server.sh</code>（Mac/Linux）'
                    : 'Open terminal in the plugin folder, run <code>node server.js</code><br>Or double-click <code>server.bat</code> (Windows)<br>Or run <code>server.sh</code> (Mac/Linux)') +
            '</div>' +
            '<div class="ai-dialog-btns">' +
                '<button id="aiCfgSave">' + (I18n._lang === 'zh' ? '保存' : 'Save') + '</button>' +
                '<button id="aiCfgCancel">' + (I18n._lang === 'zh' ? '取消' : 'Cancel') + '</button>' +
            '</div>'
        );

        document.getElementById('aiCfgCancel').onclick = function() { Dialog.close(); };
        document.getElementById('aiCfgPickDir').onclick = function() { SettingsDialog._pickDir(); };
        document.getElementById('aiCfgTestConn').onclick = function() { SettingsDialog._testConn(); };
        document.getElementById('aiCfgSave').onclick = function() { SettingsDialog._save(); };
    },

    _pickDir: function() {
        var input = document.createElement('input');
        input.type = 'file';
        input.webkitdirectory = true;
        input.onchange = function() {
            if (this.files.length > 0) {
                var path = this.files[0].webkitRelativePath || '';
                var dirName = path.split('/')[0] || '';
                var current = document.getElementById('aiCfgDirs').value.trim();
                document.getElementById('aiCfgDirs').value = current ? current + ',' + dirName : dirName;
            }
        };
        input.click();
    },

    _testConn: async function() {
        var url = document.getElementById('aiCfgServer').value.trim();
        var wsUrl = url.replace(/^http/, 'ws');
        var status = document.getElementById('aiCfgConnStatus');
        status.textContent = I18n._lang === 'zh' ? '测试中...' : 'Testing...';
        status.style.color = '#666';

        var ws = null;
        var resolved = false;
        var timeout = setTimeout(function() {
            if (!resolved) {
                resolved = true;
                try { ws.close(); } catch (e) {}
                status.textContent = I18n._lang === 'zh' ? '❌ 无法连接' : '❌ Cannot connect';
                status.style.color = '#dc3545';
            }
        }, 3000);

        try {
            ws = new WebSocket(wsUrl);
            ws.onopen = function() {
                if (!resolved) {
                    resolved = true;
                    clearTimeout(timeout);
                    ws.close();
                    status.textContent = I18n._lang === 'zh' ? '✅ 连接成功' : '✅ Connected';
                    status.style.color = '#28a745';
                }
            };
            ws.onerror = function() {
                if (!resolved) {
                    resolved = true;
                    clearTimeout(timeout);
                    status.textContent = I18n._lang === 'zh' ? '❌ 无法连接' : '❌ Cannot connect';
                    status.style.color = '#dc3545';
                }
            };
        } catch (e) {
            if (!resolved) {
                resolved = true;
                clearTimeout(timeout);
                status.textContent = I18n._lang === 'zh' ? '❌ 无法连接' : '❌ Cannot connect';
                status.style.color = '#dc3545';
            }
        }
    },

    _save: async function() {
        Config.serverUrl = document.getElementById('aiCfgServer').value.trim();
        var dirsStr = document.getElementById('aiCfgDirs').value.trim();
        Config._data.workDirs = dirsStr ? dirsStr.split(',').map(function(s) { return s.trim(); }).filter(Boolean) : ['workspace'];
        await Config.save();
        Dialog.close();
        Toast.show(I18n.t('toast.config'));
    }
};