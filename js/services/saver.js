// FreeClaw - Save AI/user files to server workspace
const Saver = {
    async saveSelected() {
        var files = FileTree.getSelectedFiles();
        if (!files.length) return;
        var toCover = [];
        var toCreate = [];
        files.forEach(function(f) {
            var dirs = FileService.getAllDirs();
            var exists = false;
            for (var i = 0; i < dirs.length; i++) {
                var workFiles = FileService.getFilesForDir(dirs[i]);
                if (workFiles.some(function(w) { return w.name === f.name && w.isOriginal; })) {
                    exists = true;
                    break;
                }
            }
            if (exists) toCover.push(f); else toCreate.push(f);
        });
        if (toCover.length > 0) {
            this._showCoverDialog(files, toCover, toCreate);
        } else {
            await this._batchSave(files);
        }
    },

    _showCoverDialog: function(allFiles, toCover, toCreate) {
        var html = '<h3>' + I18n.t('Save Confirmation') + '</h3>';
        if (toCover.length > 0) {
            html += '<p style="color:#e65100">' + I18n.t('Overwrite:') + '</p>';
            toCover.forEach(function(f) {
                html += '<div style="display:flex;align-items:center;padding:4px 0">' +
                    '<span style="flex:1">' + Utils.esc(f.name) + '</span>' +
                    '<button class="ai-diff-btn" data-name="' + Utils.escAttr(f.name) + '">' + I18n.t('View Diff') + '</button>' +
                '</div>';
            });
        }
        if (toCreate.length > 0) {
            html += '<p style="color:#2e7d32">' + I18n.t('New:') + '</p>';
            toCreate.forEach(function(f) {
                html += '<div style="padding:4px 0">📄 ' + Utils.esc(f.name) + ' <span style="color:#999;font-size:11px">' + I18n.t('[New]') + '</span></div>';
            });
        }
        html += '<p style="color:#666;font-size:12px">' + I18n.t('All ({0} cover + {1} new)', toCover.length, toCreate.length) + '</p>' +
            '<div class="ai-dialog-btns">' +
                '<button id="aiCoverCancel">' + I18n.t('Cancel') + '</button>' +
                '<button id="aiConfirmCover">' + I18n.t('Confirm Save') + '</button>' +
            '</div>';
        Dialog.show(html);

        document.getElementById('aiCoverCancel').onclick = function() { Dialog.close(); };

        var self = this;
        document.querySelectorAll('.ai-diff-btn').forEach(function(btn) {
            btn.onclick = function() {
                var name = btn.dataset.name;
                var file = allFiles.find(function(f) { return f.name === name; });
                DiffDialog.show(name, file);
            };
        });
        document.getElementById('aiConfirmCover').onclick = async function() {
            Dialog.close();
            var toSave = allFiles.filter(function(f) { return toCreate.indexOf(f) !== -1 || toCover.indexOf(f) !== -1; });
            await self._batchSave(toSave);
        };
    },

    _batchSave: async function(files) {
        var saved = 0;
        for (var i = 0; i < files.length; i++) {
            var f = files[i];
            try {
                await this.saveOne(f);
                if (f.isAi) FileTree.removeAiFile(f.name);
                if (f.isUser) FileTree.removeUserFile(f.name);
                saved++;
            } catch (e) { Toast.show(I18n.t('Failed: {0}', f.name), 'error'); }
        }
        if (saved > 0) Toast.show(I18n.t('Saved {0} files', saved));
        await FileService.refresh();
        FileTree.render();
    },

    saveOne: async function(file) {
        var dir = file._dir || Config.mainDir;
        var workFiles = FileService.getFilesForDir(dir);
        var existing = workFiles.find(function(w) { return w.name === file.name && w.isOriginal; });
        var md5 = (existing && existing.md5) ? existing.md5 : null;
        var body = { dir: dir, filename: file.name, content: file.content };
        if (md5) body.md5 = md5;

        var r = await fetch(Config.serverUrl + '/api/files/write', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
        });
        if (r.status === 409) {
            var ok = confirm(I18n.t('File {0} was modified. Force overwrite?', file.name));
            if (!ok) throw new Error('User cancelled');
            body.force = true; delete body.md5;
            r = await fetch(Config.serverUrl + '/api/files/write', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
            });
        }
        if (!r.ok) { var j = await r.json(); throw new Error(j.error || 'Write failed'); }
        Config.lastSaveDir = dir;
    }
};