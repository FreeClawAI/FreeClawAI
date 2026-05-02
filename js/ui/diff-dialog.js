// FreeClaw - File diff dialog
const DiffDialog = {
    show(filename, aiFile) {
        FileTree._loadContent({ name: filename, isOriginal: true }).then(() => {
            const orig = FileTree.getFileByName(filename);
            if (!orig?.content) return;
            this._render(filename, orig.content, aiFile.content);
        });
    },

    _render(filename, original, modified) {
        const origLines = original.split('\n');
        const modLines = modified.split('\n');
        const diff = this._simpleDiff(origLines, modLines);
        const adds = diff.filter(d => d.type === 'add').length;
        const dels = diff.filter(d => d.type === 'del').length;

        let html = `<h3>${I18n.t('diff.title', Utils.esc(filename))}</h3>
            <div style="display:flex;gap:8px;margin-bottom:8px;font-size:12px">
                <div style="flex:1"><strong>📄 ${I18n.t('diff.original')}</strong> (${origLines.length})</div>
                <div style="flex:1"><strong>🤖 ${I18n.t('diff.modified')}</strong> (${modLines.length})</div>
            </div>
            <div style="max-height:55vh;overflow:auto;font-family:monospace;font-size:12px">`;

        diff.forEach(d => {
            const bg = d.type === 'add' ? '#e6ffe6' : d.type === 'del' ? '#ffe6e6' : 'transparent';
            const sign = d.type === 'add' ? '+' : d.type === 'del' ? '-' : ' ';
            html += `<div style="display:flex;background:${bg}">
                <div style="width:40px;text-align:right;color:#999;padding:1px 6px;flex-shrink:0">${d.oldLine || ''}</div>
                <div style="width:40px;text-align:right;color:#999;padding:1px 6px;flex-shrink:0">${d.newLine || ''}</div>
                <div style="flex:1;padding:1px 6px">${sign} ${Utils.esc(d.text)}</div>
            </div>`;
        });

        html += `</div>
            <div style="margin-top:8px;color:#666;font-size:12px">${I18n.t('diff.changes', adds, dels)}</div>
            <div class="ai-dialog-btns">
                <button id="aiDiffConfirm">${I18n.t('diff.confirm')}</button>
                <button onclick="Dialog.close()">${I18n.t('btn.cancel')}</button>
            </div>`;
        Dialog.show(html);
        document.getElementById('aiDiffConfirm').onclick = () => {
            Dialog.close();
            const aiFiles = FileTree._aiFiles.filter(f => f.name === filename);
            if (aiFiles.length > 0) Saver._batchSave(aiFiles);
        };
    },

    _simpleDiff(oldLines, newLines) {
        const result = [];
        let i = 0, j = 0;
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