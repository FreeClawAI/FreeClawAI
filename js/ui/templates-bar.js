// FreeClaw - User prompt templates bar
const TemplatesBar = {
    _templates: [],

    async load() { this._templates = await DB.getTemplates(); },

    render() {
        const bar = document.getElementById('aiTemplateBar');
        if (!bar) return;
        if (!this._templates.length) { bar.innerHTML = ''; return; }
        bar.innerHTML = this._templates.map((t, i) =>
            `<button class="ai-template-btn" data-idx="${i}" title="${Utils.escAttr(t.prompt)}">${Utils.esc(t.name)}</button>`
        ).join('') + `<button class="ai-template-btn" id="aiManageTemplates">+</button>`;

        bar.querySelectorAll('.ai-template-btn[data-idx]').forEach(btn => {
            btn.onclick = () => {
                const t = this._templates[parseInt(btn.dataset.idx)];
                document.getElementById('aiInput').value = t.prompt;
            };
        });
        const manageBtn = document.getElementById('aiManageTemplates');
        if (manageBtn) manageBtn.onclick = () => this._showManage();
    },

    async add(name, prompt) {
        this._templates.push({ id: Utils.generateId(), name, prompt, createdAt: new Date().toISOString() });
        await DB.saveTemplates(this._templates);
        this.render();
    },

    async remove(id) {
        this._templates = this._templates.filter(t => t.id !== id);
        await DB.saveTemplates(this._templates);
        this.render();
    },

    _showManage() {
        let html = `<h3>${I18n.t('template.title')}</h3><div style="max-height:350px;overflow:auto">`;
        this._templates.forEach(t => {
            html += `<div style="display:flex;align-items:center;padding:6px 0;border-bottom:1px solid #eee">
                <span style="flex:1"><strong>${Utils.esc(t.name)}</strong><br><small>${Utils.esc(t.prompt).substring(0,80)}</small></span>
                <button class="tmpl-edit" data-id="${t.id}">${I18n.t('template.edit')}</button>
                <button class="tmpl-del" data-id="${t.id}">${I18n.t('template.delete')}</button>
            </div>`;
        });
        html += `</div><div class="ai-dialog-btns">
            <button id="aiTmplAdd">${I18n.t('template.create')}</button>
            <button onclick="Dialog.close()">${I18n.t('btn.close')}</button>
        </div>`;
        Dialog.show(html);

        document.querySelectorAll('.tmpl-del').forEach(btn => {
            btn.onclick = async () => { await this.remove(btn.dataset.id); this._showManage(); };
        });
        document.querySelectorAll('.tmpl-edit').forEach(btn => {
            btn.onclick = () => this._showEdit(btn.dataset.id);
        });
        document.getElementById('aiTmplAdd').onclick = () => this._showAdd();
    },

    _showAdd() {
        Dialog.show(`
            <h3>${I18n.t('template.new.title')}</h3>
            <label>${I18n.t('template.name')}</label><input id="aiTmplName" class="ai-dialog-input">
            <label>${I18n.t('template.prompt')}</label><textarea id="aiTmplPrompt" class="ai-dialog-textarea" rows="4"></textarea>
            <div class="ai-dialog-btns">
                <button id="aiTmplSave">${I18n.t('btn.confirm')}</button>
                <button onclick="Dialog.close()">${I18n.t('btn.cancel')}</button>
            </div>
        `);
        document.getElementById('aiTmplSave').onclick = async () => {
            const name = document.getElementById('aiTmplName').value.trim();
            const prompt = document.getElementById('aiTmplPrompt').value.trim();
            if (name && prompt) { await this.add(name, prompt); Dialog.close(); }
        };
    },

    _showEdit(id) {
        const t = this._templates.find(t => t.id === id);
        if (!t) return;
        Dialog.show(`
            <h3>${I18n.t('template.edit.title')}</h3>
            <label>${I18n.t('template.name')}</label><input id="aiTmplName" class="ai-dialog-input" value="${Utils.escAttr(t.name)}">
            <label>${I18n.t('template.prompt')}</label><textarea id="aiTmplPrompt" class="ai-dialog-textarea" rows="4">${Utils.esc(t.prompt)}</textarea>
            <div class="ai-dialog-btns">
                <button id="aiTmplUpdate">${I18n.t('btn.confirm')}</button>
                <button onclick="Dialog.close()">${I18n.t('btn.cancel')}</button>
            </div>
        `);
        document.getElementById('aiTmplUpdate').onclick = async () => {
            t.name = document.getElementById('aiTmplName').value.trim();
            t.prompt = document.getElementById('aiTmplPrompt').value.trim();
            await DB.saveTemplates(this._templates);
            Dialog.close();
            this._showManage();
        };
    }
};