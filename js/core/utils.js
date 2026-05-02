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
    generateId() { return Date.now().toString(36) + Math.random().toString(36).substr(2, 6); },
    debounce(fn, delay) {
        let timer;
        return function(...args) { clearTimeout(timer); timer = setTimeout(() => fn.apply(this, args), delay); };
    }
};