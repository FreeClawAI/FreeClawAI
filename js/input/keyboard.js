// FreeClaw - Keyboard shortcuts
const Keyboard = {
    init: function() {
        document.addEventListener('keydown', function(e) {
            var panel = document.getElementById('ai-file-panel');
            if (!panel || !panel.classList.contains('show')) return;
            if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); Saver.saveSelected(); }
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') { e.preventDefault(); Keyboard._newFile(); }
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') { e.preventDefault(); var sf = document.getElementById('aiSearchFiles'); if (sf) sf.focus(); }
            if (e.key === 'Escape') Panel.close();
        });
    },

    _newFile: function() {
        var name = prompt(I18n.t('File name:'));
        if (name) {
            FileTree.addUserFile(name, '');
            Preview.show({ name: name, content: '', isUser: true });
            Editor.startEdit({ name: name, content: '', isUser: true });
        }
    }
};