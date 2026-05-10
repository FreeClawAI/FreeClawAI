// FreeClaw - Quick message dialog
const QuickMsg = {
    _messages: [],
    _tab: 'file',

    show: async function() {
        await this._load();
        this._tab = 'file';
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

        var titleHtml = '';
        titleHtml += '<div style="display:flex;align-items:center;gap:0">';
        titleHtml += '<div id="aiTabFile" style="padding:8px 16px;cursor:pointer;font-size:13px;border-bottom:2px solid ' + (this._tab === 'file' ? '#007bff' : 'transparent') + ';color:' + (this._tab === 'file' ? '#007bff' : '#666') + '">📁 ' + I18n.t('File List') + '</div>';
        titleHtml += '<div id="aiTabMsg" style="padding:8px 16px;cursor:pointer;font-size:13px;border-bottom:2px solid ' + (this._tab === 'msg' ? '#007bff' : 'transparent') + ';color:' + (this._tab === 'msg' ? '#007bff' : '#666') + '">📋 ' + I18n.t('Messages') + '</div>';
        titleHtml += '</div>';

        var body = '';
        if (this._tab === 'file') {
            body += '<div id="aiQuickFileTree" style="max-height:50vh;overflow:auto"><div style="text-align:center;color:#999;padding:20px">' + I18n.t('Loading...') + '</div></div>';
        } else {
            var listHtml = '';
            this._messages.forEach(function(m, i) {
                listHtml += '<div class="ai-proto-item" data-idx="' + i + '" style="display:flex;align-items:center;padding:8px 10px;border-bottom:1px solid #eee;cursor:pointer">' +
                    '<span style="flex:1;font-size:13px">' + Utils.esc(m.title) + '</span>' +
                    '<button class="ai-proto-edit" data-idx="' + i + '" style="padding:3px 8px;border:1px solid #ccc;border-radius:3px;background:white;cursor:pointer;font-size:11px">' + I18n.t('Edit') + '</button>' +
                    '</div>';
            });
            body += '<div style="max-height:50vh;overflow:auto">' + listHtml + '</div>';
        }

        var buttons = [];
        if (this._tab === 'file') {
            buttons.push({ text: I18n.t('Send'), id: 'aiQuickSend', primary: true, onClick: function() { QuickFileTree.sendChecked(); } });
        }
        if (this._tab === 'msg') {
            buttons.push({ text: I18n.t('+ New'), id: 'aiMsgAdd', onClick: function() { self._edit(-1); } });
        }
        buttons.push({ text: I18n.t('Close'), id: 'aiMsgClose', onClick: function() { DialogStack.close(); } });

        DialogStack.show('quickmsg', {
            title: titleHtml,
            body: body,
            buttons: buttons,
            onRender: function() {
                var c = document.getElementById('aiDialog');
                if (c) {
                    c.style.width = '550px';
                    c.style.maxWidth = '90%';
                    c.style.minHeight = '350px';
                    c.style.maxHeight = '80vh';
                }

                document.getElementById('aiTabFile').onclick = function() { self._tab = 'file'; self._render(); };
                document.getElementById('aiTabMsg').onclick = function() { self._tab = 'msg'; self._render(); };

                if (self._tab === 'file') {
                    QuickFileTree.build('aiQuickFileTree');
                } else {
                    document.querySelectorAll('.ai-proto-item').forEach(function(item) {
                        item.addEventListener('click', function(e) {
                            if (e.target.closest('button')) return;
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
                        btn.addEventListener('click', function(e) {
                            e.stopPropagation();
                            self._edit(parseInt(this.dataset.idx));
                        });
                    });
                }
            }
        });
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