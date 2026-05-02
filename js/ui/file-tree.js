// FreeClaw - File tree rendering
const FileTree = {
    _aiFiles: [],
    _workFiles: [],
    _userFiles: [],

    async refresh() {
        this._aiFiles = Extractor.extract();
        await this._loadWorkFiles();
        await this._loadUserFiles();
        this.render();
        this._restoreState();
    },

    async _loadWorkFiles() {
        try {
            const r = await fetch(`${Config.serverUrl}/api/files/list?dir=${encodeURIComponent(Config.mainDir)}`);
            const j = await r.json();
            this._workFiles = (j.files || []).map(f => ({
                name: f.name || f, size: f.size || 0, isOriginal: true
            }));
        } catch (e) { this._workFiles = []; }
    },

    async _loadUserFiles() {
        const all = await DB.getAllFiles();
        this._userFiles = all
            .filter(f => f.dir === Config.mainDir && f.type === 'user')
            .map(f => ({ name: f.name, content: f.content, isUser: true, dbKey: f.key }));
    },

    async _restoreState() {
        const state = await DB.getState();
        if (state?.selectedFiles) {
            state.selectedFiles.forEach(name => {
                const cb = document.querySelector(`.ai-file-item[data-name="${Utils.escAttr(name)}"] input`);
                if (cb) cb.checked = true;
            });
        }
        if (state?.inputText) document.getElementById('aiInput').value = state.inputText;
    },

    async saveState() {
        const selected = [];
        document.querySelectorAll('.ai-file-cb:checked').forEach(cb => {
            selected.push(cb.closest('.ai-file-item').dataset.name);
        });
        await DB.saveState({
            workDir: Config.mainDir,
            selectedFiles: selected,
            inputText: document.getElementById('aiInput').value
        });
    },

    render() {
        const list = [...this._workFiles, ...this._aiFiles, ...this._userFiles];
        const search = document.getElementById('aiSearchFiles')?.value?.toLowerCase() || '';
        const filtered = search ? list.filter(f => f.name.toLowerCase().includes(search)) : list;

        const container = document.getElementById('aiFileList');
        let html = '';
        filtered.forEach((f, i) => {
            const icon = f.isAi ? '🤖' : (f.isUser ? '✏️' : (f._updated ? '✅' : '📄'));
            const exists = f.isAi && this._workFiles.some(w => w.name === f.name);
            const cls = 'ai-file-item' + (exists ? ' ai-exists' : '');
            const type = f.isAi ? 'ai' : (f.isUser ? 'user' : 'original');
            html += `<div class="${cls}" data-idx="${i}" data-name="${Utils.escAttr(f.name)}" oncontextmenu="ContextMenu.show(event,'${Utils.escAttr(f.name)}','${type}')">
                <input type="checkbox" class="ai-file-cb" ${f.isOriginal ? '' : 'checked'}>
                <span class="ai-file-icon">${icon}</span>
                <span class="ai-file-name">${Utils.esc(f.name)}</span>
            </div>`;
        });
        container.innerHTML = html;

        container.querySelectorAll('.ai-file-item').forEach(item => {
            item.onclick = function(e) {
                if (e.target.tagName === 'INPUT') { FileTree.saveState(); return; }
                const name = this.dataset.name;
                const file = FileTree.getFileByName(name);
                if (file) {
                    Preview.show(file);
                    if (file.isUser) Editor.startEdit(file);
                    if (file.isOriginal && !file.content) FileTree._loadContent(file);
                }
            };
        });
        this._updateSelectedInfo();
    },

    getFileByName(name) {
        return [...this._workFiles, ...this._aiFiles, ...this._userFiles].find(f => f.name === name);
    },

    async _loadContent(file) {
        try {
            const r = await fetch(`${Config.serverUrl}/api/files/read`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dir: Config.mainDir, filename: file.name })
            });
            const j = await r.json();
            file.content = j.content;
            file.md5 = j.md5;
            Preview.show(file);
        } catch (e) {
            Preview.show({ name: file.name, content: I18n.t('toast.unableRead') });
        }
    },

    _updateSelectedInfo() {
        const info = document.getElementById('aiSelectedInfo');
        const checked = document.querySelectorAll('.ai-file-cb:checked');
        if (!checked.length) { info.innerHTML = ''; return; }
        const names = [];
        checked.forEach(cb => names.push(cb.closest('.ai-file-item').dataset.name));
        info.innerHTML = I18n.t('file.selected', names.map(n => Utils.esc(n)).join(', '));
    },

    getSelectedFiles() {
        const result = [];
        document.querySelectorAll('.ai-file-cb:checked').forEach(cb => {
            const name = cb.closest('.ai-file-item').dataset.name;
            const f = this.getFileByName(name);
            if (f) result.push(f);
        });
        return result;
    },

    removeAiFile(name) {
        this._aiFiles = this._aiFiles.filter(f => f.name !== name);
        const wf = this._workFiles.find(f => f.name === name);
        if (wf) wf._updated = true;
        this.render();
    },

    removeUserFile(name) {
        this._userFiles = this._userFiles.filter(f => f.name !== name);
        this.render();
    },

    addUserFile(name, content) {
        this._userFiles.push({ name, content, isUser: true });
        this.render();
    }
};