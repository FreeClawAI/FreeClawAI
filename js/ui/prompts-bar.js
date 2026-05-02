// FreeClaw - Prompt quick-select bar
const PromptsBar = {
    _prompts: [],

    async load() {
        try {
            const r = await fetch(Config.serverUrl + '/api/prompts/list');
            const j = await r.json();
            if (j.success && j.data) this._prompts = j.data;
        } catch (e) { /* Server prompt module may not exist */ }
        this.render();
    },

    render() {
        const bar = document.getElementById('aiPromptBar');
        if (!this._prompts.length) { bar.innerHTML = ''; return; }
        bar.innerHTML = this._prompts.map(p => {
            const title = p.Title || p.title || '';
            const content = p.Content || p.content || '';
            return `<span class="ai-prompt-item">
                <span class="ai-prompt-name" title="${Utils.escAttr(content)}">${Utils.esc(title)}</span>
                <button class="ai-prompt-select" data-content="${Utils.escAttr(content)}">📝</button>
                <button class="ai-prompt-send" data-content="${Utils.escAttr(content)}">▶️</button>
            </span>`;
        }).join('');

        bar.querySelectorAll('.ai-prompt-select').forEach(btn => {
            btn.onclick = () => { document.getElementById('aiInput').value = btn.dataset.content; };
        });
        bar.querySelectorAll('.ai-prompt-send').forEach(btn => {
            btn.onclick = () => Sender.sendDirect(btn.dataset.content);
        });
    }
};