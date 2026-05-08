// FreeClaw - Quick Message Button
const SendBtn = {
    _btn: null,

    init: function() {
        if (document.getElementById('ai-sync-btn')) return;

        this._btn = document.createElement('button');
        this._btn.id = 'ai-sync-btn';
        this._btn.textContent = '⚡';
        this._btn.title = 'FreeClaw - Quick Send';
        this._btn.onclick = function() { QuickMsg.show(); };
        document.body.appendChild(this._btn);
    },

    show: function() {
        if (this._btn) this._btn.style.display = 'flex';
    },

    hide: function() {
        if (this._btn) this._btn.style.display = 'none';
    }
};