// FreeClaw - Send previewed file + prompt to AI chat input
const Sender = {
    MAX_CHARS: 100000,

    send: async function() {
        var input = document.getElementById('aiInput');
        var inputVal = input ? input.value.trim() : '';
        await this._doSend(inputVal);
        if (input) input.value = '';
    },

    sendDirect: async function(promptContent) {
        await this._doSend(promptContent);
    },

    _doSend: async function(userInput) {
        var msg = '';

        if (userInput) {
            msg += userInput + '\n\n';
        }

        var file = Preview._currentFile;
        if (file && file.content) {
            var name = file.name || '';
            var sel = Preview.getSelection();
            if (sel) {
                msg += '## ' + name + ' [' + sel.start + ',' + sel.end + ']\n```\n' + sel.text + '\n```\n';
            } else {
                msg += '## ' + name + '\n```\n' + file.content + '\n```\n';
            }
        }

        if (!msg.trim()) return;

        if (Utils.countChars(msg) > this.MAX_CHARS) {
            Toast.show(I18n.t('Content exceeds limit ({0}/{1})', Utils.countChars(msg), this.MAX_CHARS), 'error');
            return;
        }

        var editor = this._findEditor();
        if (editor) {
            editor.value = msg;
            editor.dispatchEvent(new Event('input', { bubbles: true }));
            editor.focus();
        }
        Panel.close();
    },

    _findEditor: function() {
        var textareas = document.querySelectorAll('textarea');
        for (var i = 0; i < textareas.length; i++) {
            if (textareas[i].offsetHeight > 30 && !textareas[i].closest('#ai-file-panel')) return textareas[i];
        }
        return null;
    }
};