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
            DiffDialog._render(filename, origFile.content, aiFile.content);
        });
    },

    _render: function(filename, original, modified) {
        var origLines = original.split('\n');
        var modLines = modified.split('\n');
        var diff = this._simpleDiff(origLines, modLines);
        var adds = diff.filter(function(d) { return d.type === 'add'; }).length;
        var dels = diff.filter(function(d) { return d.type === 'del'; }).length;

        var body =
            '<div style="display:flex;gap:8px;margin-bottom:8px;font-size:12px">' +
                '<div style="flex:1"><strong>📄 ' + I18n.t('Original') + '</strong> (' + origLines.length + ')</div>' +
                '<div style="flex:1"><strong>🤖 ' + I18n.t('AI') + '</strong> (' + modLines.length + ')</div>' +
            '</div>' +
            '<div style="max-height:55vh;overflow:auto;font-family:monospace;font-size:12px">';

        diff.forEach(function(d) {
            var bg = d.type === 'add' ? '#e6ffe6' : d.type === 'del' ? '#ffe6e6' : 'transparent';
            var sign = d.type === 'add' ? '+' : d.type === 'del' ? '-' : ' ';
            body += '<div style="display:flex;background:' + bg + '">' +
                '<div style="width:40px;text-align:right;color:#999;padding:1px 6px;flex-shrink:0">' + (d.oldLine || '') + '</div>' +
                '<div style="width:40px;text-align:right;color:#999;padding:1px 6px;flex-shrink:0">' + (d.newLine || '') + '</div>' +
                '<div style="flex:1;padding:1px 6px">' + sign + ' ' + Utils.esc(d.text) + '</div>' +
            '</div>';
        });

        body += '</div><div style="margin-top:8px;color:#666;font-size:12px">' + I18n.t('+{0} -{1}', adds, dels) + '</div>';

        DialogStack.show('diff', {
            title: I18n.t('Diff: {0}', Utils.esc(filename)),
            body: body,
            buttons: [
                { text: I18n.t('Confirm Overwrite'), id: 'aiDiffConfirm', primary: true, onClick: function() {
                    DialogStack.close();
                    var aiFiles = FileService.getAiFiles().filter(function(f) { return f.name === filename; });
                    if (aiFiles.length > 0) Saver._batchSave(aiFiles);
                }},
                { text: I18n.t('Cancel'), id: 'aiDiffCancel', onClick: function() { DialogStack.close(); } }
            ]
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