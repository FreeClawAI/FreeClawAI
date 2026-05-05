const SaveDialog = {
    show: async function(preloadedFiles) {
        var allFiles = preloadedFiles;
        if (!allFiles) {
            await FileService.refreshAndRender();
            var aiFiles = FileService.getUnsavedAiFiles();
            var userFiles = FileService.getUserFiles();
            allFiles = aiFiles.concat(userFiles);
        }

        if (!allFiles.length) {
            Toast.show(I18n.t('No files to save'), 'error');
            return;
        }

        var workDirs = Config.workDirs || [];
        if (!workDirs.length) {
            Toast.show(I18n.t('No work directories configured'), 'error');
            return;
        }
        var multiWorkspace = workDirs.length > 1;

        function formatDisplayPath(workDir, name) {
            var wdName = workDir.split('\\').pop().split('/').pop();
            if (!multiWorkspace) {
                return name;
            }
            return '[' + wdName + ']:' + name;
        }

        function findWorkDir(fullPath) {
            var normalized = fullPath.replace(/\\/g, '/');
            for (var i = 0; i < workDirs.length; i++) {
                var d = workDirs[i].replace(/\\/g, '/');
                if (normalized.indexOf(d) === 0) {
                    return workDirs[i];
                }
            }
            return null;
        }

        function extractRelativeName(fullPath, workDir) {
            var normalized = fullPath.replace(/\\/g, '/');
            var wd = workDir.replace(/\\/g, '/').replace(/\/$/, '');
            var name = normalized.substring(wd.length);
            if (name.charAt(0) === '/') name = name.substring(1);
            return name;
        }

        var fileItems = allFiles.map(function(f) {
            var wd = f.workDir || Config.mainDir;
            if (!findWorkDir(wd)) {
                wd = Config.mainDir;
            }
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

        html += '<div style="display:flex;align-items:center;padding:6px 0;border-bottom:2px solid #ddd;font-size:12px;color:#666;font-weight:bold">' +
            '<span style="width:28px"></span>' +
            '<span style="flex:1">' + I18n.t('File') + '</span>' +
            '<span style="width:70px;text-align:right">' + I18n.t('Size') + '</span>' +
            '<span style="flex:1;padding-left:8px">' + I18n.t('Save to') + '</span>' +
            '<span style="width:120px"></span>' +
            '</div>';

        html += '<div style="max-height:350px;overflow:auto" id="aiSaveFileList">';
        fileItems.forEach(function(item, index) {
            var fileDisplay = formatDisplayPath(item.workDir, item._origName);
            var saveToDisplay = formatDisplayPath(item.workDir, item.name);
            html += '<div class="ai-save-row" data-index="' + index + '" style="display:flex;align-items:center;padding:6px 0;border-bottom:1px solid #f0f0f0" title="' + Utils.escAttr(item._origName) + '&#10;' + Utils.escAttr(item.savePath) + '">' +
                '<span style="width:28px"><input type="checkbox" class="ai-save-check" data-index="' + index + '" checked></span>' +
                '<span class="ai-save-file-col" style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + Utils.esc(fileDisplay) + '</span>' +
                '<span style="width:70px;text-align:right;font-size:11px;color:#999">' + formatSizeForList(item.size) + '</span>' +
                '<span class="ai-save-path" style="flex:1;padding-left:8px;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#333">' + Utils.esc(saveToDisplay) + '</span>' +
                '<span style="width:120px;text-align:center">' +
                    '<button class="ai-save-diff-btn" data-index="' + index + '" style="font-size:11px;padding:2px 8px;border:1px solid #ccc;border-radius:3px;background:white;cursor:pointer;margin-right:4px">' + I18n.t('View Diff') + '</button>' +
                    '<button class="ai-save-browse-btn" data-index="' + index + '" style="font-size:11px;padding:2px 6px;border:1px solid #ccc;border-radius:3px;background:white;cursor:pointer">📁</button>' +
                '</span>' +
                '</div>';
        });
        html += '</div>';

        html += '<div style="padding:8px 0;border-top:1px solid #eee;display:flex;align-items:center;gap:12px;font-size:12px;color:#666">' +
            '<label style="cursor:pointer"><input type="checkbox" id="aiSaveSelectAll" checked> ' + I18n.t('All') + '</label>' +
            '<span id="aiSaveSelectedCount">' + fileItems.length + ' ' + I18n.t('files selected') + ' / ' + fileItems.length + ' ' + I18n.t('total') + '</span>' +
            '<span style="font-size:11px;color:#999;margin-left:auto">' + I18n.t('Only work directories can be selected') + '</span>' +
            '</div>';

        html += '<div class="ai-dialog-footer">' +
            '<button id="aiSaveCancel">' + I18n.t('Cancel') + '</button>' +
            '<button id="aiSaveConfirm" style="background:#007bff;color:white;border:none">' + I18n.t('Save') + '</button>' +
            '</div>';

        DialogStack.show('save', {
            title: I18n.t('Save Confirmation'),
            body: html,
            onRender: function() {
                var container = document.getElementById('aiDialog');
                if (container) {
                    container.style.width = '850px';
                    container.style.maxWidth = '95%';
                    container.style.minWidth = '850px';
                    container.style.maxHeight = '';
                }

                var selectAll = document.getElementById('aiSaveSelectAll');
                var countSpan = document.getElementById('aiSaveSelectedCount');

                function updateCount() {
                    var checks = document.querySelectorAll('.ai-save-check:checked');
                    countSpan.textContent = checks.length + ' ' + I18n.t('files selected') + ' / ' + fileItems.length + ' ' + I18n.t('total');
                }

                selectAll.onchange = function() {
                    var checks = document.querySelectorAll('.ai-save-check');
                    checks.forEach(function(c) { c.checked = selectAll.checked; });
                    updateCount();
                };

                document.querySelectorAll('.ai-save-check').forEach(function(cb) {
                    cb.onchange = function() {
                        var checks = document.querySelectorAll('.ai-save-check');
                        var allChecked = true;
                        checks.forEach(function(c) { if (!c.checked) allChecked = false; });
                        selectAll.checked = allChecked;
                        updateCount();
                    };
                });

                document.querySelectorAll('.ai-save-diff-btn').forEach(function(btn) {
                    btn.onclick = function(e) {
                        e.stopPropagation();
                        var index = parseInt(btn.dataset.index);
                        var item = fileItems[index];
                        DiffDialog.show(item._origName, item.file);
                    };
                });

                document.querySelectorAll('.ai-save-browse-btn').forEach(function(btn) {
                    btn.onclick = function(e) {
                        e.stopPropagation();
                        var index = parseInt(btn.dataset.index);
                        var origName = fileItems[index]._origName;
                        DirPicker.show(fileItems[index].workDir, function(selectedDir) {
                            var foundWorkDir = findWorkDir(selectedDir);
                            if (!foundWorkDir) {
                                Toast.show(I18n.t('Can only save to work directories'), 'error');
                                return;
                            }
                            var pureName = Utils.getPureFileName(origName);
                            var fullSavePath = selectedDir.replace(/\\/g, '/').replace(/\/$/, '') + '/' + pureName;
                            var relativeName = extractRelativeName(fullSavePath, foundWorkDir);
                            fileItems[index].workDir = foundWorkDir;
                            fileItems[index].savePath = fullSavePath;
                            fileItems[index].name = relativeName;
                            var newDisplay = formatDisplayPath(foundWorkDir, relativeName);
                            fileItems[index].displayPath = newDisplay;
                            var row = document.querySelector('.ai-save-row[data-index="' + index + '"]');
                            if (row) {
                                var pathEl = row.querySelector('.ai-save-path');
                                if (pathEl) pathEl.textContent = newDisplay;
                                var fileCol = row.querySelector('.ai-save-file-col');
                                if (fileCol) fileCol.innerHTML = Utils.esc(newDisplay);
                                row.title = Utils.esc(relativeName) + '\n' + Utils.esc(fullSavePath);
                            }
                        });
                    };
                });

                document.getElementById('aiSaveCancel').onclick = function() {
                    DialogStack.close();
                };

                document.getElementById('aiSaveConfirm').onclick = async function() {
                    var checks = document.querySelectorAll('.ai-save-check:checked');
                    var toSave = [];
                    checks.forEach(function(c) {
                        var index = parseInt(c.dataset.index);
                        var item = fileItems[index];
                        var f = item.file;
                        f._savePath = item.savePath;
                        f._saveDir = item.workDir;
                        f._newName = item.name;
                        f._origName = item._origName;
                        toSave.push(f);
                    });

                    if (!toSave.length) {
                        Toast.show(I18n.t('No files selected'), 'error');
                        return;
                    }

                    await SaveDialog._doSave(toSave);
                };
            }
        });
    },

    _doSave: async function(files) {
        var saved = 0;
        var pathChanges = [];
        for (var i = 0; i < files.length; i++) {
            var f = files[i];
            try {
                await SaveDialog._saveOne(f);
                if (f._origName && f._newName && f._origName !== f._newName) {
                    pathChanges.push({ from: f._origName, to: f._newName });
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

        if (pathChanges.length > 0) {
            var msg = I18n.t('Path changed') + ':\n';
            pathChanges.forEach(function(c) {
                msg += c.from + ' → ' + c.to + '\n';
            });
            Panel.close();
            var editor = Sender._findEditor();
            if (editor) {
                editor.value = msg;
                editor.dispatchEvent(new Event('input', { bubbles: true }));
                editor.focus();
            }
        }
    },

    _saveOne: async function(file) {
        var savePath = file._savePath || '';
        var lastSlash = savePath.lastIndexOf('/');
        var saveDir = savePath.substring(0, lastSlash);
        var filename = savePath.substring(lastSlash + 1);

        await Api.writeFileRaw(saveDir, filename, file.content);
        Config.lastSaveDir = saveDir;
    },

    _checkConflicts: async function(files) {
        var conflicted = [];
        files.forEach(function(f) {
            var origFile = FileService.getFileByName(f.name, 'original');
            if (!origFile || origFile.content === undefined) return;
            if (Utils.isSameContent(f.content, origFile.content)) return;
            conflicted.push({ name: f.name });
        });
        return conflicted;
    }
};

function formatSizeForList(bytes) {
    if (!bytes) return '-';
    if (bytes < 1024) return bytes + 'B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'K';
    return (bytes / (1024 * 1024)).toFixed(1) + 'M';
}