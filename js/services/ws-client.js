// FreeClaw - WebSocket client for server connection
const WSClient = {
    _ws: null,
    _connected: false,
    _url: '',
    _onStatusChange: null,

    init: function(url, onStatusChange) {
        this._url = url || 'ws://127.0.0.1:8080';
        this._onStatusChange = onStatusChange;
    },

    connect: function() {
        if (this._ws) {
            try { this._ws.close(); } catch (e) {}
        }

        this._connected = false;
        this._setStatus(false);

        try {
            this._ws = new WebSocket(this._url);
        } catch (e) {
            this._onTimeout();
            return;
        }

        var self = this;
        var timeout = setTimeout(function() {
            if (!self._connected) {
                self._onTimeout();
            }
        }, 3000);

        this._ws.onopen = function() {
            clearTimeout(timeout);
            self._connected = true;
            self._setStatus(true);
        };

        this._ws.onclose = function() {
            self._connected = false;
            self._setStatus(false);
        };

        this._ws.onerror = function() {
            self._connected = false;
            self._setStatus(false);
        };
    },

    _setStatus: function(connected) {
        if (this._onStatusChange) {
            this._onStatusChange(connected);
        }
    },

    _onTimeout: function() {
        this._connected = false;
        this._setStatus(false);
        SettingsDialog.show();
        Toast.show(
            I18n._lang === 'zh' ? '无法连接服务器，请启动 node server.js' : 'Cannot connect. Start node server.js',
            'error'
        );
    },

    isConnected: function() {
        return this._connected;
    },

    send: function(data) {
        if (this._ws && this._connected) {
            this._ws.send(JSON.stringify(data));
        }
    }
};