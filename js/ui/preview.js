// Code preview panel with line numbers + range selection
const Preview = {
    _currentFile: null,
    _selectStart: null,
    _selectEnd: null,
    _clickCount: 0,

    show(file) {
        this._currentFile = file;
        this._selectStart = null;
        this._selectEnd = null;
        this._clickCount = 0;

        const empty = document.getElementById('aiEmpty');
        const nums = document.getElementById('aiLineNumbers');
        const code = document.getElementById('aiPreviewCode');
        if (!file || !file.content) {
            if (empty) empty.style.display = 'flex';
            if (nums) { nums.style.display = 'none'; nums.innerHTML = ''; }
            if (code) { code.style.display = 'none'; }
            return;
        }
        const lines = file.content.split('\n');
        if (nums) {
            nums.style.display = 'block';
            nums.innerHTML = lines.map(function(_, i) {
                return '<span data-line="' + (i + 1) + '">' + (i + 1) + '</span>';
            }).join('\n');
            this._bindLineClick(nums);
        }
        if (code) {
            code.value = file.content;
            code.readOnly = !(file.fileType === 'user');
            code.style.display = 'block';
        }
        if (empty) empty.style.display = 'none';
        this._updateStatusBar();
    },

    _bindLineClick: function(nums) {
        var self = this;
        nums.querySelectorAll('span').forEach(function(span) {
            span.addEventListener('click', function(e) {
                e.stopPropagation();
                var line = parseInt(this.dataset.line);
                self._clickCount++;

                if (self._clickCount === 1) {
                    self._selectStart = line;
                    self._selectEnd = line;
                } else if (self._clickCount === 2) {
                    self._selectEnd = line;
                } else {
                    self._clickCount = 1;
                    self._selectStart = line;
                    self._selectEnd = line;
                }

                self._highlightLines();
                self._updateStatusBar();
            });
        });
    },

    _highlightLines: function() {
        var nums = document.getElementById('aiLineNumbers');
        if (!nums) return;
        var start = this._selectStart;
        var end = this._selectEnd;
        if (start === null) {
            nums.querySelectorAll('span').forEach(function(s) { s.classList.remove('ai-line-sel'); });
            return;
        }
        var lo = Math.min(start, end);
        var hi = Math.max(start, end);
        nums.querySelectorAll('span').forEach(function(s) {
            var n = parseInt(s.dataset.line);
            if (n >= lo && n <= hi) s.classList.add('ai-line-sel');
            else s.classList.remove('ai-line-sel');
        });
    },

    getSelection: function() {
        if (this._selectStart === null) return null;
        var lo = Math.min(this._selectStart, this._selectEnd);
        var hi = Math.max(this._selectStart, this._selectEnd);
        return { start: lo, end: hi, text: this._getSelectedText(lo, hi) };
    },

    _getSelectedText: function(start, end) {
        var code = document.getElementById('aiPreviewCode');
        if (!code) return '';
        var lines = code.value.split('\n');
        return lines.slice(start - 1, end).join('\n');
    },

    _updateStatusBar: function() {
        var sel = this.getSelection();
        var info = document.getElementById('aiSelectionInfo');
        if (!info) return;
        if (sel) {
            info.textContent = 'L' + sel.start + '-' + sel.end + ' (' + (sel.end - sel.start + 1) + ' lines)';
            info.style.display = 'block';
        } else {
            info.style.display = 'none';
        }
    },

    getContent: function() {
        var code = document.getElementById('aiPreviewCode');
        return code ? code.value : '';
    },

    setContent: function(content) {
        var code = document.getElementById('aiPreviewCode');
        if (code) code.value = content;
        this.syncLineNumbers();
    },

    syncLineNumbers: function() {
        var code = document.getElementById('aiPreviewCode');
        var nums = document.getElementById('aiLineNumbers');
        if (!code || !nums) return;
        var lines = code.value.split('\n');
        nums.innerHTML = lines.map(function(_, i) {
            return '<span data-line="' + (i + 1) + '">' + (i + 1) + '</span>';
        }).join('\n');
        this._bindLineClick(nums);
        this._highlightLines();
    },

    scrollSync: function() {
        var code = document.getElementById('aiPreviewCode');
        var nums = document.getElementById('aiLineNumbers');
        if (!code || !nums) return;
        code.onscroll = function() { nums.scrollTop = code.scrollTop; };
    }
};