// FreeClaw - Local File Server (zero dependency)
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

const PORT = 8080;
const documentsDir = path.join(os.homedir(), 'Documents');
const WORKSPACE_DIR = path.join(
    fs.existsSync(documentsDir) ? documentsDir : os.homedir(),
    'FreeClaw'
);
if (!fs.existsSync(WORKSPACE_DIR)) fs.mkdirSync(WORKSPACE_DIR, { recursive: true });

function resolvePath(dir, filename) {
    const workDir = dir ? path.resolve(dir) : WORKSPACE_DIR;
    const full = path.resolve(workDir, filename || '');
    if (process.platform === 'win32') {
        if (!full.startsWith(workDir)) throw new Error('Access denied');
    }
    return full;
}

function md5(str) { return crypto.createHash('md5').update(str).digest('hex'); }

function normalizeDir(dir) {
    if (!dir || !dir.trim()) return WORKSPACE_DIR;
    var d = dir.trim();
    if (process.platform === 'win32' && /^[A-Za-z]:$/.test(d)) d += '\\';
    return d;
}

function listFiles(dir, flat) {
    var workDir = normalizeDir(dir);
    if (!fs.existsSync(workDir)) return [];
    const result = [];
    var items;
    try { items = fs.readdirSync(workDir, { withFileTypes: true }); } catch (e) { return []; }
    items.forEach(function(item) {
        try {
            var st = fs.statSync(path.join(workDir, item.name));
            if (item.isDirectory()) {
                result.push({ name: item.name, isDir: true, mtime: st.mtimeMs });
                if (!flat) walk(path.join(workDir, item.name), item.name + '/');
            } else {
                result.push({ name: item.name, size: st.size, isDir: false, mtime: st.mtimeMs });
            }
        } catch (e) {}
    });
    function walk(d, prefix) {
        var subItems;
        try { subItems = fs.readdirSync(d, { withFileTypes: true }); } catch (e) { return; }
        subItems.forEach(function(item) {
            try {
                var st = fs.statSync(path.join(d, item.name));
                if (item.isDirectory()) {
                    result.push({ name: prefix + item.name, isDir: true, mtime: st.mtimeMs });
                    walk(path.join(d, item.name), prefix + item.name + '/');
                } else {
                    result.push({ name: prefix + item.name, size: st.size, isDir: false, mtime: st.mtimeMs });
                }
            } catch (e) {}
        });
    }
    return result;
}

function readFileContent(dir, filename) {
    const fp = resolvePath(dir, filename);
    if (!fs.existsSync(fp)) throw new Error('File not found');
    const content = fs.readFileSync(fp, 'utf-8');
    return { content, md5: md5(content) };
}

function writeFile(dir, filename, content, options) {
    const fp = resolvePath(dir, filename);
    const dirPath = path.dirname(fp);
    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
    if (fs.existsSync(fp) && options.md5) {
        const current = readFileContent(dir, filename);
        if (current.md5 !== options.md5 && !options.force) return { conflict: true, currentMd5: current.md5 };
    }
    if (fs.existsSync(fp) && options.backup !== false) fs.copyFileSync(fp, fp + '.bak');
    fs.writeFileSync(fp, content, 'utf-8');
    return { success: true, md5: md5(content) };
}

function makeDir(dir, name) {
    const workDir = dir ? path.resolve(dir) : WORKSPACE_DIR;
    const full = path.resolve(workDir, name);
    if (!full.startsWith(workDir)) throw new Error('Access denied');
    if (!fs.existsSync(full)) fs.mkdirSync(full, { recursive: true });
    return { success: true };
}

function deleteFile(dir, filename) {
    const fp = resolvePath(dir, filename);
    if (!fs.existsSync(fp)) throw new Error('File not found');
    fs.unlinkSync(fp);
    return { success: true };
}

