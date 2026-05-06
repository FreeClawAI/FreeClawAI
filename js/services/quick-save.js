// FreeClaw - Quick Save Button (skip panel, save AI files directly)
const QuickSave = {
    _btn: null,
    _busy: false,

    init: function() {
        if (document.getElementById('ai-quick-save-btn')) return;

        this._btn = document.createElement('button');
        this._btn.id = 'ai-quick-save-btn';
        this._btn.textContent = '💾';
        this._btn.title = 'FreeClaw - Quick Save';
        var self = this;
        this._btn.onclick = async function() {
            if (self._busy) return;
            self._busy = true;
            try {
                DialogStack.closeAll();
                var connected = await Api.ping();
                if (!connected) {
                    Toast.show(I18n.t('Cannot connect. Start node server.js'), 'error');
                    SettingsDialog.show();
                    return;
                }
                await FileService.refresh();
                var aiFiles = FileService.getUnsavedAiFiles();
                var userFiles = FileService.getUserFiles();
                var allFiles = aiFiles.concat(userFiles);
                if (!allFiles.length) {
                    Toast.show(I18n.t('No files to save'), 'error');
                    return;
                }
                SaveDialog.show(allFiles);
            } finally {
                self._busy = false;
            }
        };
        document.body.appendChild(this._btn);
    },

    show: function() {
        if (this._btn) this._btn.style.display = 'flex';
    },

    hide: function() {
        if (this._btn) this._btn.style.display = 'none';
    }
};