// FreeClaw - File diff dialog
const DiffDialog = {
    show: function(filename, aiFile) {
        var dirs = FileService.getAllDirs();
        var origFile = null;
        for (var i = 0; i < dirs.length; i++) {
            var f = FileService.findFile(filename, dirs[i]);
            if (f && f.isOriginal) { origFile = f; break; }
        }
        if (!origFile) return;
        FileTree._loadContent(origFile, origFile._dir || Config.mainDir).then(function() {
            if (!origFile.content) return;
            DiffDialog._render(filename, origFile.content, aiFile.content, aiFile);
        });
    },

    _render: function(filename, original, modified, aiFile) {
        var origLines = original.split('\n');
        var modLines = modified.split('\n');
        var diff = this._simpleDiff(origLines, modLines);
        var adds = diff.filter(function(d) { return d.type === 'add'; }).length;
        var dels = diff.filter(function(d) { return d.type === 'del'; }).length;
        var wd = Config.mainDir;
        if (aiFile && aiFile.workDir) wd = aiFile.workDir;
        var wdName = wd.split('\\').pop().split('/').pop();
        var savePath = wd.replace(/\\/g, '/').replace(/\/$/, '') + '/' + filename;
        var displayPath = '[' + wdName + ']:' + filename;

        var workDirs = Config.workDirs || [];
        function findWorkDir(fullPath) {
            var normalized = fullPath.replace(/\\/g, '/');
            for (var i = 0; i < workDirs.length; i++) {
                var d = workDirs[i].replace(/\\/g, '/');
                if (normalized.indexOf(d) === 0) return workDirs[i];
            }
            return null;
        }
        function extractRelativeName(fullPath, workDir) {
            var normalized = fullPath.replace(/\\/g, '/');
            var w = workDir.replace(/\\/g, '/').replace(/\/$/, '');
            var name = normalized.substring(w.length);
            if (name.charAt(0) === '/') name = name.substring(1);
            return name;
        }

        var body =
            '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;font-size:12px;color:#666">' +
                '<span>' + I18n.t('Save to') + ':</span>' +
                '<span id="aiDiffSavePath" style="background:white;padding:2px 8px;border:1px solid #ddd;border-radius:3px">' + Utils.esc(displayPath) + '</span>' +
                '<button id="aiDiffChangePath" style="padding:2px 6px;border:1px solid #ccc;border-radius:3px;background:white;cursor:pointer;font-size:11px">📁</button>' +
                '<span style="margin-left:auto;font-size:11px">' +
                    '<span style="color:#28a745">+' + adds + '</span> ' +
                    '<span style="color:#dc3545">-' + dels + '</span> ' +
                    '(' + origLines.length + ' / ' + modLines.length + ')' +
                '</span>' +
            '</div>' +
            '<div style="display:flex;gap:0;border:1px solid #ddd;border-radius:4px;overflow:hidden;max-height:70vh;min-height:40vh">' +
                '<div id="aiDiffLeft" style="flex:1;overflow:auto;font-family:monospace;font-size:12px;border-right:1px solid #eee">' +
                    '<div style="padding:3px 10px;background:#f5f5f5;border-bottom:1px solid #eee;font-size:11px;color:#888">' + I18n.t('Original') + '</div>' +
                    '<div style="padding:2px 0">';
        diff.forEach(function(d) {
            var bg = (d.type === 'del' || d.type === 'add') ? '#fff3f3' : 'transparent';
            body += '<div style="display:flex;background:' + bg + ';min-height:18px;white-space:pre">' +
                '<div style="width:36px;text-align:right;color:#999;padding:0 6px;flex-shrink:0;font-size:11px">' + (d.oldLine || '') + '</div>' +
                '<div style="padding:0 6px;overflow:hidden">' + (d.type !== 'add' ? Utils.esc(d.text) : '') + '</div>' +
            '</div>';
        });
        body += '</div></div>' +
                '<div id="aiDiffRight" style="flex:1;overflow:auto;font-family:monospace;font-size:12px">' +
                    '<div style="padding:3px 10px;background:#f5f5f5;border-bottom:1px solid #eee;font-size:11px;color:#888">' + I18n.t('AI') + '</div>' +
                    '<div style="padding:2px 0">';
        diff.forEach(function(d) {
            var bg = (d.type === 'add' || d.type === 'del') ? '#f0fff0' : 'transparent';
            body += '<div style="display:flex;background:' + bg + ';min-height:18px;white-space:pre">' +
                '<div style="width:36px;text-align:right;color:#999;padding:0 6px;flex-shrink:0;font-size:11px">' + (d.newLine || '') + '</div>' +
                '<div style="padding:0 6px;overflow:hidden">' + (d.type !== 'del' ? Utils.esc(d.text) : '') + '</div>' +
            '</div>';
        });
        body += '</div></div></div>';

        DialogStack.show('diff', {
            title: null,
            body: body,
            buttons: [
                { text: I18n.t('Confirm Overwrite'), id: 'aiDiffConfirm', primary: true, onClick: function() {
                    DialogStack.close();
                    var f = aiFile || {};
                    f._savePath = savePath;
                    f.content = modified;
                    SaveDialog._saveOne(f).then(function() {
                        FileService.removeAiFile(filename);
                        FileService.refreshAndRender();
                        Toast.show(I18n.t('Saved {0} files', 1));
                    }).catch(function(e) {
                        Toast.show(I18n.t('Failed: {0}', filename), 'error');
                    });
                }},
                { text: I18n.t('Cancel'), id: 'aiDiffCancel', onClick: function() { DialogStack.close(); } }
            ],
            onRender: function() {
                var container = document.getElementById('aiDialog');
                if (container) {
                    container.style.minWidth = '90%';
                    container.style.maxWidth = '95%';
                }

                var leftPanel = document.getElementById('aiDiffLeft');
                var rightPanel = document.getElementById('aiDiffRight');
                var syncScroll = false;
                leftPanel.addEventListener('scroll', function() {
                    if (!syncScroll) {
                        syncScroll = true;
                        rightPanel.scrollTop = leftPanel.scrollTop;
                        syncScroll = false;
                    }
                });
                rightPanel.addEventListener('scroll', function() {
                    if (!syncScroll) {
                        syncScroll = true;
                        leftPanel.scrollTop = rightPanel.scrollTop;
                        syncScroll = false;
                    }
                });

                document.getElementById('aiDiffChangePath').onclick = function(e) {
                    e.stopPropagation();
                    DirPicker.show(wd, function(selectedDir) {
                        var foundWorkDir = findWorkDir(selectedDir);
                        if (!foundWorkDir) {
                            Toast.show(I18n.t('Can only save to work directories'), 'error');
                            return;
                        }
                        var pureName = Utils.getPureFileName(filename);
                        var fullSavePath = selectedDir.replace(/\\/g, '/').replace(/\/$/, '') + '/' + pureName;
                        var relativeName = extractRelativeName(fullSavePath, foundWorkDir);
                        wd = foundWorkDir;
                        savePath = fullSavePath;
                        filename = relativeName;
                        displayPath = '[' + foundWorkDir.split('\\').pop().split('/').pop() + ']:' + relativeName;
                        var pathEl = document.getElementById('aiDiffSavePath');
                        if (pathEl) pathEl.textContent = displayPath;
                    });
                };
            }
        });
    },

    _simpleDiff: function(oldLines, newLines) {
        var result = [];
        var i = 0, j = 0;
        while (i < oldLines.length || j < newLines.length) {
            if (i < oldLines.length && j < newLines.length && oldLines[i] === newLines[j]) {
                result.push({ type: 'same', oldLine: i + 1, newLine: j + 1, text: oldLines[i] }); i++; j++;
            } else {
                if (i < oldLines.length) { result.push({ type: 'del', oldLine: i + 1, newLine: '', text: oldLines[i] }); i++; }
                if (j < newLines.length) { result.push({ type: 'add', oldLine: '', newLine: j + 1, text: newLines[j] }); j++; }
            }
        }
        return result;
    }
};