// FreeClaw - File diff dialog
const DiffDialog = {
    show: function(filename, aiFile, onSaved) {
        var dirs = FileService.getAllDirs();
        var origFile = null;
        for (var i = 0; i < dirs.length; i++) {
            var f = FileService.findFile(filename, dirs[i]);
            if (f && f.fileType === 'original') { origFile = f; break; }
        }
        if (origFile) {
            FileTree._loadContent(origFile, origFile.workDir || dirs[0]).then(function() {
                if (!origFile.content) return;
                DiffDialog._render(filename, origFile.content, aiFile.content, aiFile, false, onSaved);
            });
        } else {
            DiffDialog._render(filename, '', aiFile.content, aiFile, true, onSaved);
        }
    },

    _render: function(filename, original, modified, aiFile, isNew, onSaved) {
        var origLines = original ? original.split('\n') : [];
        var modLines = modified.split('\n');
        var diff = isNew ? _newFileDiff(modLines) : _computeDiff(origLines, modLines);
        var adds = 0, dels = 0;
        diff.forEach(function(d) { if (d.added) adds++; if (d.removed) dels++; });

        var workDirs = Config.workDirs || [];
        function findWorkDir(fullPath) { var n = fullPath.replace(/\\/g, '/'); for (var i = 0; i < workDirs.length; i++) { var d = workDirs[i].replace(/\\/g, '/'); if (n.indexOf(d) === 0) return workDirs[i]; } return null; }
        function extractRelativeName(fullPath, workDir) { var n = fullPath.replace(/\\/g, '/'); var w = workDir.replace(/\\/g, '/').replace(/\/$/, ''); var name = n.substring(w.length); if (name.charAt(0) === '/') name = name.substring(1); return name; }

        var wd = Config.mainDir; if (aiFile && aiFile.workDir) wd = aiFile.workDir;
        var wdName = wd.split('\\').pop().split('/').pop();
        var savePath = wd.replace(/\\/g, '/').replace(/\/$/, '') + '/' + filename;
        var displayPath = '[' + wdName + ']:' + filename;
        var saveBtnText = isNew ? I18n.t('Save') : I18n.t('Confirm Overwrite');

        var oldLineNum = 0, newLineNum = 0;
        var leftHtml = '', rightHtml = '';

        diff.forEach(function(d) {
            var val = d.value || '';
            var lines = val.split('\n');
            if (lines.length > 1 && lines[lines.length - 1] === '') lines.pop();
            if (d.removed) {
                lines.forEach(function(line) { oldLineNum++; leftHtml += '<div style="display:flex;background:#fff3f3;line-height:1.5;white-space:pre"><div style="width:36px;text-align:right;color:#999;padding:0 6px;flex-shrink:0;font-size:11px">' + oldLineNum + '</div><div style="flex:1;padding:0 6px;overflow:hidden;white-space:pre">' + Utils.esc(line) + '</div></div>'; });
            } else if (d.added) {
                lines.forEach(function(line) { newLineNum++; rightHtml += '<div style="display:flex;background:#f0fff0;line-height:1.5;white-space:pre"><div style="width:36px;text-align:right;color:#999;padding:0 6px;flex-shrink:0;font-size:11px">' + newLineNum + '</div><div style="flex:1;padding:0 6px;overflow:hidden;white-space:pre">' + Utils.esc(line) + '</div></div>'; });
            } else {
                lines.forEach(function(line) { oldLineNum++; newLineNum++; leftHtml += '<div style="display:flex;background:transparent;line-height:1.5;white-space:pre"><div style="width:36px;text-align:right;color:#999;padding:0 6px;flex-shrink:0;font-size:11px">' + oldLineNum + '</div><div style="flex:1;padding:0 6px;overflow:hidden;white-space:pre">' + Utils.esc(line) + '</div></div>'; rightHtml += '<div style="display:flex;background:transparent;line-height:1.5;white-space:pre"><div style="width:36px;text-align:right;color:#999;padding:0 6px;flex-shrink:0;font-size:11px">' + newLineNum + '</div><div style="flex:1;padding:0 6px;overflow:hidden;white-space:pre">' + Utils.esc(line) + '</div></div>'; });
            }
        });

        var body =
            '<div style="flex-shrink:0;display:flex;align-items:center;gap:8px;padding:8px 0;font-size:12px;color:#666;border-bottom:1px solid #eee">' +
                '<span>' + I18n.t('Save to') + ':</span>' +
                '<span id="aiDiffSavePath" style="background:white;padding:2px 8px;border:1px solid #ddd;border-radius:3px">' + Utils.esc(displayPath) + '</span>' +
                '<button id="aiDiffChangePath" style="padding:2px 6px;border:1px solid #ccc;border-radius:3px;background:white;cursor:pointer;font-size:11px">📁</button>' +
                '<span style="margin-left:auto;font-size:11px"><span style="color:#28a745">+' + adds + '</span> <span style="color:#dc3545">-' + dels + '</span> ' + (isNew ? '(' + modLines.length + I18n.t('[New]') + ')' : '(' + origLines.length + ' / ' + modLines.length + ')') + '</span>' +
            '</div>' +
            '<div style="flex:1;display:flex;min-height:40vh;border:1px solid #ddd;border-radius:4px;overflow:hidden">' +
                '<div id="aiDiffLeft" style="flex:1;overflow:auto;font-family:monospace;font-size:12px;line-height:1.5;border-right:1px solid #eee">' +
                    '<div style="padding:3px 10px;background:#f5f5f5;border-bottom:1px solid #eee;font-size:11px;color:#888;position:sticky;top:0;z-index:1">' + (isNew ? I18n.t('[New]') : I18n.t('Original')) + '</div>' +
                    (isNew ? '<div style="padding:40px;text-align:center;color:#999;font-size:13px">' + I18n.t('[New]') + '</div>' : leftHtml) +
                '</div>' +
                '<div id="aiDiffRight" style="flex:1;overflow:auto;font-family:monospace;font-size:12px;line-height:1.5">' +
                    '<div style="padding:3px 10px;background:#f5f5f5;border-bottom:1px solid #eee;font-size:11px;color:#888;position:sticky;top:0;z-index:1">' + I18n.t('AI') + '</div>' +
                    rightHtml +
                '</div>' +
            '</div>';

        DialogStack.show('diff', {
            title: null,
            body: body,
            buttons: [
                { text: saveBtnText, id: 'aiDiffConfirm', primary: true, onClick: async function() {
                    var f = aiFile || {}; f._savePath = savePath; f.content = modified;
                    try { await SaveDialog._saveOne(f); FileService.removeAiFile(filename); await FileService.refreshAndRender(); Toast.show(I18n.t('Saved {0} files', 1)); }
                    catch (e) { Toast.show(I18n.t('Failed: {0}', filename), 'error'); }
                    finally { DialogStack.close(); if (onSaved) { var uf = FileService.getUnsavedAiFiles().concat(FileService.getUserFiles()); onSaved(uf); } }
                }},
                { text: I18n.t('Cancel'), id: 'aiDiffCancel', onClick: function() { DialogStack.close(); } }
            ],
            onRender: function() {
                var container = document.getElementById('aiDiffDialog');
                if (container) { container.style.width = '95%'; container.style.maxWidth = '95%'; container.style.minHeight = '400px'; container.style.maxHeight = '90vh'; }
                var lp = document.getElementById('aiDiffLeft'), rp = document.getElementById('aiDiffRight');
                if (lp && rp) { var ss = false; lp.onscroll = function() { if (!ss) { ss = true; rp.scrollTop = lp.scrollTop; ss = false; } }; rp.onscroll = function() { if (!ss) { ss = true; lp.scrollTop = rp.scrollTop; ss = false; } }; }
                var cb = document.getElementById('aiDiffChangePath');
                if (cb) { cb.onclick = function(e) { e.stopPropagation(); DirPicker.show(wd, function(sd) { var fw = findWorkDir(sd); if (!fw) { Toast.show(I18n.t('Can only save to work directories'), 'error'); return; } var pn = Utils.getPureFileName(filename); var fp = sd.replace(/\\/g, '/').replace(/\/$/, '') + '/' + pn; var rn = extractRelativeName(fp, fw); wd = fw; savePath = fp; filename = rn; displayPath = '[' + fw.split('\\').pop().split('/').pop() + ']:' + rn; var pe = document.getElementById('aiDiffSavePath'); if (pe) pe.textContent = displayPath; }); }; }
            }
        });
    }
};

function _computeDiff(oldLines, newLines) {
    if (typeof Diff !== 'undefined' && typeof Diff.diffLines === 'function') {
        return Diff.diffLines(oldLines.join('\n'), newLines.join('\n'));
    }
    return _simpleDiff(oldLines, newLines);
}

function _newFileDiff(newLines) {
    return [{ added: true, value: newLines.join('\n') + '\n' }];
}

function _simpleDiff(ol, nl) {
    var r = []; var i = 0, j = 0;
    while (i < ol.length || j < nl.length) {
        if (i < ol.length && j < nl.length && ol[i] === nl[j]) { r.push({ value: ol[i] + '\n' }); i++; j++; }
        else { if (i < ol.length) { r.push({ removed: true, value: ol[i] + '\n' }); i++; } if (j < nl.length) { r.push({ added: true, value: nl[j] + '\n' }); j++; } }
    }
    return r;
}