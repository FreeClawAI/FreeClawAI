// FreeClaw - Quick Save Button (skip panel, save AI files directly)
const QuickSave = {
    _btn: null,
    _busy: false,

    init: function() {
        if (document.getElementById('ai-quick-save-btn')) return;

        this._btn = document.createElement('button');
        this._btn.id = 'ai-quick-save-btn';
        this._btn.textContent = '💾';
        this._btn.title = 'FreeClaw - Quick Save';
        var self = this;
        this._btn.onclick = async function() {
            if (self._busy) return;
            self._busy = true;
            try {
                DialogStack.closeAll();
                SaveDialog.show();
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