// FreeClaw - Dialog manager (show/hide layers with stack)
var DialogStack = {
    _overlay: null,
    _container: null,
    _layers: {},
    _stack: [],
    _currentId: null,

    init: function() {
        if (this._container) return;
        this._overlay = document.getElementById('aiDialogOverlay');
        this._container = document.getElementById('aiDialog');
    },

    _buildHTML: function(opts) {
        var html = '';
        if (opts.title) {
            html += '<div class="ai-dialog-header"><h3>' + opts.title + '</h3></div>';
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
                if (el) {
                    el.onclick = function(e) {
                        e.preventDefault();
                        btn.onClick();
                    };
                }
            }
        });
    },

    // Replace current layer content (don't push to stack)
    refresh: function(id, opts) {
        this.init();
        var div = this._layers[id];
        if (!div) {
            div = document.createElement('div');
            div.id = 'ai-dialog-layer-' + id;
            div.className = 'ai-dialog-layer';
            this._container.appendChild(div);
            this._layers[id] = div;
        }
        div.innerHTML = this._buildHTML(opts);
        div.style.display = 'block';
        this._container.style.display = 'block';
        this._overlay.style.display = 'block';
        this._currentId = id;
        this._bindButtons(opts);
        if (opts.onRender) opts.onRender();
        return this;
    },

    // Push new layer on top, hide current
    show: function(id, opts) {
        this.init();
        if (this._currentId && this._layers[this._currentId]) {
            this._layers[this._currentId].style.display = 'none';
            // Only push if different id
            if (this._currentId !== id) {
                this._stack.push(this._currentId);
            }
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
        div.style.display = 'block';
        this._container.style.display = 'block';
        this._overlay.style.display = 'block';
        this._currentId = id;
        this._bindButtons(opts);
        if (opts.onRender) opts.onRender();
        return this;
    },

    close: function() {
        if (this._currentId && this._layers[this._currentId]) {
            this._layers[this._currentId].style.display = 'none';
        }
        if (this._stack.length > 0) {
            var prevId = this._stack.pop();
            if (this._layers[prevId]) {
                this._layers[prevId].style.display = 'block';
                this._currentId = prevId;
                return;
            }
        }
        this._container.style.display = 'none';
        this._overlay.style.display = 'none';
        this._currentId = null;
    },

    closeAll: function() {
        this._stack = [];
        for (var key in this._layers) {
            this._layers[key].style.display = 'none';
        }
        this._container.style.display = 'none';
        this._overlay.style.display = 'none';
        this._currentId = null;
    }
};