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

        var lastBlock = allBlocks[allBlocks.length - 1];
        var replyContainer = lastBlock.closest('.ds-markdown') || lastBlock;

        var codeBlocks = replyContainer.querySelectorAll('.md-code-block');
        codeBlocks.forEach(function(block) {
            var pre = sel.codeElement ? block.querySelector(sel.codeElement) : block;
            if (!pre) return;
            var code = (pre.textContent || '').trim();
            if (!code || code.length < 20) return;

            var name = sel.getFilename(block) || '';
            if (name) {
                var m = name.match(/([a-zA-Z0-9_\-\.\/]+\.(?:cs|js|html|css|json|txt|py|java|ts|tsx|jsx|md|xml|yaml|yml|sql|sh|bat|cmd))/i);
                name = m ? m[1] : '';
            }
            if (!name) name = 'code_' + (files.length + 1) + '.txt';

            if (seen.indexOf(name) === -1) {
                seen.push(name);
                files.push({ name: name, content: code });
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