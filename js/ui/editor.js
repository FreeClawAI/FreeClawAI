// Editor mode for user-created files with IndexedDB auto-save
const Editor = {
    _dirty: false,
    _currentFile: null,
    _saveTimer: null,
    startEdit(file) {
        if (!file.isUser && !file.isEditing) return;
        this._currentFile = file;
        this._dirty = false;
        document.getElementById('aiPreviewCode').readOnly = false;
        this._startAutoSave();
    },
    _startAutoSave() {
        clearInterval(this._saveTimer);
        this._saveTimer = setInterval(() => this._autoSave(), 10000);
    },
    async _autoSave() {
        if (!this._dirty || !this._currentFile) return;
        const key = Config.mainDir + '/' + this._currentFile.name;
        await DB.saveFile(key, { name: this._currentFile.name, content: Preview.getContent(), type: 'user', dir: Config.mainDir });
        this._dirty = false;
        UI.showToast(I18n.t('toast.autoSave'));
    },
    markDirty() { this._dirty = true; },
    hasChanges() { return this._dirty; },
    stopAutoSave() { if (this._saveTimer) clearInterval(this._saveTimer); }
};