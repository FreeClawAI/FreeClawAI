// Code formatter using js-beautify
const Formatter = {
    _loaded: false,
    load() {
        if (this._loaded) return;
        if (typeof beautify === 'undefined') return;
        this._loaded = true;
    },
    format(code, filename) {
        this.load();
        if (!this._loaded || typeof beautify === 'undefined') return code;
        const ext = (filename || '').split('.').pop().toLowerCase();
        try {
            switch (ext) {
                case 'js': case 'ts': case 'jsx': case 'tsx': case 'json':
                    return beautify(code, { indent_size: Config._data.formatTabWidth || 4, space_in_empty_paren: true });
                case 'html': case 'htm':
                    if (typeof html_beautify !== 'undefined') return html_beautify(code, { indent_size: Config._data.formatTabWidth || 4, wrap_line_length: 120 });
                    return code;
                case 'css': case 'scss': case 'less':
                    if (typeof css_beautify !== 'undefined') return css_beautify(code, { indent_size: Config._data.formatTabWidth || 4 });
                    return code;
                default: return code;
            }
        } catch (e) { return code; }
    }
};