// Common utility functions
const Utils = {
    esc(s) {
        if (!s) return '';
        const d = document.createElement('div');
        d.textContent = s;
        return d.innerHTML;
    },
    escAttr(s) {
        if (!s) return '';
        return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    },
    countChars(s) { return (s || '').length; },
    generateId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); },
    debounce(fn, delay) {
        let timer;
        return function(...args) { clearTimeout(timer); timer = setTimeout(() => fn.apply(this, args), delay); };
    },
    normalizeContent(content) {
        if (!content) return '';
        return content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    },
    isSameContent(a, b) {
        return this.normalizeContent(a) === this.normalizeContent(b);
    },
    getPureFileName(name) {
        return (name || '').split('\\').pop().split('/').pop();
    },
    getDirPath(name) {
        if (!name) return '';
        var lastSlash = Math.max(name.lastIndexOf('/'), name.lastIndexOf('\\'));
        return lastSlash >= 0 ? name.substring(0, lastSlash) : '';
    },
    pathJoin: function() {
        var parts = [];
        for (var i = 0; i < arguments.length; i++) {
            if (!arguments[i]) continue;
            var p = String(arguments[i]).replace(/\\/g, '/');
            if (i > 0 && p.charAt(0) === '/') p = p.substring(1);
            parts.push(p.replace(/\/$/, ''));
        }
        return parts.join('/');
    },
    splitPath: function(path) {
        if (!path) return { dir: '', name: '' };
        var normalized = path.replace(/\\/g, '/');
        var lastSlash = normalized.lastIndexOf('/');
        if (lastSlash < 0) return { dir: '', name: normalized };
        return { dir: normalized.substring(0, lastSlash), name: normalized.substring(lastSlash + 1) };
    }
};