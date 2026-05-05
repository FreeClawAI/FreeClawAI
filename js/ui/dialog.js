// FreeClaw - Dialog manager (show/hide layers with stack)
var DialogStack = {
    _overlay: null,
    _container: null,
    _diffContainer: null,
    _layers: {},
    _stack: [],
    _currentId: null,

    init: function() {
        this._overlay = document.getElementById('aiDialogOverlay');
        this._container = document.getElementById('aiDialog');
        this._diffContainer = document.getElementById('aiDiffDialog');
        if (!this._overlay || !this._container) { this._createContainers(); }
    },

    _createContainers: function() {
        this._overlay = document.createElement('div'); this._overlay.id = 'aiDialogOverlay'; this._overlay.className = 'ai-dialog-overlay'; this._overlay.style.display = 'none'; document.body.appendChild(this._overlay);
        this._container = document.createElement('div'); this._container.id = 'aiDialog'; this._container.className = 'ai-dialog'; this._container.style.display = 'none'; document.body.appendChild(this._container);
        this._diffContainer = document.createElement('div'); this._diffContainer.id = 'aiDiffDialog'; this._diffContainer.className = 'ai-dialog'; this._diffContainer.style.display = 'none'; document.body.appendChild(this._diffContainer);
    },

    _getContainer: function(id) { if (id === 'diff') return this._diffContainer || this._container; return this._container; },

    _buildHTML: function(opts) {
        var html = '';
        if (opts.title !== null && opts.title !== undefined) { html += '<div class="ai-dialog-header"><h3>' + (opts.title || '') + '</h3><button class="ai-dialog-close">✕</button></div>'; }
        html += '<div class="ai-dialog-body">' + (opts.body || '') + '</div>';
        if (opts.buttons && opts.buttons.length > 0) { html += '<div class="ai-dialog-footer">'; opts.buttons.forEach(function(btn) { var cls = btn.primary ? 'ai-dialog-btn primary' : 'ai-dialog-btn'; html += '<button id="' + (btn.id || '') + '" class="' + cls + '">' + btn.text + '</button>'; }); html += '</div>'; }
        else if (opts.footer) { html += '<div class="ai-dialog-footer">' + opts.footer + '</div>'; }
        return html;
    },

    _bindButtons: function(opts) { if (!opts.buttons) return; opts.buttons.forEach(function(btn) { if (btn.id && btn.onClick) { var el = document.getElementById(btn.id); if (el) el.onclick = function(e) { e.preventDefault(); btn.onClick(); }; } }); },
    _bindClose: function(div) { var self = this; var cb = div.querySelector('.ai-dialog-close'); if (cb) { cb.onclick = function() { self.close(); }; } },

    show: function(id, opts) {
        this.init();
        var container = this._getContainer(id);
        if (!container || !this._overlay) return;
        if (this._currentId && this._layers[this._currentId]) { var pc = this._getContainer(this._currentId); this._layers[this._currentId].style.display = 'none'; if (pc) pc.style.display = 'none'; if (this._currentId !== id) this._stack.push({ id: this._currentId, container: pc }); }
        var div = this._layers[id];
        if (!div) { div = document.createElement('div'); div.id = 'ai-dialog-layer-' + id; div.className = 'ai-dialog-layer'; container.appendChild(div); this._layers[id] = div; }
        div.innerHTML = this._buildHTML(opts);
        div.style.display = 'flex'; div.style.flexDirection = 'column'; div.style.flex = '1'; div.style.overflow = 'hidden';
        container.style.display = 'flex'; this._overlay.style.display = 'block'; this._currentId = id;
        this._bindButtons(opts); this._bindClose(div);
        if (opts.onRender) opts.onRender();
    },

    refresh: function(id, opts) {
        this.show(id, opts);
    },

    close: function() {
        if (this._currentId && this._layers[this._currentId]) { this._layers[this._currentId].style.display = 'none'; var cc = this._getContainer(this._currentId); if (cc) cc.style.display = 'none'; }
        if (this._stack.length > 0) { var prev = this._stack.pop(); if (this._layers[prev.id]) { this._layers[prev.id].style.display = 'flex'; this._layers[prev.id].style.flexDirection = 'column'; this._layers[prev.id].style.flex = '1'; this._layers[prev.id].style.overflow = 'hidden'; if (prev.container) prev.container.style.display = 'flex'; this._currentId = prev.id; return; } }
        if (this._overlay) this._overlay.style.display = 'none'; if (this._container) this._container.style.display = 'none'; if (this._diffContainer) this._diffContainer.style.display = 'none'; this._currentId = null;
    },

    closeAll: function() { this._stack = []; for (var k in this._layers) { var el = this._layers[k]; if (el && el.parentNode) el.parentNode.removeChild(el); } this._layers = {}; this._currentId = null; if (this._container && this._container.parentNode) this._container.parentNode.removeChild(this._container); if (this._diffContainer && this._diffContainer.parentNode) this._diffContainer.parentNode.removeChild(this._diffContainer); if (this._overlay && this._overlay.parentNode) this._overlay.parentNode.removeChild(this._overlay); this._container = null; this._diffContainer = null; this._overlay = null; }
};