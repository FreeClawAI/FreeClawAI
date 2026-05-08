// IndexedDB wrapper for caching user files and state
const DB = {
    _db: null,
    async open() {
        return new Promise((resolve, reject) => {
            const req = indexedDB.open('freeclaw-db', 1);
            req.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains('files')) db.createObjectStore('files', { keyPath: 'key' });
                if (!db.objectStoreNames.contains('templates')) db.createObjectStore('templates', { keyPath: 'id' });
                if (!db.objectStoreNames.contains('state')) db.createObjectStore('state', { keyPath: 'id' });
            };
            req.onsuccess = (e) => { this._db = e.target.result; resolve(); };
            req.onerror = () => reject('IndexedDB open failed');
        });
    },
    async saveFile(key, data) {
        if (!this._db) return;
        const store = this._db.transaction('files', 'readwrite').objectStore('files');
        return new Promise(resolve => { store.put({ key, ...data, updatedAt: Date.now() }); resolve(); });
    },
    async getFile(key) {
        if (!this._db) return null;
        const store = this._db.transaction('files', 'readonly').objectStore('files');
        return new Promise(resolve => { const req = store.get(key); req.onsuccess = () => resolve(req.result); req.onerror = () => resolve(null); });
    },
    async deleteFile(key) {
        if (!this._db) return;
        const store = this._db.transaction('files', 'readwrite').objectStore('files');
        return new Promise(resolve => { store.delete(key); resolve(); });
    },
    async getAllFiles() {
        if (!this._db) return [];
        const store = this._db.transaction('files', 'readonly').objectStore('files');
        return new Promise(resolve => { const req = store.getAll(); req.onsuccess = () => resolve(req.result || []); });
    },
    async saveState(state) {
        if (!this._db) return;
        const store = this._db.transaction('state', 'readwrite').objectStore('state');
        store.put({ id: 'lastState', ...state, updatedAt: Date.now() });
    },
    async getState() {
        if (!this._db) return null;
        const store = this._db.transaction('state', 'readonly').objectStore('state');
        return new Promise(resolve => { const req = store.get('lastState'); req.onsuccess = () => resolve(req.result); });
    },
    async saveTemplates(templates) {
        if (!this._db) return;
        const store = this._db.transaction('templates', 'readwrite').objectStore('templates');
        await new Promise(resolve => { store.clear(); setTimeout(resolve, 50); });
        templates.forEach(t => store.put(t));
    },
    async getTemplates() {
        if (!this._db) return [];
        const store = this._db.transaction('templates', 'readonly').objectStore('templates');
        return new Promise(resolve => { const req = store.getAll(); req.onsuccess = () => resolve(req.result || []); });
    },
    async saveQuickMessages(messages) {
        if (!this._db) return;
        const store = this._db.transaction('files', 'readwrite').objectStore('files');
        return new Promise(resolve => { store.put({ key: '__quick_msgs__', messages: messages, updatedAt: Date.now() }); resolve(); });
    },
    async getQuickMessages() {
        if (!this._db) return [];
        const store = this._db.transaction('files', 'readonly').objectStore('files');
        return new Promise(resolve => { const req = store.get('__quick_msgs__'); req.onsuccess = () => resolve(req.result ? req.result.messages : null); req.onerror = () => resolve(null); });
    }
};