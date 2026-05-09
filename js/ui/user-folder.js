// FreeClaw - User message fold / unfold
const UserFolder = {
    _timer: null,

    start: function() {
        if (this._timer) return;
        this._timer = setInterval(function() {
            document.querySelectorAll('._9663006').forEach(function(msg) {
                if (msg._fcUserFoldBound) return;
                msg._fcUserFoldBound = true;
                msg.style.cursor = 'pointer';
                msg.addEventListener('click', function(e) {
                    e.stopPropagation();
                    var content = msg.querySelector('.fbb737a4');
                    if (!content) return;
                    if (content.style.display === 'none') {
                        content.style.display = '';
                        msg.style.opacity = '1';
                    } else {
                        content.style.display = 'none';
                        msg.style.opacity = '0.5';
                    }
                });
            });
        }, 2000);
    },

    stop: function() {
        clearInterval(this._timer);
        this._timer = null;
    }
};