const server = http.createServer(function(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

    var body = '';
    req.on('data', function(chunk) { body += chunk; });
    req.on('end', function() {
        try {
            var data = {};
            if (body) data = JSON.parse(body);

            if (req.url === '/api/ping' && req.method === 'GET') {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: 'ok' }));
            } else if (req.url === '/api/paths' && req.method === 'GET') {
                var homeDir = os.homedir();
                var paths = { desktop: path.join(homeDir, 'Desktop'), documents: path.join(homeDir, 'Documents'), downloads: path.join(homeDir, 'Downloads'), home: homeDir, drives: [] };
                if (process.platform === 'win32') {
                    for (var i = 65; i <= 90; i++) { var drive = String.fromCharCode(i) + ':\\'; if (fs.existsSync(drive)) paths.drives.push(drive); }
                } else { paths.drives.push('/'); }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(paths));
            } else if (req.url === '/api/config' && req.method === 'POST') {
                var dirs = data.dirs || [];
                var validDirs = [];
                dirs.forEach(function(d) {
                    var resolved = path.resolve(d);
                    try {
                        if (!fs.existsSync(resolved)) fs.mkdirSync(resolved, { recursive: true });
                        var testFile = path.join(resolved, '.freeclaw_test');
                        fs.writeFileSync(testFile, 'test'); fs.unlinkSync(testFile);
                        validDirs.push(resolved);
                    } catch (e) {}
                });
                if (!validDirs.length) validDirs.push(WORKSPACE_DIR);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, dirs: validDirs }));
            } else if (req.url === '/api/files/list' && req.method === 'POST') {
                var dir = data.dir || '';
                var flat = data.flat !== false;
                var files = listFiles(dir, flat);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ files: files }));
            } else if (req.url === '/api/files/batch' && req.method === 'POST') {
                var dirs = data.dirs || [];
                var flat = data.flat !== false;
                var results = {};
                dirs.forEach(function(d) { results[d] = listFiles(d, flat); });
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ results: results }));
            } else if (req.url === '/api/files/find' && req.method === 'POST') {
                var searchDirs = data.dirs || [];
                var aiFiles = data.aiFiles || [];
                var matches = {};
                function findFile(rootDir, targetName) {
                    function walk(currentDir) {
                        try {
                            var items = fs.readdirSync(currentDir, { withFileTypes: true });
                            for (var i = 0; i < items.length; i++) {
                                if (items[i].isFile() && items[i].name === targetName) return currentDir;
                                if (items[i].isDirectory()) {
                                    var result = walk(path.join(currentDir, items[i].name));
                                    if (result) return result;
                                }
                            }
                        } catch (e) {}
                        return null;
                    }
                    return walk(rootDir);
                }
                aiFiles.forEach(function(aiName) {
                    matches[aiName] = null;
                    for (var i = 0; i < searchDirs.length; i++) {
                        var found = findFile(searchDirs[i], aiName);
                        if (found) { matches[aiName] = found; break; }
                    }
                });
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ matches: matches }));
            } else if (req.url === '/api/files/read' && req.method === 'POST') {
                var result = readFileContent(data.dir, data.filename);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result));
            } else if (req.url === '/api/files/write' && req.method === 'POST') {
                var result = writeFile(data.dir, data.filename, data.content, { md5: data.md5, force: data.force });
                if (result.conflict) { res.writeHead(409, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: 'File modified', currentMd5: result.currentMd5 })); }
                else { res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(result)); }
            } else if (req.url === '/api/files/mkdir' && req.method === 'POST') {
                var result = makeDir(data.dir, data.name);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result));
            } else if (req.url === '/api/files/delete' && req.method === 'POST') {
                var result = deleteFile(data.dir, data.filename);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result));
            } else {
                res.writeHead(404); res.end('Not found');
            }
        } catch (e) {
            console.error('Server error:', e.message);
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: e.message }));
        }
    });
});

server.listen(PORT, function() { console.log('FreeClaw Server: http://localhost:' + PORT); });