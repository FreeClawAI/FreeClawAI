// Send selected files + prompt to AI chat input
const Sender = {
    MAX_CHARS: 100000,

    async send() {
        const input = document.getElementById('aiInput').value.trim();
        const files = FileList.getSelectedFiles();
        await this._doSend(input, files);
        document.getElementById('aiStarBtn').style.display = 'inline-block';
    },

    async sendDirect(promptContent) {
        const files = FileList.getSelectedFiles();
        await this._doSend(promptContent, files);
        document.getElementById('aiStarBtn').style.display = 'inline-block';
    },

    async _doSend(userInput, files) {
        let msg = userInput || '';
        if (files.length > 0) {
            if (msg) msg += '\n\n' + I18n.t('send.attachHeader') + '\n';
            else msg = I18n.t('send.attachHeader') + '\n';
            files.forEach(f => msg += '\n📁 ' + Config.mainDir + '/' + f.name + '\n' + (f.content || ''));
        }
        if (Utils.countChars(msg) > this.MAX_CHARS) {
            UI.showToast(I18n.t('send.overLimit', Utils.countChars(msg), this.MAX_CHARS), 'error');
            return;
        }
        const editor = this._findEditor();
        if (editor) {
            editor.value = msg;
            if (this._shouldTriggerInput()) editor.dispatchEvent(new Event('input', { bubbles: true }));
            editor.focus();
        }
        UI.close();
        FileList.saveState();
    },

    _findEditor() {
        const site = Extractor._getSite();
        if (site?.sender.inputSelectors) {
            for (const sel of site.sender.inputSelectors) {
                const el = document.querySelector(sel);
                if (el) return el;
            }
        }
        const textareas = document.querySelectorAll('textarea');
        for (let i = 0; i < textareas.length; i++) {
            if (textareas[i].offsetHeight > 30 && !textareas[i].closest('#ai-file-panel')) return textareas[i];
        }
        return null;
    },

    _shouldTriggerInput() {
        const site = Extractor._getSite();
        return site?.sender.triggerInput !== false;
    }
};