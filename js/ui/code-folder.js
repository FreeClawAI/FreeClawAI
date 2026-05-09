// FreeClaw - Code block fold / unfold
const CodeFolder = {
    _timer: null,

    start: function() {
        if (this._timer) return;
        this._timer = setInterval(function() {
            document.querySelectorAll('.md-code-block').forEach(function(block) {
                if (block._fcFoldBound) return;
                block._fcFoldBound = true;
                var banner = block.querySelector('.md-code-block-banner');
                if (!banner) return;
                banner.style.cursor = 'pointer';
                banner.addEventListener('click', function(e) {
                    e.stopPropagation();
                    var pre = block.querySelector('pre');
                    if (!pre) return;
                    if (pre.style.display === 'none') {
                        pre.style.display = '';
                    } else {
                        pre.style.display = 'none';
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