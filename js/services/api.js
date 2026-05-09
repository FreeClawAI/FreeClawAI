// FreeClaw - Unified API layer for all server requests
const Api = {
    _baseUrl: function() { return Config.serverUrl; },

    _get: async function(url) {
        var r = await fetch(this._baseUrl() + url);
        var j = await r.json();
        if (!r.ok) throw new Error(j.error || 'HTTP ' + r.status);
        return j;
    },

    _post: async function(url, body) {
        var r = await fetch(this._baseUrl() + url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        var j = await r.json();
        if (!r.ok) throw new Error(j.error || 'HTTP ' + r.status);
        return j;
    },

    ping: async function() {
        try {
            var r = await fetch(this._baseUrl() + '/api/ping');
            return r.ok;
        } catch (e) {
            return false;
        }
    },

    listFiles: async function(dir) {
        var j = await this._post('/api/files/list', { dir: dir });
        return j.files || [];
    },

    treeFiles: async function(dir) {
        var j = await this._post('/api/files/tree', { dir: dir });
        return j.files || [];
    },

    readFile: async function(dir, filename) {
        return await this._post('/api/files/read', { dir: dir, filename: filename });
    },

    writeFile: async function(dir, filename, content) {
        return await this._post('/api/files/write', { dir: dir, filename: filename, content: content });
    },

    writeFileRaw: async function(dir, filename, content) {
        var r = await fetch(this._baseUrl() + '/api/files/write-raw', {
            method: 'POST',
            headers: {
                'X-Save-Dir': dir || '',
                'X-Save-Filename': filename || '',
                'Content-Type': 'text/plain'
            },
            body: content
        });
        var j = await r.json();
        if (!r.ok) throw new Error(j.error || 'Write failed');
        return j;
    },

    findFiles: async function(dirs, aiNames) {
        var j = await this._post('/api/files/find', { dirs: dirs, aiFiles: aiNames });
        return j.matches || {};
    },

    mkdir: async function(dir, name) {
        return await this._post('/api/files/mkdir', { dir: dir, name: name });
    },

    deleteFile: async function(dir, filename) {
        return await this._post('/api/files/delete', { dir: dir, filename: filename });
    },

    getPaths: async function() {
        return await this._get('/api/paths');
    },

    configDirs: async function(dirs) {
        return await this._post('/api/config', { dirs: dirs });
    },

    promptsList: async function() {
        try {
            return await this._get('/api/prompts/list');
        } catch (e) {
            return { success: false, data: [] };
        }
    }
};