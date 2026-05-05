// FreeClaw - Toast notifications v5
const Toast = {
    _timer: null,

    show: function(msg, type) {
        type = type || 'ok';
        var el = document.getElementById('ai-toast');
        if (!el) {
            el = document.createElement('div');
            el.id = 'ai-toast';
            el.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:9999999;padding:10px 20px;border-radius:8px;font-size:14px;color:white;text-align:center;max-width:80%;box-shadow:0 4px 20px rgba(0,0,0,0.3);pointer-events:none';
            document.body.appendChild(el);
        }
        el.style.background = type === 'error' ? '#dc3545' : '#28a745';
        el.textContent = msg;
        el.style.display = 'block';
        clearTimeout(this._timer);
        var self = this;
        this._timer = setTimeout(function() { el.style.display = 'none'; }, 3000);
    }
};