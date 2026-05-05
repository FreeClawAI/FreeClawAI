// FreeClaw - Prompt quick-select bar
const PromptsBar = {
    _prompts: [],

    async load() {
        try {
            var result = await Api.promptsList();
            if (result.success && result.data) this._prompts = result.data;
        } catch (e) {}
        this.render();
    },

    render() {
        var bar = document.getElementById('aiPromptBar');
        if (!this._prompts.length) { bar.innerHTML = ''; return; }
        bar.innerHTML = this._prompts.map(function(p) {
            var title = p.Title || p.title || '';
            var content = p.Content || p.content || '';
            return '<span class="ai-prompt-item">' +
                '<span class="ai-prompt-name" title="' + Utils.escAttr(content) + '">' + Utils.esc(title) + '</span>' +
                '<button class="ai-prompt-select" data-content="' + Utils.escAttr(content) + '">📝</button>' +
                '<button class="ai-prompt-send" data-content="' + Utils.escAttr(content) + '">▶️</button>' +
            '</span>';
        }).join('');

        bar.querySelectorAll('.ai-prompt-select').forEach(function(btn) {
            btn.onclick = function() { document.getElementById('aiInput').value = btn.dataset.content; };
        });
        bar.querySelectorAll('.ai-prompt-send').forEach(function(btn) {
            btn.onclick = function() { Sender.sendDirect(btn.dataset.content); };
        });
    }
};