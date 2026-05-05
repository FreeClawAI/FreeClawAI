// FreeClaw - Send Button (open send dialog with file tree)
const SendBtn = {
    _btn: null,
    _busy: false,

    init: function() {
        if (document.getElementById('ai-sync-btn')) return;

        this._btn = document.createElement('button');
        this._btn.id = 'ai-sync-btn';
        this._btn.textContent = '📤';
        this._btn.title = 'FreeClaw - Send Files';
        var self = this;
        this._btn.onclick = async function() {
            if (self._busy) return;
            self._busy = true;
            try {
                var site = Extractor._getSite();
                if (site && site.isTyping && site.isTyping()) {
                    Toast.show(I18n.t('AI is still typing, please wait...'), 'error');
                    return;
                }
                await FileService.refresh();
                SendDialog.show();
            } finally {
                self._busy = false;
            }
        };
        document.body.appendChild(this._btn);
    },

    show: function() {
        if (this._btn) this._btn.style.display = 'flex';
    },

    hide: function() {
        if (this._btn) this._btn.style.display = 'none';
    }
};