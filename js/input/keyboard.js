// FreeClaw - Keyboard shortcuts
const Keyboard = {
    init: function() {
        var self = this;
        document.addEventListener('keydown', function(e) {
            var panel = document.getElementById('ai-file-panel');
            if (!panel || !panel.classList.contains('show')) return;
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                if (e.shiftKey) {
                    SaveDialog.show();
                } else {
                    var file = Editor._currentFile;
                    if (file && file.fileType === 'user') {
                        file._savePath = (file.workDir || Config.mainDir).replace(/\\/g, '/').replace(/\/$/, '') + '/' + file.name;
                        SaveDialog._saveOne(file).then(function() {
                            FileService.removeUserFile(file.name);
                            FileService.refreshAndRender();
                            Toast.show(I18n.t('Saved {0} files', 1));
                        }).catch(function(e) {
                            Toast.show(I18n.t('Failed: {0}', file.name), 'error');
                        });
                    }
                }
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') { e.preventDefault(); self._newFile(); }
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') { e.preventDefault(); var sf = document.getElementById('aiSearchFiles'); if (sf) sf.focus(); }
            if (e.key === 'Escape') Panel.close();
        });
    },

    _newFile: function() {
        var name = prompt(I18n.t('File name:'));
        if (name) {
            FileTree.addUserFile(name, '');
            Preview.show({ name: name, content: '', isUser: true, fileType: 'user' });
            Editor.startEdit({ name: name, content: '', isUser: true, fileType: 'user' });
        }
    }
};