// Extract AI-generated code files from AI chat page DOM
const Extractor = {
    extract() {
        const site = this._getSite();
        if (!site) return [];
        const sel = site.extract;
        const files = [];
        const seen = [];

        var allBlocks = document.querySelectorAll(sel.container);
        if (!allBlocks.length) return [];

        for (let i = allBlocks.length - 1; i >= 0; i--) {
            const lastBlock = allBlocks[i];
            const replyContainer = lastBlock.closest('.ds-markdown') || lastBlock;
            const codeBlocks = replyContainer.querySelectorAll('.md-code-block');
            codeBlocks.forEach(function(block) {
                const pre = sel.codeElement ? block.querySelector(sel.codeElement) : block;
                if (!pre) return;
                const code = (pre.textContent || '').trim();
                if (!code || code.length < 20) return;

                const name = sel.getFilename(block) || '';
                if (!name) return;
                if (name.charAt(0) === '/' || name.charAt(0) === '.' || name.indexOf('..') !== -1) return;
                if (name.indexOf('.') === -1) return;
                var ext = name.split('.').pop();
                if (ext.length > 6) return;

                if (seen.indexOf(name) === -1) {
                    seen.push(name);
                    files.push({ name: name, content: code });
                }
            });
        }
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