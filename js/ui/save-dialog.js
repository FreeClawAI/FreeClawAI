const SaveDialog = {
    show: async function(preloadedFiles) {
        DialogStack.show('save', {
            title: I18n.t('Save Confirmation'),
            body: '<div style="text-align:center;padding:40px;color:#999">' + I18n.t('Loading...') + '</div>',
            buttons: [
                { text: I18n.t('Cancel'), id: 'aiSaveCancel', onClick: function() { DialogStack.close(); } }
            ],
            onRender: function() {
                var container = document.getElementById('aiDialog');
                if (container) {
                    container.style.width = '850px';
                    container.style.maxWidth = '95%';
                    container.style.minWidth = '850px';
                }
            }
        });

        var connected = await Api.ping();
        if (!connected) {
            DialogStack.close();
            SettingsDialog.show();
            Toast.show(I18n.t('Cannot connect. Start node server.js'), 'error');
            return;
        }

        var allFiles = preloadedFiles;
        if (!allFiles) {
            await FileService.refreshAndRender();
            var aiFiles = FileService.getUnsavedAiFiles();
            var userFiles = FileService.getUserFiles();
            allFiles = aiFiles.concat(userFiles);
        }

        if (!allFiles.length) {
            Toast.show(I18n.t('No files to save'), 'error');
        }
        this._renderFull(allFiles);
    },

    _renderFull: function(allFiles) {
        var workDirs = Config.workDirs || [];
        var multiWorkspace = workDirs.length > 1;

        function formatDisplayPath(workDir, name) {
            var wdName = workDir.split('\\').pop().split('/').pop();
            if (!multiWorkspace) return name;
            return '[' + wdName + ']:' + name;
        }

        function findWorkDir(fullPath) {
            var n = fullPath.replace(/\\/g, '/');
            for (var i = 0; i < workDirs.length; i++) {
                var d = workDirs[i].replace(/\\/g, '/');
                if (n.indexOf(d) === 0) return workDirs[i];
            }
            return null;
        }

        function extractRelativeName(fullPath, workDir) {
            var n = fullPath.replace(/\\/g, '/');
            var w = workDir.replace(/\\/g, '/').replace(/\/$/, '');
            var name = n.substring(w.length);
            if (name.charAt(0) === '/') name = name.substring(1);
            return name;
        }

        var fileItems = allFiles.map(function(f) {
            var wd = f.workDir || Config.mainDir;
            if (!findWorkDir(wd)) wd = Config.mainDir;
            var savePath = wd.replace(/\\/g, '/').replace(/\/$/, '') + '/' + f.name;
            var displayPath = formatDisplayPath(wd, f.name);
            return {
                name: f.name,
                displayPath: displayPath,
                content: f.content,
                size: f.size || (f.content ? f.content.length : 0),
                workDir: wd,
                savePath: savePath,
                file: f,
                _origName: f.name
            };
        });

        var html = '';
        html += '<div style="display:flex;align-items:center;padding:6px 0;border-bottom:2px solid #ddd;font-size:12px;color:#666;font-weight:bold">';
        html += '<span style="width:28px"></span>';
        html += '<span style="flex:1">' + I18n.t('File') + '</span>';
        html += '<span style="width:70px;text-align:right">' + I18n.t('Size') + '</span>';
        html += '<span style="flex:1;padding-left:8px">' + I18n.t('Save to') + '</span>';
        html += '<span style="width:120px"></span>';
        html += '</div>';
        html += '<div style="max-height:350px;overflow:auto" id="aiSaveFileList">';
        fileItems.forEach(function(item, index) {
            var fileDisplay = formatDisplayPath(item.workDir, item._origName);
            var saveToDisplay = formatDisplayPath(item.workDir, item.name);
            html += '<div class="ai-save-row" data-index="' + index + '" style="display:flex;align-items:center;padding:6px 0;border-bottom:1px solid #f0f0f0" title="' + Utils.escAttr(item._origName) + '&#10;' + Utils.escAttr(item.savePath) + '">';
            html += '<span style="width:28px"><input type="checkbox" class="ai-save-check" data-index="' + index + '" checked></span>';
            html += '<span class="ai-save-file-col" style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + Utils.esc(fileDisplay) + '</span>';
            html += '<span style="width:70px;text-align:right;font-size:11px;color:#999">' + formatSizeForList(item.size) + '</span>';
            html += '<span class="ai-save-path" style="flex:1;padding-left:8px;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#333">' + Utils.esc(saveToDisplay) + '</span>';
            html += '<span style="width:120px;text-align:center">';
            html += '<button class="ai-save-diff-btn" data-index="' + index + '" style="font-size:11px;padding:2px 8px;border:1px solid #ccc;border-radius:3px;background:white;cursor:pointer;margin-right:4px">' + I18n.t('View Diff') + '</button>';
            html += '<button class="ai-save-browse-btn" data-index="' + index + '" style="font-size:11px;padding:2px 6px;border:1px solid #ccc;border-radius:3px;background:white;cursor:pointer">📁</button>';
            html += '</span></div>';
        });
        html += '</div>';
        html += '<div style="padding:8px 0;border-top:1px solid #eee;display:flex;align-items:center;gap:12px;font-size:12px;color:#666">';
        html += '<label style="cursor:pointer"><input type="checkbox" id="aiSaveSelectAll" checked> ' + I18n.t('All') + '</label>';
        html += '<span id="aiSaveSelectedCount">' + fileItems.length + ' ' + I18n.t('files selected') + ' / ' + fileItems.length + ' ' + I18n.t('total') + '</span>';
        html += '<span style="font-size:11px;color:#999;margin-left:auto">' + I18n.t('Only work directories can be selected') + '</span>';
        html += '</div>';
        html += '<div class="ai-dialog-footer">';
        html += '<button id="aiSaveCancel" style="width:70px;height:30px">' + I18n.t('Cancel') + '</button>';
        html += '<button id="aiSaveSendProtocol" style="background:#17a2b8;color:white;border:none;width:70px;height:30px">' + I18n.t('Protocol') + '</button>';
        html += '<button id="aiSaveConfirm" style="background:#007bff;color:white;border:none;width:70px;height:30px">' + I18n.t('Save') + '</button>';
        html += '</div>';

        var self = this;
        DialogStack.refresh('save', {
            title: I18n.t('Save Confirmation'),
            body: html,
            onRender: function() {
                var container = document.getElementById('aiDialog');
                if (container) {
                    container.style.width = '850px';
                    container.style.maxWidth = '95%';
                    container.style.minWidth = '850px';
                    container.style.minHeight = '';
                    container.style.maxHeight = '';
                }

                var cancelBtn = document.getElementById('aiSaveCancel');
                var protocolBtn = document.getElementById('aiSaveSendProtocol');
                var confirmBtn = document.getElementById('aiSaveConfirm');
                var selectAll = document.getElementById('aiSaveSelectAll');
                var countSpan = document.getElementById('aiSaveSelectedCount');

                if (cancelBtn) {
                    cancelBtn.onclick = function() { DialogStack.close(); };
                }
                if (protocolBtn) {
                    protocolBtn.onclick = function() {
                        var msgs = DEFAULT_MESSAGES();
                        var protocol = msgs[0].content;
                        var editor = Sender._findEditor();
                        if (editor) {
                            var old = editor.value;
                            editor.value = old ? old + '\n\n' + protocol : protocol;
                            editor.dispatchEvent(new Event('input', { bubbles: true }));
                            editor.focus();
                            DialogStack.close();
                            Panel.close();
                        }
                    };
                }

                if (fileItems.length === 0) {
                    if (selectAll) selectAll.style.display = 'none';
                    if (countSpan) countSpan.textContent = '0 / 0';
                    if (confirmBtn) confirmBtn.onclick = function() {
                        Toast.show(I18n.t('No files to save'), 'error');
                    };
                    return;
                }

                function updateCount() {
                    var checks = document.querySelectorAll('.ai-save-check:checked');
                    countSpan.textContent = checks.length + ' ' + I18n.t('files selected') + ' / ' + fileItems.length + ' ' + I18n.t('total');
                }

                if (selectAll) {
                    selectAll.onchange = function() {
                        var checks = document.querySelectorAll('.ai-save-check');
                        checks.forEach(function(c) { c.checked = selectAll.checked; });
                        updateCount();
                    };
                }

                document.querySelectorAll('.ai-save-check').forEach(function(cb) {
                    cb.onchange = function() {
                        var checks = document.querySelectorAll('.ai-save-check');
                        var ac = true;
                        checks.forEach(function(c) { if (!c.checked) ac = false; });
                        selectAll.checked = ac;
                        updateCount();
                    };
                });

                document.querySelectorAll('.ai-save-diff-btn').forEach(function(btn) {
                    btn.onclick = function(e) {
                        e.stopPropagation();
                        var idx = parseInt(btn.dataset.index);
                        var item = fileItems[idx];
                        DiffDialog.show(item._origName, item.file, function(updatedFiles) {
                            self.show(updatedFiles);
                        });
                    };
                });

                document.querySelectorAll('.ai-save-browse-btn').forEach(function(btn) {
                    btn.onclick = function(e) {
                        e.stopPropagation();
                        var idx = parseInt(btn.dataset.index);
                        var origName = fileItems[idx]._origName;
                        DirPicker.show(fileItems[idx].workDir, function(sd) {
                            var fw = findWorkDir(sd);
                            if (!fw) {
                                Toast.show(I18n.t('Can only save to work directories'), 'error');
                                return;
                            }
                            var fullPath = sd.replace(/\\/g, '/').replace(/\/$/, '') + '/' + Utils.getPureFileName(origName);
                            var newName = extractRelativeName(fullPath, fw);
                            fileItems[idx].workDir = fw;
                            fileItems[idx].savePath = fullPath;
                            fileItems[idx].name = newName;
                            var nd = formatDisplayPath(fw, newName);
                            var row = document.querySelector('.ai-save-row[data-index="' + idx + '"]');
                            if (row) {
                                var pe = row.querySelector('.ai-save-path');
                                if (pe) pe.textContent = nd;
                            }
                        });
                    };
                });

                if (confirmBtn) {
                    confirmBtn.onclick = async function() {
                        var checks = document.querySelectorAll('.ai-save-check:checked');
                        var ts = [];
                        checks.forEach(function(c) {
                            var idx = parseInt(c.dataset.index);
                            var item = fileItems[idx];
                            var f = item.file;
                            f._savePath = item.savePath;
                            f._saveDir = item.workDir;
                            f._newName = item.name;
                            f._origName = item._origName;
                            ts.push(f);
                        });
                        if (!ts.length) {
                            Toast.show(I18n.t('No files selected'), 'error');
                            return;
                        }
                        await self._doSave(ts);
                    };
                }
            }
        });
    },

    _doSave: async function(files) {
        var saved = 0;
        var pc = [];
        for (var i = 0; i < files.length; i++) {
            var f = files[i];
            try {
                await SaveDialog._saveOne(f);
                if (f._origName && f._newName && f._origName !== f._newName) {
                    pc.push({ from: f._origName, to: f._newName });
                }
                FileService.removeAiFile(f._origName || f.name);
                saved++;
            } catch (e) {
                Toast.show(I18n.t('Failed: {0}', f.name), 'error');
            }
        }
        if (saved > 0) {
            Toast.show(I18n.t('Saved {0} files', saved));
            DialogStack.close();
        }
        await FileService.refreshAndRender();
        if (pc.length > 0) {
            var msg = I18n.t('Path changed') + ':\n';
            pc.forEach(function(c) { msg += c.from + ' → ' + c.to + '\n'; });
            Panel.close();
            var ed = Sender._findEditor();
            if (ed) {
                ed.value = msg;
                ed.dispatchEvent(new Event('input', { bubbles: true }));
                ed.focus();
            }
        }
    },

    _saveOne: async function(file) {
        var sp = file._savePath || '';
        var ls = sp.lastIndexOf('/');
        if (ls < 0) { throw new Error('Invalid path: ' + sp); }
        var sd = sp.substring(0, ls);
        var fn = sp.substring(ls + 1);
        try {
            await Api.writeFileRaw(sd, fn, file.content);
            Config.lastSaveDir = sd;
        } catch (e) {
            throw new Error(e.message);
        }
    }
};

function formatSizeForList(bytes) {
    if (!bytes) return '-';
    if (bytes < 1024) return bytes + 'B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'K';
    return (bytes / (1024 * 1024)).toFixed(1) + 'M';
}