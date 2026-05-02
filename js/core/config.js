// Plugin configuration management
const Config = {
    _defaults: { serverUrl: 'http://127.0.0.1:8080', wsUrl: 'ws://127.0.0.1:8080', workDirs: ['workspace'], lastSaveDir: 'workspace', formatTabWidth: 4 },
    _data: {},
    async load() {
        const result = await chrome.storage.local.get('fcConfig');
        this._data = Object.assign({}, this._defaults, result.fcConfig || {});
    },
    async save() { await chrome.storage.local.set({ fcConfig: this._data }); },
    get serverUrl() { return this._data.serverUrl; },
    set serverUrl(v) { this._data.serverUrl = v; this._data.wsUrl = v.replace(/^http/, 'ws'); this.save(); },
    get wsUrl() { return this._data.wsUrl; },
    get workDirs() { return this._data.workDirs; },
    get mainDir() { return this._data.workDirs[0] || 'workspace'; },
    get lastSaveDir() { return this._data.lastSaveDir; },
    set lastSaveDir(v) { this._data.lastSaveDir = v; this.save(); }
};