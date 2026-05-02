// FreeClaw - Plugin configuration management
const Config = {
    _defaults: {
        serverUrl: 'http://localhost:8080',
        workDirs: [],
        lastSaveDir: '',
        formatTabWidth: 4
    },
    _data: {},

    async load() {
        const result = await chrome.storage.local.get('fcConfig');
        this._data = Object.assign({}, this._defaults, result.fcConfig || {});
    },

    async save() {
        await chrome.storage.local.set({ fcConfig: this._data });
    },

    get serverUrl() {
        return this._data.serverUrl;
    },

    set serverUrl(v) {
        this._data.serverUrl = v;
        this.save();
    },

    get workDirs() {
        return this._data.workDirs || [];
    },

    get mainDir() {
        const dirs = this._data.workDirs || [];
        return dirs[0] || 'workspace';
    },

    get lastSaveDir() {
        return this._data.lastSaveDir || this.mainDir;
    },

    set lastSaveDir(v) {
        this._data.lastSaveDir = v;
        this.save();
    }
};