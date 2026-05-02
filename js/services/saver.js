// Save AI/user files to server workspace
const Saver = {
    async saveSelected() {
        const files = FileList.getSelectedFiles().filter(f => f.isAi || f.isUser);
        if (!files.length) return;
        const toCover = files.filter(f => FileList._workFiles.some(w => w.name === f.name));
        const toCreate = files.filter(f => !FileList._workFiles.some(w => w.name === f.name));
        if (toCover.length > 0) {
            this._showCoverDialog(files, toCover, toCreate);
        } else {
            await this._batchSave(files);
        }
    },

    _showCoverDialog(allFiles, toCover, toCreate) {
        let html = `<h3>${I18n.t('save.confirm.title')}</h3>`;
        if (toCover.length > 0) {
            html += `<p style="color:#e65100">${I18n.t('save.coverWarning')}</p>`;
            toCover.forEach(f => {
                html += `<div style="display:flex;align-items:center;padding:4px 0">
                    <input type="checkbox" class="ai-cover-cb" data-name="${Utils.escAttr(f.name)}" checked>
                    <span style="flex:1">${Utils.esc(f.name)}</span>
                    <button class="ai-diff-btn" data-name="${Utils.escAttr(f.name)}">${I18n.t('save.viewDiff')}</button>
                </div>`;
            });
        }
        if (toCreate.length > 0) {
            html += `<p style="color:#2e7d32">${I18n.t('save.newFiles')}</p>`;
            toCreate.forEach(f => html += `<div style="padding:4px 0">📄 ${Utils.esc(f.name)} <span style="color:#999;font-size:11px">${I18n.t('file.new')}</span></div>`);
        }
        html += `<p style="color:#666;font-size:12px">${I18n.t('save.all', toCover.length, toCreate.length)}</p>
            <div class="ai-dialog-btns">
                <button onclick="UI.closeDialog()">${I18n.t('btn.cancel')}</button>
                <button id="aiConfirmCover">${I18n.t('save.confirmBtn')}</button>
            </div>`;
        UI.showDialog(html);

        document.querySelectorAll('.ai-diff-btn').forEach(btn => {
            btn.onclick = () => {
                const name = btn.dataset.name;
                const file = allFiles.find(f => f.name === name);
                DiffView.show(name, file);
            };
        });
        document.getElementById('aiConfirmCover').onclick = async () => {
            UI.closeDialog();
            const selected = [];
            document.querySelectorAll('.ai-cover-cb:checked').forEach(cb => selected.push(cb.dataset.name));
            const toSave = allFiles.filter(f => selected.includes(f.name) || toCreate.includes(f));
            await this._batchSave(toSave);
        };
    },

    async _batchSave(files) {
        let saved = 0;
        for (const f of files) {
            try {
                await this.saveOne(f);
                if (f.isAi) FileList.removeAiFile(f.name);
                if (f.isUser) FileList.removeUserFile(f.name);
                saved++;
            } catch (e) { UI.showToast(I18n.t('toast.saveFail', f.name), 'error'); }
        }
        if (saved > 0) UI.showToast(I18n.t('toast.save', saved));
        await FileList._loadWorkFiles();
        FileList._render();
    },

    async saveOne(file) {
        const existing = FileList._workFiles.find(w => w.name === file.name);
        let md5 = existing?.md5 || null;
        let body = { dir: Config.lastSaveDir, filename: file.name, content: file.content };
        if (md5) body.md5 = md5;

        let r = await fetch(`${Config.serverUrl}/api/files/write`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
        });
        if (r.status === 409) {
            const ok = await UI.confirm(I18n.t('save.conflict', file.name));
            if (!ok) throw new Error('User cancelled');
            body.force = true; delete body.md5;
            r = await fetch(`${Config.serverUrl}/api/files/write`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
            });
        }
        if (!r.ok) { const j = await r.json(); throw new Error(j.error || 'Write failed'); }
        Config.lastSaveDir = Config.mainDir;
    }
};