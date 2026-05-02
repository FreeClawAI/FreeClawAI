// Extract AI-generated code files from AI chat page DOM
const Extractor = {
    extract() {
        const site = this._getSite();
        if (!site) return [];
        const sel = site.extract;
        const files = [];
        const seen = [];

        document.querySelectorAll(sel.container).forEach(block => {
            const pre = sel.codeElement ? block.querySelector(sel.codeElement) : block;
            if (!pre) return;
            const code = (pre.textContent || '').trim();
            if (!code || code.length < 20) return;

            let filename = sel.getFilename(block) || '';
            if (filename) {
                const m = filename.match(/([a-zA-Z0-9_\-\.\/]+\.(?:cs|js|html|css|json|txt|py|java|ts|tsx|jsx|md|xml|yaml|yml|sql|sh|bat|cmd))/i);
                filename = m ? m[1] : '';
            }
            if (!filename) filename = 'code_' + (files.length + 1) + '.txt';

            if (seen.indexOf(filename) === -1) {
                seen.push(filename);
                files.push({ name: filename, content: code, isAi: true });
            }
        });
        return files;
    },

    _getSite() {
        const host = location.hostname;
        for (const key in Sites) {
            if (host.includes(key.replace('www.', ''))) return Sites[key];
        }
        return null;
    }
};