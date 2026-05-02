// FreeClaw - File service (data layer)
var ALLOWED_EXTS = [
    'cs', 'js', 'ts', 'jsx', 'tsx', 'html', 'htm', 'css', 'scss', 'less',
    'json', 'xml', 'yaml', 'yml', 'md', 'txt', 'py', 'java', 'rs', 'go',
    'c', 'cpp', 'h', 'hpp', 'sh', 'bat', 'cmd', 'ps1', 'sql', 'vue',
    'svelte', 'rb', 'php', 'swift', 'kt', 'dart', 'lua', 'r', 'm', 'mm',
    'gitignore', 'env', 'editorconfig', 'prettierrc', 'eslintrc'
];

function isAllowedFile(name) {
    var ext = name.split('.').pop().toLowerCase();
    if (ALLOWED_EXTS.indexOf(ext) !== -1) return true;
    var basename = name.toLowerCase();
    if (basename === 'makefile' || basename === 'dockerfile' || basename === 'license') return true;
    return false;
}

const FileService = {
    _aiFiles: [],
    _workFiles: {},
    _userFiles: [],
    _activeDir: null,

    async refresh() {
        this._aiFiles = Extractor.extract();
        this._activeDir = Config.mainDir;
        await this._loadAllWorkFiles();
        await this._loadUserFiles();
    },

    async _loadAllWorkFiles() {
        this._workFiles = {};
        var dirs = Config.workDirs;

        for (var i = 0; i < dirs.length; i++) {
            await this._loadSingleDir(dirs[i], false);
        }

        var aiNames = this._aiFiles.map(function(f) { return f.name; });
        try {
            var fr = await fetch(Config.serverUrl + '/api/files/find', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dirs: dirs, aiFiles: aiNames })
            });
            var fj = await fr.json();
            var matches = fj.matches || {};

            for (var d in this._workFiles) {
                this._workFiles[d].forEach(function(f) {
                    f._hasAi = matches[f.name] !== null && matches[f.name] !== undefined;
                });
            }

            var mainDir = Config.mainDir;
            var self = this;
            this._aiFiles.forEach(function(aiFile) {
                if (!matches[aiFile.name]) {
                    if (!self._workFiles[mainDir]) self._workFiles[mainDir] = [];
                    self._workFiles[mainDir].push({
                        name: aiFile.name,
                        content: aiFile.content,
                        isAi: true,
                        isNew: true
                    });
                }
            });
        } catch (e) {}
    },

    async _loadSingleDir(dir, addAiNew) {
        try {
            var r = await fetch(Config.serverUrl + '/api/files/list', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dir: dir, flat: true })
            });
            var j = await r.json();
            this._workFiles[dir] = (j.files || []).filter(function(f) {
                return isAllowedFile(f.name || f);
            }).map(function(f) {
                return { name: f.name || f, size: f.size || 0, isOriginal: true };
            });

            var aiNames = this._aiFiles.map(function(f) { return f.name; });
            var self = this;
            this._workFiles[dir].forEach(function(f) {
                f._hasAi = aiNames.indexOf(f.name) !== -1;
            });

            if (addAiNew !== false) {
                var existingNames = this._workFiles[dir].map(function(f) { return f.name; });
                this._aiFiles.forEach(function(aiFile) {
                    if (existingNames.indexOf(aiFile.name) === -1) {
                        self._workFiles[dir].push({
                            name: aiFile.name,
                            content: aiFile.content,
                            isAi: true,
                            isNew: true
                        });
                    }
                });
            }
        } catch (e) {}
    },

    async _loadUserFiles() {
        var all = await DB.getAllFiles();
        this._userFiles = all
            .filter(function(f) { return f.type === 'user'; })
            .map(function(f) { return { name: f.name, content: f.content, isUser: true, dbKey: f.key, dir: f.dir || Config.mainDir }; });
    },

    async loadDir(dir) {
        await this._loadSingleDir(dir);
    },

    getFilesForDir(dir) {
        return this._workFiles[dir] || [];
    },

    getAllDirs() {
        return Config.workDirs;
    },

    getAiFiles() {
        return this._aiFiles;
    },

    getUserFiles() {
        return this._userFiles;
    },

    getActiveDir() {
        return this._activeDir;
    },

    setActiveDir(dir) {
        this._activeDir = dir;
    },

    findFile(name, dir) {
        var files = (this._workFiles[dir] || [])
            .concat(this._aiFiles)
            .concat(this._userFiles);
        return files.find(function(f) { return f.name === name; });
    },

    getFileByName(name) {
        var dirs = Config.workDirs;
        for (var i = 0; i < dirs.length; i++) {
            var f = this.findFile(name, dirs[i]);
            if (f) return f;
        }
        return null;
    },

    removeAiFile(name) {
        this._aiFiles = this._aiFiles.filter(function(f) { return f.name !== name; });
        // Also remove from workFiles
        for (var d in this._workFiles) {
            this._workFiles[d] = this._workFiles[d].filter(function(f) {
                return !(f.isAi && f.name === name);
            });
        }
    },

    removeUserFile(name) {
        this._userFiles = this._userFiles.filter(function(f) { return f.name !== name; });
    },

    addUserFile(name, content) {
        this._userFiles.push({ name: name, content: content, isUser: true });
    }
};