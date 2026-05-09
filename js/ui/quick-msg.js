// FreeClaw - Quick message dialog
const QuickMsg = {
    _messages: [],

    show: async function() {
        await this._load();
        this._render();
    },

    async _load() {
        var stored = await DB.getQuickMessages();
        if (!stored || !stored.length) {
            stored = DEFAULT_MESSAGES();
            await DB.saveQuickMessages(stored);
        }
        this._messages = stored;
    },

    _render: function() {
        var self = this;
        var listHtml = '';
        this._messages.forEach(function(m, i) {
            listHtml += '<div class="ai-proto-item" data-idx="' + i + '" style="display:flex;align-items:center;padding:8px 10px;border-bottom:1px solid #eee;cursor:pointer">' +
                '<span style="flex:1;font-size:13px">' + Utils.esc(m.title) + '</span>' +
                '<span style="font-size:11px;color:#999;margin-right:8px">' + I18n.t('Click to send') + '</span>' +
                '<button class="ai-proto-edit" data-idx="' + i + '" style="padding:3px 8px;border:1px solid #ccc;border-radius:3px;background:white;cursor:pointer;font-size:11px">' + I18n.t('Edit') + '</button>' +
                '</div>';
        });

        listHtml += '<div class="ai-proto-item" id="aiFileListBtn" style="display:flex;align-items:center;padding:8px 10px;border-bottom:1px solid #eee;cursor:pointer;background:#e3f2fd">' +
            '<span style="flex:1;font-size:13px">📁 ' + I18n.t('File List') + '</span>' +
            '<span style="font-size:11px;color:#999;margin-right:8px">' + I18n.t('Click to send') + '</span>' +
            '</div>';

        var body = '<div style="max-height:50vh;overflow:auto">' + listHtml + '</div>';

        DialogStack.show('quickmsg', {
            title: I18n.t('Quick Send'),
            body: body,
            buttons: [
                { text: I18n.t('+ New'), id: 'aiMsgAdd', onClick: function() { self._edit(-1); } },
                { text: I18n.t('Close'), id: 'aiMsgClose', onClick: function() { DialogStack.close(); } }
            ],
            onRender: function() {
                var c = document.getElementById('aiDialog');
                if (c) { c.style.width = '500px'; c.style.maxWidth = '90%'; c.style.minHeight = '250px'; c.style.maxHeight = '80vh'; }

                document.querySelectorAll('.ai-proto-item').forEach(function(item) {
                    item.addEventListener('click', function(e) {
                        if (e.target.closest('button')) return;
                        if (this.id === 'aiFileListBtn') {
                            self._sendFileList();
                            return;
                        }
                        var m = self._messages[parseInt(this.dataset.idx)];
                        var ed = Sender._findEditor();
                        if (ed) {
                            var old = ed.value;
                            ed.value = old ? old + '\n\n' + m.content : m.content;
                            ed.dispatchEvent(new Event('input', { bubbles: true }));
                            ed.focus();
                        }
                        DialogStack.close();
                    });
                });

                document.querySelectorAll('.ai-proto-edit').forEach(function(btn) {
                    btn.addEventListener('click', function(e) { e.stopPropagation(); self._edit(parseInt(this.dataset.idx)); });
                });
            }
        });
    },

    _sendFileList: async function() {
        var dirs = Config.workDirs || [];
        if (!dirs.length) {
            Toast.show(I18n.t('No work directories configured'), 'error');
            DialogStack.close();
            return;
        }

        var mainDir = dirs[0];
        var msg = '以下是我的项目文件列表：\n\n';

        try {
            var files = await Api.treeFiles(mainDir);
            msg += files.map(function(name) { return '- ' + name; }).join('\n');

            var editor = Sender._findEditor();
            if (editor) {
                var old = editor.value;
                editor.value = old ? old + '\n\n' + msg : msg;
                editor.dispatchEvent(new Event('input', { bubbles: true }));
                editor.focus();
            }
        } catch (e) {
            Toast.show(I18n.t('Cannot connect. Start node server.js'), 'error');
        }
        DialogStack.close();
    },

    _edit: function(idx) {
        var self = this;
        var m = idx >= 0 ? this._messages[idx] : { id: Utils.generateId(), title: '', content: '' };

        var body =
            '<label>' + I18n.t('Name') + '</label><input id="aiMsgTitle" class="ai-dialog-input" value="' + Utils.escAttr(m.title) + '">' +
            '<label>' + I18n.t('Prompt') + '</label><textarea id="aiMsgContent" class="ai-dialog-textarea" rows="10">' + Utils.esc(m.content) + '</textarea>';

        DialogStack.show('quickmsg-edit', {
            title: idx >= 0 ? I18n.t('Edit') : I18n.t('New'),
            body: body,
            buttons: [
                { text: I18n.t('Delete'), id: 'aiMsgEditDel', onClick: async function() {
                    if (idx >= 0) {
                        self._messages.splice(idx, 1);
                        await DB.saveQuickMessages(self._messages);
                    }
                    DialogStack.close();
                    self._render();
                }},
                { text: I18n.t('Save'), id: 'aiMsgEditSave', primary: true, onClick: async function() {
                    m.title = document.getElementById('aiMsgTitle').value.trim();
                    m.content = document.getElementById('aiMsgContent').value;
                    if (!m.title) return;
                    if (idx < 0) self._messages.push(m);
                    await DB.saveQuickMessages(self._messages);
                    DialogStack.close();
                    self._render();
                }},
                { text: I18n.t('Cancel'), id: 'aiMsgEditCancel', onClick: function() { DialogStack.close(); self._render(); } }
            ]
        });
    }
};