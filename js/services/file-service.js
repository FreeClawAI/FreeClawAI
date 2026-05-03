// FreeClaw - File service (tree state + AI <-> original matching)
function makeFileId(workDir, name, type) {
    return workDir + '|' + name + '|' + type;
}

function getShortName(name) {
    return (name || '').split('\\').pop().split('/').pop();
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

        for (var i = 0; i < dirs.length; i++) {
            await this._loadDir(dirs[i]);
        }
        this._tree[Config.mainDir]._expanded = true;

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

        for (var aiName in matches) {
            var info = matches[aiName];
            if (info && info.path) {
                var matchPath = info.path.replace(/\\/g, '/');
                var matchDir = matchPath.substring(0, matchPath.lastIndexOf('/'));
                if (matchDir) {
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
        }

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
            var items = j.files;
            var children = [];
            var self = this;
            items.forEach(function(f) {
                var node = {
                    name: f.name || f,
                    type: f.isDir ? 'dir' : 'file',
                    size: f.size || 0,
                    mtime: f.mtime || 0,
                    workDir: dir,
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
            var info = matches[aiFile.name];

            if (info && info.content !== undefined) {
                var aiContent = (aiFile.content || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
                var origContent = (info.content || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
                if (aiContent === origContent) {
                    var matchPath = info.path.replace(/\\/g, '/');
                    var matchDir = matchPath.substring(0, matchPath.lastIndexOf('/'));
                    if (self._tree[matchDir]) {
                        for (var i = 0; i < self._tree[matchDir].children.length; i++) {
                            if (getShortName(self._tree[matchDir].children[i].name) === getShortName(aiFile.name) && self._tree[matchDir].children[i].fileType === 'original') {
                                self._tree[matchDir].children[i].size = info.size;
                                break;
                            }
                        }
                    }
                    return;
                }
            }

            aiFile.type = 'file';
            aiFile.fileType = 'ai';
            aiFile.size = aiFile.content ? aiFile.content.length : 0;
            aiFile.workDir = mainDir;
            aiFile.id = makeFileId(mainDir, aiFile.name, 'ai');

            if (info && info.path) {
                aiFile._origPath = info.path;
                aiFile._origSize = info.size;
                aiFile._origMtime = info.mtime;
                aiFile._origContent = info.content;
            } else {
                aiFile.isNew = true;
            }

            self._fileMap[aiFile.id] = aiFile;

            var mainNode = self._tree[mainDir];
            if (mainNode) {
                var exists = false;
                for (var i = 0; i < mainNode.children.length; i++) {
                    if (mainNode.children[i].fileType === 'ai' && mainNode.children[i].name === aiFile.name) {
                        exists = true;
                        break;
                    }
                }
                if (!exists) {
                    var insertIndex = mainNode.children.length;
                    for (var i = 0; i < mainNode.children.length; i++) {
                        if (getShortName(mainNode.children[i].name) === getShortName(aiFile.name) && mainNode.children[i].fileType === 'original') {
                            insertIndex = i + 1;
                            break;
                        }
                    }
                    mainNode.children.splice(insertIndex, 0, aiFile);
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

    getAllDirs: function() {
        return Object.keys(this._tree);
    },

    getFilesForDir: function(dir) {
        var node = this._tree[dir];
        if (!node || !node.children) return [];
        return node.children.filter(function(c) {
            return c.type === 'file' && c.fileType === 'original';
        });
    },

    findFile: function(filename, dir) {
        var node = this._tree[dir];
        if (!node || !node.children) return null;
        for (var i = 0; i < node.children.length; i++) {
            if (getShortName(node.children[i].name) === getShortName(filename) && node.children[i].type === 'file') {
                return node.children[i];
            }
        }
        return null;
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
                size: f.size || (f.content ? f.content.length : 0),
                workDir: f.dir || Config.mainDir,
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
                return !(f.fileType === 'ai' && f.name === name);
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
            size: content ? content.length : 0,
            workDir: Config.mainDir,
            fileType: 'user',
            mtime: Date.now()
        };
        node.id = makeFileId(node.workDir, node.name, 'user');
        this._fileMap[node.id] = node;
        this._userFiles.push(node);
    }
};