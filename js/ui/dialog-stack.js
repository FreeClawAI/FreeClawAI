// FreeClaw - Dialog stack manager
var DialogStack = {
    _stack: [],
    _overlay: null,
    _container: null,

    init: function() {
        this._overlay = document.getElementById('aiDialogOverlay');
        this._container = document.getElementById('aiDialog');
    },

    show: function(opts) {
        if (!this._overlay || !this._container) this.init();
        if (this._container.innerHTML) {
            this._stack.push(this._container.innerHTML);
        }
        var html = '';
        if (opts.title) {
            html += '<div class="ai-dialog-header"><h3>' + opts.title + '</h3></div>';
        }
        html += '<div class="ai-dialog-body">' + (opts.body || opts.html || '') + '</div>';
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
        this._container.innerHTML = html;
        this._container.style.display = 'block';
        this._overlay.style.display = 'block';
        var self = this;
        if (opts.buttons) {
            opts.buttons.forEach(function(btn) {
                if (btn.id && btn.onClick) {
                    var el = document.getElementById(btn.id);
                    if (el) el.onclick = btn.onClick;
                }
            });
        }
        if (opts.closeOnOverlay !== false) {
            this._overlay.onclick = function() {
                if (opts.onClose) opts.onClose();
                self.close();
            };
        }
        if (opts.onEsc !== false) {
            var escHandler = function(e) {
                if (e.key === 'Escape') {
                    if (opts.onClose) opts.onClose();
                    self.close();
                    document.removeEventListener('keydown', escHandler);
                }
            };
            document.addEventListener('keydown', escHandler);
        }
        return this;
    },

    close: function() {
        if (this._stack.length > 0) {
            this._container.innerHTML = this._stack.pop();
            this._container.style.display = 'block';
            this._overlay.style.display = 'block';
        } else {
            this._container.innerHTML = '';
            this._container.style.display = 'none';
            this._overlay.style.display = 'none';
            this._overlay.onclick = null;
        }
    },

    closeAll: function() {
        this._stack = [];
        this._container.innerHTML = '';
        this._container.style.display = 'none';
        this._overlay.style.display = 'none';
        this._overlay.onclick = null;
    }
};