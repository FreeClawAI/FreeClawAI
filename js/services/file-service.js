// FreeClaw - File service (data layer, lazy loading)
var ALLOWED_EXTS = [
    'cs', 'js', 'ts', 'jsx', 'tsx', 'html', 'htm', 'css', 'scss', 'less',
    'json', 'xml', 'yaml', 'yml', 'md', 'txt', 'py', 'java', 'rs', 'go',
    'c', 'cpp', 'h', 'hpp', 'sh', 'bat', 'cmd', 'ps1', 'sql', 'vue',
    'svelte', 'rb', 'php', 'swift', 'kt', 'dart', 'lua', 'r', 'm', 'mm',
    'gitignore', 'env', 'editorconfig', 'prettierrc', 'eslintrc'
];

function isAllowedFile(name) {
    var ext = name.split('.').pop().toLowerCase();
    if (ALLOWED_EXTS.indexOf(ext) !== -1) {
        return true;
    }
    var basename = name.toLowerCase();
    if (basename === 'makefile' || basename === 'dockerfile' || basename === 'license') {
        return true;
    }
    return false;
}

function makeFileId(workDir, name, type) {
    return workDir + '|' + name + '|' + type;
}

const FileService = {
    _aiFiles: [],
    _tree: {},
    _userFiles: [],
    _activeDir: null,
    _fileMap: {},

    async refresh() {
        this._aiFiles = Extractor.extract();
        this._activeDir = Config.mainDir;
        this._tree = {};
        this._fileMap = {};
        await this._loadUserFiles();

        var dirs = Config.workDirs;

        // Load root dirs
        for (var i = 0; i < dirs.length; i++) {
            await this._loadDir(dirs[i]);
        }
        this._tree[Config.mainDir]._expanded = true;

        // Find AI file locations
        var aiNames = this._aiFiles.map(function(f) {
            return f.name;
        });
        var matches = {};
        try {
            var fr = await fetch(Config.serverUrl + '/api/files/find', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    dirs: dirs,
                    aiFiles: aiNames
                })
            });
            var fj = await fr.json();
            matches = fj.matches || {};
        } catch (e) {}

        // Expand paths: load all dirs from root to matchDir
        for (var aiName in matches) {
            var matchDir = matches[aiName];
            if (matchDir) {
                matchDir = matchDir.replace(/\\/g, '/');
                // Find which root dir this belongs to
                var rootDir = null;
                for (var i = 0; i < dirs.length; i++) {
                    var d = dirs[i].replace(/\\/g, '/');
                    if (matchDir.indexOf(d) === 0) {
                        rootDir = d;
                        break;
                    }
                }
                if (rootDir) {
                    var parts = matchDir.substring(rootDir.length).split('/').filter(Boolean);
                    var current = rootDir;
                    for (var i = 0; i < parts.length; i++) {
                        current = current.replace(/\/$/, '') + '/' + parts[i];
                        if (!this._tree[current] || !this._tree[current]._loaded) {
                            await this._loadDir(current);
                        }
                        if (this._tree[current]) {
                            this._tree[current]._expanded = true;
                        }
                    }
                }
            }
        }

        // Insert AI files
        this._insertAiFiles(matches);
    },

    async _loadDir(dir) {
        if (this._tree[dir] && this._tree[dir]._loaded) {
            return;
        }
        try {
            var r = await fetch(Config.serverUrl + '/api/files/list', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    dir: dir,
                    flat: true
                })
            });
            var j = await r.json();
            var items = (j.files || []).filter(function(f) {
                if (f.isDir) {
                    return true;
                }
                return isAllowedFile(f.name || '');
            });
            var children = [];
            var self = this;
            items.forEach(function(f) {
                var node = {
                    name: f.name || f,
                    type: f.isDir ? 'dir' : 'file',
                    size: f.size || 0,
                    mtime: f.mtime || 0,
                    isOriginal: f.isDir ? false : true,
                    workDir: dir,
                    relPath: f.name || f,
                    fileType: f.isDir ? 'dir' : 'original'
                };
                if (!f.isDir) {
                    node.id = makeFileId(dir, node.name, 'original');
                    self._fileMap[node.id] = node;
                }
                children.push(node);
            });
            children.sort(function(a, b) {
                if (a.type !== b.type) {
                    return a.type === 'dir' ? -1 : 1;
                }
                return a.name.localeCompare(b.name);
            });
            this._tree[dir] = {
                name: dir.split('\\').pop().split('/').pop(),
                type: 'dir',
                children: children,
                _loaded: true,
                _expanded: false,
                workDir: dir
            };
        } catch (e) {
            this._tree[dir] = {
                name: dir.split('\\').pop().split('/').pop(),
                type: 'dir',
                children: [],
                _loaded: true,
                _expanded: false,
                workDir: dir
            };
        }
    },

    _insertAiFiles: function(matches) {
        var self = this;
        var mainDir = Config.mainDir;

        this._aiFiles.forEach(function(aiFile) {
            aiFile.workDir = null;
            aiFile.type = 'file';
            aiFile.isAi = true;
            aiFile.fileType = 'ai';

            var matchDir = matches[aiFile.name];
            if (matchDir && self._tree[matchDir]) {
                aiFile.workDir = matchDir;
                aiFile.id = makeFileId(matchDir, aiFile.name, 'ai');
                self._fileMap[aiFile.id] = aiFile;

                var node = self._tree[matchDir];
                for (var i = 0; i < node.children.length; i++) {
                    if (node.children[i].name === aiFile.name && node.children[i].type === 'file' && !node.children[i].isAi) {
                        node.children[i]._hasAi = true;
                        break;
                    }
                }
                var exists = false;
                for (var i = 0; i < node.children.length; i++) {
                    if (node.children[i].isAi && node.children[i].name === aiFile.name) {
                        exists = true;
                        break;
                    }
                }
                if (!exists) {
                    node.children.push(aiFile);
                }
            } else {
                aiFile.workDir = mainDir;
                aiFile.id = makeFileId(mainDir, aiFile.name, 'ai');
                aiFile.isNew = true;
                self._fileMap[aiFile.id] = aiFile;
                var mainNode = self._tree[mainDir];
                if (mainNode) {
                    var exists = false;
                    for (var i = 0; i < mainNode.children.length; i++) {
                        if (mainNode.children[i].isAi && mainNode.children[i].name === aiFile.name) {
                            exists = true;
                            break;
                        }
                    }
                    if (!exists) {
                        mainNode.children.push(aiFile);
                    }
                }
            }
        });
    },

    async loadDir(dir) {
        await this._loadDir(dir);
        if (this._tree[dir]) {
            this._tree[dir]._expanded = true;
        }
    },

    getTree: function(dir) {
        return this._tree[dir];
    },

    getRootDirs: function() {
        return Config.workDirs;
    },

    isDirLoaded: function(dir) {
        return this._tree[dir] && this._tree[dir]._loaded;
    },

    async _loadUserFiles() {
        var all = await DB.getAllFiles();
        var self = this;
        this._userFiles = all.filter(function(f) {
            return f.type === 'user';
        }).map(function(f) {
            var node = {
                name: f.name,
                type: 'file',
                content: f.content,
                isUser: true,
                workDir: f.dir || Config.mainDir,
                relPath: f.name,
                fileType: 'user',
                mtime: f.updatedAt || Date.now()
            };
            node.id = makeFileId(node.workDir, node.name, 'user');
            self._fileMap[node.id] = node;
            return node;
        });
    },

    getAiFiles: function() {
        return this._aiFiles;
    },

    getUserFiles: function() {
        return this._userFiles;
    },

    getActiveDir: function() {
        return this._activeDir;
    },

    setActiveDir: function(dir) {
        this._activeDir = dir;
    },

    getFileByName: function(name) {
        for (var d in this._tree) {
            var children = this._tree[d].children || [];
            for (var i = 0; i < children.length; i++) {
                if (children[i].name === name && children[i].type === 'file') {
                    return children[i];
                }
            }
        }
        return null;
    },

    removeAiFile: function(name) {
        this._aiFiles = this._aiFiles.filter(function(f) {
            return f.name !== name;
        });
        for (var d in this._tree) {
            this._tree[d].children = (this._tree[d].children || []).filter(function(f) {
                return !(f.isAi && f.name === name);
            });
        }
    },

    removeUserFile: function(name) {
        this._userFiles = this._userFiles.filter(function(f) {
            return f.name !== name;
        });
    },

    addUserFile: function(name, content) {
        var node = {
            name: name,
            type: 'file',
            content: content,
            isUser: true,
            workDir: Config.mainDir,
            relPath: name,
            fileType: 'user',
            mtime: Date.now()
        };
        node.id = makeFileId(node.workDir, node.name, 'user');
        this._fileMap[node.id] = node;
        this._userFiles.push(node);
    }
};