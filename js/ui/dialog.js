// FreeClaw - Dialog manager (show/hide layers with stack)
var DialogStack = {
    _overlay: null,
    _container: null,
    _layers: {},
    _stack: [],
    _currentId: null,

    init: function() {
        this._overlay = document.getElementById('aiDialogOverlay');
        this._container = document.getElementById('aiDialog');
        if (!this._overlay || !this._container) {
            this._createContainers();
        }
    },

    _createContainers: function() {
        this._overlay = document.createElement('div');
        this._overlay.id = 'aiDialogOverlay';
        this._overlay.className = 'ai-dialog-overlay';
        this._overlay.style.display = 'none';
        document.body.appendChild(this._overlay);

        this._container = document.createElement('div');
        this._container.id = 'aiDialog';
        this._container.className = 'ai-dialog';
        this._container.style.display = 'none';
        document.body.appendChild(this._container);
    },

    _buildHTML: function(opts) {
        var html = '';
        if (opts.title !== null && opts.title !== undefined) {
            html += '<div class="ai-dialog-header"><h3>' + (opts.title || '') + '</h3><button class="ai-dialog-close">✕</button></div>';
        }
        html += '<div class="ai-dialog-body">' + (opts.body || '') + '</div>';
        if (opts.buttons && opts.buttons.length > 0) {
            html += '<div class="ai-dialog-footer">';
            opts.buttons.forEach(function(btn) {
                var cls = btn.primary ? 'ai-dialog-btn primary' : 'ai-dialog-btn';
                html += '<button id="' + (btn.id || '') + '" class="' + cls + '">' + btn.text + '</button>';
            });
            html += '</div>';
        } else if (opts.footer) {
            html += '<div class="ai-dialog-footer">' + opts.footer + '</div>';
        }
        return html;
    },

    _bindButtons: function(opts) {
        if (!opts.buttons) return;
        opts.buttons.forEach(function(btn) {
            if (btn.id && btn.onClick) {
                var el = document.getElementById(btn.id);
                if (el) el.onclick = function(e) { e.preventDefault(); btn.onClick(); };
            }
        });
    },

    _bindClose: function(div) {
        var self = this;
        var closeBtn = div.querySelector('.ai-dialog-close');
        if (closeBtn) {
            closeBtn.onclick = function() { self.close(); };
        }
    },

    confirm: function(msg, onOk, onCancel) {
        this.show('confirm', {
            title: null,
            body: '<p style="text-align:center;padding:20px 0;font-size:14px">' + Utils.esc(msg) + '</p>',
            buttons: [
                { text: I18n.t('Confirm'), id: 'aiConfirmOk', primary: true, onClick: function() {
                    DialogStack.close();
                    if (onOk) onOk();
                }},
                { text: I18n.t('Cancel'), id: 'aiConfirmCancel', onClick: function() {
                    DialogStack.close();
                    if (onCancel) onCancel();
                }}
            ]
        });
    },

    refresh: function(id, opts) {
        this.init();
        if (!this._container || !this._overlay) return;
        var div = this._layers[id];
        if (!div) {
            div = document.createElement('div');
            div.id = 'ai-dialog-layer-' + id;
            div.className = 'ai-dialog-layer';
            this._container.appendChild(div);
            this._layers[id] = div;
        }
        div.innerHTML = this._buildHTML(opts);
        div.style.display = 'flex';
        div.style.flexDirection = 'column';
        div.style.flex = '1';
        div.style.overflow = 'hidden';
        this._container.style.display = 'flex';
        this._overlay.style.display = 'block';
        this._currentId = id;
        this._bindButtons(opts);
        this._bindClose(div);
        if (opts.onRender) opts.onRender();
    },

    show: function(id, opts) {
        this.init();
        if (!this._container || !this._overlay) return;
        if (this._currentId && this._layers[this._currentId]) {
            this._layers[this._currentId].style.display = 'none';
            if (this._currentId !== id) this._stack.push(this._currentId);
        }
        var div = this._layers[id];
        if (!div) {
            div = document.createElement('div');
            div.id = 'ai-dialog-layer-' + id;
            div.className = 'ai-dialog-layer';
            this._container.appendChild(div);
            this._layers[id] = div;
        }
        div.innerHTML = this._buildHTML(opts);
        div.style.display = 'flex';
        div.style.flexDirection = 'column';
        div.style.flex = '1';
        div.style.overflow = 'hidden';
        this._container.style.display = 'flex';
        this._overlay.style.display = 'block';
        this._currentId = id;
        this._bindButtons(opts);
        this._bindClose(div);
        if (opts.onRender) opts.onRender();
    },

    close: function() {
        if (this._currentId && this._layers[this._currentId]) {
            this._layers[this._currentId].style.display = 'none';
        }
        if (this._stack.length > 0) {
            var prevId = this._stack.pop();
            if (this._layers[prevId]) {
                this._layers[prevId].style.display = 'flex';
                this._layers[prevId].style.flexDirection = 'column';
                this._layers[prevId].style.flex = '1';
                this._layers[prevId].style.overflow = 'hidden';
                this._currentId = prevId;
                return;
            }
        }
        if (this._overlay) this._overlay.style.display = 'none';
        if (this._container) this._container.style.display = 'none';
        this._currentId = null;
    },

    closeAll: function() {
        this._stack = [];
        for (var key in this._layers) {
            if (this._layers[key]) {
                var el = this._layers[key];
                if (el.parentNode) el.parentNode.removeChild(el);
            }
        }
        this._layers = {};
        this._currentId = null;
        if (this._container && this._container.parentNode) {
            this._container.parentNode.removeChild(this._container);
        }
        if (this._overlay && this._overlay.parentNode) {
            this._overlay.parentNode.removeChild(this._overlay);
        }
        this._container = null;
        this._overlay = null;
    }
};