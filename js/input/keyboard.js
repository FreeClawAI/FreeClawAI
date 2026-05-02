// Keyboard shortcuts for the panel
const Keyboard = {
    init() {
        document.addEventListener('keydown', e => {
            if (!document.getElementById('ai-file-panel')?.classList.contains('show')) return;
            if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); Saver.saveSelected(); }
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') { e.preventDefault(); this._newFile(); }
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') { e.preventDefault(); document.getElementById('aiSearchFiles')?.focus(); }
            if (e.key === 'Escape') UI.close();
        });
    },

    _newFile() {
        const name = prompt(I18n.t('btn.newFile') + ':');
        if (name) {
            FileList.addUserFile(name, '');
            Preview.show({ name, content: '', isUser: true });
            Editor.startEdit({ name, content: '', isUser: true });
        }
    }
};