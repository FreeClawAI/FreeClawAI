// FreeClaw - Toast notifications
const Toast = {
    _timer: null,

    show: function(msg, type) {
        type = type || 'ok';
        var el = document.getElementById('ai-toast');
        if (!el) {
            el = document.createElement('div');
            el.id = 'ai-toast';
            el.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:9999999;padding:8px 16px;border-radius:6px;font-size:13px;color:white';
            document.body.appendChild(el);
        }
        el.style.background = type === 'error' ? '#dc3545' : '#28a745';
        el.textContent = msg;
        el.style.display = 'block';
        clearTimeout(this._timer);
        this._timer = setTimeout(function() { el.style.display = 'none'; }, 2500);
    }
};