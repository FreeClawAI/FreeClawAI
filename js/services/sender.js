// FreeClaw - Send selected files + prompt to AI chat input
const Sender = {
    MAX_CHARS: 100000,

    send: async function() {
        var input = document.getElementById('aiInput');
        var inputVal = input ? input.value.trim() : '';
        var files = FileTree.getSelectedFiles();
        await this._doSend(inputVal, files);
    },

    sendDirect: async function(promptContent) {
        var files = FileTree.getSelectedFiles();
        await this._doSend(promptContent, files);
    },

    _doSend: async function(userInput, files) {
        var msg = '';

        if (Config.workDirs && Config.workDirs.length > 0) {
            msg += '## 工作目录: ' + Config.mainDir + '\n\n';
        }

        if (userInput) {
            msg += userInput + '\n\n';
        }

        if (files.length > 0) {
            files.forEach(function(f) {
                var name = f.name || '';
                var content = f.content || '';
                msg += '## ' + name + '\n```\n' + content + '\n```\n\n';
            });
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
        FileTree.saveState();
    },

    _findEditor: function() {
        var textareas = document.querySelectorAll('textarea');
        for (var i = 0; i < textareas.length; i++) {
            if (textareas[i].offsetHeight > 30 && !textareas[i].closest('#ai-file-panel')) return textareas[i];
        }
        return null;
    }
};