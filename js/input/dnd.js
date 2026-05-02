// Drag and drop files from OS into the panel
const DnD = {
    init() {
        const panel = document.getElementById('ai-file-panel');
        if (!panel) return;
        panel.addEventListener('dragover', e => { e.preventDefault(); e.stopPropagation(); });
        panel.addEventListener('drop', e => {
            e.preventDefault(); e.stopPropagation();
            const files = e.dataTransfer.files;
            for (let i = 0; i < files.length; i++) this._readFile(files[i]);
        });
    },

    _readFile(file) {
        const reader = new FileReader();
        reader.onload = async (e) => {
            const content = e.target.result;
            FileList.addUserFile(file.name, content);
            await DB.saveFile(Config.mainDir + '/' + file.name, { name: file.name, content, type: 'user', dir: Config.mainDir });
            UI.showToast(I18n.t('toast.add', file.name));
        };
        reader.readAsText(file);
    }
};