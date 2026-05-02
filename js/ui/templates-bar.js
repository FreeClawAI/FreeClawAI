// FreeClaw - User prompt templates bar
const TemplatesBar = {
    _templates: [],

    async load() { this._templates = await DB.getTemplates(); },

    render() {
        var bar = document.getElementById('aiTemplateBar');
        if (!bar) return;
        if (!this._templates.length) { bar.innerHTML = ''; return; }
        bar.innerHTML = this._templates.map(function(t, i) {
            return '<button class="ai-template-btn" data-idx="' + i + '" title="' + Utils.escAttr(t.prompt) + '">' + Utils.esc(t.name) + '</button>';
        }).join('') + '<button class="ai-template-btn" id="aiManageTemplates">+</button>';

        var self = this;
        bar.querySelectorAll('.ai-template-btn[data-idx]').forEach(function(btn) {
            btn.onclick = function() {
                var t = self._templates[parseInt(this.dataset.idx)];
                document.getElementById('aiInput').value = t.prompt;
            };
        });
        document.getElementById('aiManageTemplates').onclick = function() { self._showManage(); };
    },

    async add(name, prompt) {
        this._templates.push({ id: Utils.generateId(), name: name, prompt: prompt, createdAt: new Date().toISOString() });
        await DB.saveTemplates(this._templates);
        this.render();
    },

    async remove(id) {
        this._templates = this._templates.filter(function(t) { return t.id !== id; });
        await DB.saveTemplates(this._templates);
        this.render();
    },

    _showManage: function() {
        var self = this;
        var html = '<h3>' + I18n.t('Templates') + '</h3><div style="max-height:350px;overflow:auto">';
        this._templates.forEach(function(t) {
            html += '<div style="display:flex;align-items:center;padding:6px 0;border-bottom:1px solid #eee">' +
                '<span style="flex:1"><strong>' + Utils.esc(t.name) + '</strong><br><small>' + Utils.esc(t.prompt).substring(0, 80) + '</small></span>' +
                '<button class="tmpl-edit" data-id="' + t.id + '">' + I18n.t('Edit') + '</button>' +
                '<button class="tmpl-del" data-id="' + t.id + '">' + I18n.t('Delete') + '</button>' +
            '</div>';
        });
        html += '</div><div class="ai-dialog-btns">' +
            '<button id="aiTmplAdd">' + I18n.t('+ New') + '</button>' +
            '<button id="aiTmplClose">' + I18n.t('Close') + '</button>' +
        '</div>';
        Dialog.show(html);

        document.getElementById('aiTmplClose').onclick = function() { Dialog.close(); };
        document.getElementById('aiTmplAdd').onclick = function() { self._showAdd(); };
        document.querySelectorAll('.tmpl-del').forEach(function(btn) {
            btn.onclick = async function() { await self.remove(this.dataset.id); self._showManage(); };
        });
        document.querySelectorAll('.tmpl-edit').forEach(function(btn) {
            btn.onclick = function() { self._showEdit(this.dataset.id); };
        });
    },

    _showAdd: function() {
        var self = this;
        Dialog.show(
            '<h3>' + I18n.t('New Template') + '</h3>' +
            '<label>' + I18n.t('Name') + '</label><input id="aiTmplName" class="ai-dialog-input">' +
            '<label>' + I18n.t('Prompt') + '</label><textarea id="aiTmplPrompt" class="ai-dialog-textarea" rows="4"></textarea>' +
            '<div class="ai-dialog-btns">' +
                '<button id="aiTmplSave">' + I18n.t('Confirm') + '</button>' +
                '<button id="aiTmplCancel">' + I18n.t('Cancel') + '</button>' +
            '</div>'
        );
        document.getElementById('aiTmplCancel').onclick = function() { Dialog.close(); };
        document.getElementById('aiTmplSave').onclick = async function() {
            var name = document.getElementById('aiTmplName').value.trim();
            var prompt = document.getElementById('aiTmplPrompt').value.trim();
            if (name && prompt) { await self.add(name, prompt); Dialog.close(); }
        };
    },

    _showEdit: function(id) {
        var self = this;
        var t = this._templates.find(function(t) { return t.id === id; });
        if (!t) return;
        Dialog.show(
            '<h3>' + I18n.t('Edit Template') + '</h3>' +
            '<label>' + I18n.t('Name') + '</label><input id="aiTmplName" class="ai-dialog-input" value="' + Utils.escAttr(t.name) + '">' +
            '<label>' + I18n.t('Prompt') + '</label><textarea id="aiTmplPrompt" class="ai-dialog-textarea" rows="4">' + Utils.esc(t.prompt) + '</textarea>' +
            '<div class="ai-dialog-btns">' +
                '<button id="aiTmplUpdate">' + I18n.t('Confirm') + '</button>' +
                '<button id="aiTmplCancel">' + I18n.t('Cancel') + '</button>' +
            '</div>'
        );
        document.getElementById('aiTmplCancel').onclick = function() { Dialog.close(); };
        document.getElementById('aiTmplUpdate').onclick = async function() {
            t.name = document.getElementById('aiTmplName').value.trim();
            t.prompt = document.getElementById('aiTmplPrompt').value.trim();
            await DB.saveTemplates(self._templates);
            Dialog.close();
            self._showManage();
        };
    }
};