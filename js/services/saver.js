// FreeClaw - Save AI/user files to server workspace
const Saver = {
    async saveSelected() {
        const files = FileTree.getSelectedFiles().filter(f => f.isAi || f.isUser);
        if (!files.length) return;
        const toCover = files.filter(f => FileTree._workFiles.some(w => w.name === f.name));
        const toCreate = files.filter(f => !FileTree._workFiles.some(w => w.name === f.name));
        if (toCover.length > 0) {
            this._showCoverDialog(files, toCover, toCreate);
        } else {
            await this._batchSave(files);
        }
    },

    _showCoverDialog(allFiles, toCover, toCreate) {
        let html = '<h3>' + I18n.t('save.confirm.title') + '</h3>';
        if (toCover.length > 0) {
            html += '<p style="color:#e65100">' + I18n.t('save.coverWarning') + '</p>';
            toCover.forEach(function(f) {
                html += '<div style="display:flex;align-items:center;padding:4px 0">' +
                    '<input type="checkbox" class="ai-cover-cb" data-name="' + Utils.escAttr(f.name) + '" checked>' +
                    '<span style="flex:1">' + Utils.esc(f.name) + '</span>' +
                    '<button class="ai-diff-btn" data-name="' + Utils.escAttr(f.name) + '">' + I18n.t('save.viewDiff') + '</button>' +
                '</div>';
            });
        }
        if (toCreate.length > 0) {
            html += '<p style="color:#2e7d32">' + I18n.t('save.newFiles') + '</p>';
            toCreate.forEach(function(f) {
                html += '<div style="padding:4px 0">📄 ' + Utils.esc(f.name) + ' <span style="color:#999;font-size:11px">' + I18n.t('file.new') + '</span></div>';
            });
        }
        html += '<p style="color:#666;font-size:12px">' + I18n.t('save.all', toCover.length, toCreate.length) + '</p>' +
            '<div class="ai-dialog-btns">' +
                '<button id="aiCoverCancel">' + I18n.t('btn.cancel') + '</button>' +
                '<button id="aiConfirmCover">' + I18n.t('save.confirmBtn') + '</button>' +
            '</div>';
        Dialog.show(html);

        document.getElementById('aiCoverCancel').onclick = function() { Dialog.close(); };

        document.querySelectorAll('.ai-diff-btn').forEach(function(btn) {
            btn.onclick = function() {
                var name = btn.dataset.name;
                var file = allFiles.find(function(f) { return f.name === name; });
                DiffDialog.show(name, file);
            };
        });
        document.getElementById('aiConfirmCover').onclick = async function() {
            Dialog.close();
            var selected = [];
            document.querySelectorAll('.ai-cover-cb:checked').forEach(function(cb) { selected.push(cb.dataset.name); });
            var toSave = allFiles.filter(function(f) { return selected.indexOf(f.name) !== -1 || toCreate.indexOf(f) !== -1; });
            await Saver._batchSave(toSave);
        };
    },

    async _batchSave(files) {
        var saved = 0;
        for (var i = 0; i < files.length; i++) {
            var f = files[i];
            try {
                await this.saveOne(f);
                if (f.isAi) FileTree.removeAiFile(f.name);
                if (f.isUser) FileTree.removeUserFile(f.name);
                saved++;
            } catch (e) { Toast.show(I18n.t('toast.saveFail', f.name), 'error'); }
        }
        if (saved > 0) Toast.show(I18n.t('toast.save', saved));
        await FileTree._loadWorkFiles();
        FileTree.render();
    },

    async saveOne(file) {
        var existing = FileTree._workFiles.find(function(w) { return w.name === file.name; });
        var md5 = (existing && existing.md5) ? existing.md5 : null;
        var body = { dir: Config.lastSaveDir, filename: file.name, content: file.content };
        if (md5) body.md5 = md5;

        var r = await fetch(Config.serverUrl + '/api/files/write', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (r.status === 409) {
            var ok = confirm(I18n.t('save.conflict', file.name));
            if (!ok) throw new Error('User cancelled');
            body.force = true;
            delete body.md5;
            r = await fetch(Config.serverUrl + '/api/files/write', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
        }
        if (!r.ok) {
            var j = await r.json();
            throw new Error(j.error || 'Write failed');
        }
        Config.lastSaveDir = Config.mainDir;
    }
};