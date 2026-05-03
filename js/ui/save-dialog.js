const SaveDialog = {
    show: function() {
        var aiFiles = FileService.getAiFiles();
        var userFiles = FileService.getUserFiles();
        var allFiles = aiFiles.concat(userFiles);

        if (!allFiles.length) {
            Toast.show(I18n.t('No files to save'), 'error');
            return;
        }

        var workDirs = Config.workDirs || [];
        var multiWorkspace = workDirs.length > 1;

        function formatSavePath(workDir, name) {
            var normalizedWd = workDir.replace(/\\/g, '/');
            var matchedWorkspace = null;
            for (var i = 0; i < workDirs.length; i++) {
                var normalizedRoot = workDirs[i].replace(/\\/g, '/');
                if (normalizedWd.indexOf(normalizedRoot) === 0) {
                    matchedWorkspace = workDirs[i];
                    break;
                }
            }
            if (matchedWorkspace && !multiWorkspace) {
                return name;
            }
            if (matchedWorkspace && multiWorkspace) {
                return getShortName(matchedWorkspace) + ':' + name;
            }
            return normalizedWd + '/' + name;
        }

        var fileItems = allFiles.map(function(f) {
            var wd = f.workDir || Config.mainDir;
            var displayPath = formatSavePath(wd, f.name);
            return {
                name: f.name,
                displayPath: displayPath,
                file: f,
                path: displayPath,
                size: f.size || (f.content ? f.content.length : 0)
            };
        });

        var html = '';

        html += '<div style="display:flex;align-items:center;padding:6px 0;border-bottom:2px solid #ddd;font-size:12px;color:#666;font-weight:bold">' +
            '<span style="width:28px"></span>' +
            '<span style="flex:1">' + I18n.t('File') + '</span>' +
            '<span style="width:70px;text-align:right">' + I18n.t('Size') + '</span>' +
            '<span style="flex:1;padding-left:8px">' + I18n.t('Save to') + '</span>' +
            '<span style="width:40px"></span>' +
            '</div>';

        html += '<div style="max-height:350px;overflow:auto" id="aiSaveFileList">';
        fileItems.forEach(function(item, index) {
            html += '<div class="ai-save-row" data-index="' + index + '" style="display:flex;align-items:center;padding:6px 0;border-bottom:1px solid #f0f0f0">' +
                '<span style="width:28px"><input type="checkbox" class="ai-save-check" data-index="' + index + '" checked></span>' +
                '<span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">📄 ' + Utils.esc(item.displayPath) + '</span>' +
                '<span style="width:70px;text-align:right;font-size:11px;color:#999">' + formatSizeForList(item.size) + '</span>' +
                '<span class="ai-save-path" style="flex:1;padding-left:8px;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#333">' + Utils.esc(item.path) + '</span>' +
                '<span style="width:40px;text-align:center"><button class="ai-save-browse-btn" data-index="' + index + '" style="font-size:11px;padding:2px 6px;border:1px solid #ccc;border-radius:3px;background:white;cursor:pointer">📁</button></span>' +
                '</div>';
        });
        html += '</div>';

        html += '<div style="padding:8px 0;border-top:1px solid #eee;display:flex;align-items:center;gap:12px;font-size:12px;color:#666">' +
            '<label style="cursor:pointer"><input type="checkbox" id="aiSaveSelectAll" checked> ' + I18n.t('All') + '</label>' +
            '<span id="aiSaveSelectedCount">' + fileItems.length + ' ' + I18n.t('files selected') + ' / ' + fileItems.length + ' ' + I18n.t('total') + '</span>' +
            '</div>';

        html += '<div class="ai-dialog-footer">' +
            '<button id="aiSaveCancel">' + I18n.t('Cancel') + '</button>' +
            '<button id="aiSaveConfirm" style="background:#007bff;color:white;border:none">' + I18n.t('Save') + '</button>' +
            '</div>';

        DialogStack.show('save', {
            body: html,
            onRender: function() {
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

                document.querySelectorAll('.ai-save-browse-btn').forEach(function(btn) {
                    btn.onclick = function(e) {
                        e.stopPropagation();
                        var index = parseInt(btn.dataset.index);
                        DirPicker.show(Config.mainDir, function(selectedDir) {
                            var f = fileItems[index].file;
                            var newPath = formatSavePath(selectedDir, getShortName(f.name));
                            fileItems[index].path = newPath;
                            fileItems[index].displayPath = newPath;
                            f._selectedDir = selectedDir;
                            var row = document.querySelector('.ai-save-row[data-index="' + index + '"]');
                            if (row) {
                                var pathEl = row.querySelector('.ai-save-path');
                                if (pathEl) pathEl.textContent = newPath;
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
                        var saveDir = item.file._selectedDir || item.file.workDir || Config.mainDir;
                        if (item.file._selectedDir) {
                            item.file._savePath = saveDir + '/' + getShortName(item.file.name);
                        } else {
                            item.file._savePath = saveDir + '/' + item.file.name;
                        }
                        toSave.push(item.file);
                    });

                    if (!toSave.length) {
                        Toast.show(I18n.t('No files selected'), 'error');
                        return;
                    }

                    var conflicted = await SaveDialog._checkConflicts(toSave);
                    if (conflicted.length > 0) {
                        var msg = I18n.t('The following files have been modified externally:') + '\n\n';
                        conflicted.forEach(function(c) {
                            msg += '📄 ' + c.name + '\n';
                        });
                        msg += '\n' + I18n.t('Do you want to overwrite?');
                        if (!confirm(msg)) return;
                    }

                    DialogStack.close();
                    await SaveDialog._doSave(toSave);
                };
            }
        });
    },

    _checkConflicts: async function(files) {
        var conflicted = [];
        for (var i = 0; i < files.length; i++) {
            var f = files[i];
            var savePath = f._savePath || (f.workDir + '/' + f.name);
            var lastSlash = savePath.lastIndexOf('/');
            var dir = savePath.substring(0, lastSlash);
            var filename = savePath.substring(lastSlash + 1);

            try {
                var r = await fetch(Config.serverUrl + '/api/files/list', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ dir: dir, flat: true })
                });
                var j = await r.json();
                var listFiles = j.files || [];
                var existing = null;
                for (var k = 0; k < listFiles.length; k++) {
                    if (listFiles[k].name === filename && !listFiles[k].isDir) {
                        existing = listFiles[k];
                        break;
                    }
                }
                if (existing && f._origSize != null && f._origMtime != null) {
                    if (existing.size !== f._origSize || existing.mtime !== f._origMtime) {
                        conflicted.push({ name: filename, origSize: f._origSize, newSize: existing.size });
                    }
                }
            } catch (e) {}
        }
        return conflicted;
    },

    _doSave: async function(files) {
        var saved = 0;
        for (var i = 0; i < files.length; i++) {
            var f = files[i];
            try {
                await SaveDialog._saveOne(f);
                if (f.fileType === 'ai') FileTree.removeAiFile(f.name);
                if (f.fileType === 'user') FileTree.removeUserFile(f.name);
                saved++;
            } catch (e) {
                Toast.show(I18n.t('Failed: {0}', getShortName(f.name)), 'error');
            }
        }
        if (saved > 0) Toast.show(I18n.t('Saved {0} files', saved));
        await FileService.refresh();
        FileTree.render();
    },

    _saveOne: async function(file) {
        var savePath = file._savePath || (file.workDir + '/' + file.name);
        var lastSlash = savePath.lastIndexOf('/');
        var dir = savePath.substring(0, lastSlash);
        var filename = savePath.substring(lastSlash + 1);

        var body = { dir: dir, filename: filename, content: file.content };

        var r = await fetch(Config.serverUrl + '/api/files/write', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        var result = await r.json();

        if (!r.ok) {
            throw new Error(result.error || 'Write failed');
        }

        Config.lastSaveDir = dir;
    }
};

function formatSizeForList(bytes) {
    if (!bytes) return '-';
    if (bytes < 1024) return bytes + 'B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'K';
    return (bytes / (1024 * 1024)).toFixed(1) + 'M';
}