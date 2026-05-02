// FreeClaw - Send selected files + prompt to AI chat input
const Sender = {
    MAX_CHARS: 100000,

    send: async function() {
        var input = document.getElementById('aiInput').value.trim();
        var files = FileTree.getSelectedFiles();
        await this._doSend(input, files);
        document.getElementById('aiStarBtn').style.display = 'inline-block';
    },

    sendDirect: async function(promptContent) {
        var files = FileTree.getSelectedFiles();
        await this._doSend(promptContent, files);
        document.getElementById('aiStarBtn').style.display = 'inline-block';
    },

    _doSend: async function(userInput, files) {
        var msg = userInput || '';
        if (files.length > 0) {
            if (msg) msg += '\n\n' + I18n.t('--- Attachments ---') + '\n';
            else msg = I18n.t('--- Attachments ---') + '\n';
            files.forEach(function(f) {
                msg += '\n📁 ' + (f._dir || Config.mainDir) + '/' + f.name + '\n' + (f.content || '');
            });
        }
        if (Utils.countChars(msg) > this.MAX_CHARS) {
            Toast.show(I18n.t('Content exceeds limit ({0}/{1})', Utils.countChars(msg), this.MAX_CHARS), 'error');
            return;
        }
        var editor = this._findEditor();
        if (editor) {
            editor.value = msg;
            if (this._shouldTriggerInput()) editor.dispatchEvent(new Event('input', { bubbles: true }));
            editor.focus();
        }
        Panel.close();
        FileTree.saveState();
    },

    _findEditor: function() {
        var site = Extractor._getSite();
        if (site && site.sender && site.sender.inputSelectors) {
            for (var i = 0; i < site.sender.inputSelectors.length; i++) {
                var el = document.querySelector(site.sender.inputSelectors[i]);
                if (el) return el;
            }
        }
        var textareas = document.querySelectorAll('textarea');
        for (var i = 0; i < textareas.length; i++) {
            if (textareas[i].offsetHeight > 30 && !textareas[i].closest('#ai-file-panel')) return textareas[i];
        }
        return null;
    },

    _shouldTriggerInput: function() {
        var site = Extractor._getSite();
        return !site || !site.sender || site.sender.triggerInput !== false;
    }
};