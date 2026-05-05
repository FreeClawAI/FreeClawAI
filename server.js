// FreeClaw - Local File Server (zero dependency)
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const child_process = require('child_process');

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

function normalizeDir(dir) {
    if (!dir || !dir.trim()) return WORKSPACE_DIR;
    var d = dir.trim();
    if (process.platform === 'win32' && /^[A-Za-z]:$/.test(d)) d += '\\';
    return d;
}

function normalizeContent(content) {
    return content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

function readBinaryFile(fp) {
    var buffer = fs.readFileSync(fp);
    return normalizeContent(buffer.toString('utf-8'));
}

function writeBinaryFile(fp, content) {
    fs.writeFileSync(fp, Buffer.from(content, 'utf-8'));
}

function listFiles(dir) {
    var workDir = normalizeDir(dir);
    if (!fs.existsSync(workDir)) return [];
    const result = [];
    var items;
    try { items = fs.readdirSync(workDir, { withFileTypes: true }); } catch (e) { return []; }
    items.forEach(function(item) {
        try {
            var fullPath = path.join(workDir, item.name);
            var st = fs.statSync(fullPath);
            if (item.isDirectory()) {
                result.push({isDir: true, mtime: st.mtimeMs, fullPath: fullPath });
            } else {
                result.push({size: st.size, isDir: false, mtime: st.mtimeMs, fullPath: fullPath });
            }
        } catch (e) {}
    });
    return result;
}

function readFileContent(dir, filename) {
    const fp = resolvePath(dir, filename);
    if (!fs.existsSync(fp)) throw new Error('File not found');
    var content = readBinaryFile(fp);
    return { content, md5: crypto.createHash('md5').update(content).digest('hex') };
}

function readFileHex(dir, filename) {
    const fp = resolvePath(dir, filename);
    if (!fs.existsSync(fp)) throw new Error('File not found');
    const buffer = fs.readFileSync(fp);
    var hexLines = [];
    var bytesPerLine = 16;
    for (var i = 0; i < buffer.length; i += bytesPerLine) {
        var offset = i.toString(16).padStart(8, '0');
        var hexPart = [];
        var asciiPart = [];
        for (var j = 0; j < bytesPerLine; j++) {
            if (i + j < buffer.length) {
                var byte = buffer[i + j];
                hexPart.push(byte.toString(16).padStart(2, '0'));
                asciiPart.push(byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : '.');
            } else {
                hexPart.push('  ');
                asciiPart.push(' ');
            }
        }
        hexLines.push(offset + '  ' + hexPart.join(' ') + '  |' + asciiPart.join('') + '|');
    }
    return hexLines.join('\n');
}

function getMimeType(filename) {
    var ext = path.extname(filename).toLowerCase();
    var mimes = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.webp': 'image/webp',
        '.ico': 'image/x-icon',
        '.bmp': 'image/bmp',
        '.pdf': 'application/pdf',
        '.mp4': 'video/mp4',
        '.webm': 'video/webm',
        '.mp3': 'audio/mpeg',
        '.wav': 'audio/wav',
        '.ogg': 'audio/ogg',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2',
        '.ttf': 'font/ttf',
        '.eot': 'application/vnd.ms-fontobject',
        '.zip': 'application/zip',
        '.tar': 'application/x-tar',
        '.gz': 'application/gzip',
        '.json': 'application/json',
        '.xml': 'application/xml',
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.txt': 'text/plain',
        '.md': 'text/markdown'
    };
    return mimes[ext] || 'application/octet-stream';
}

function isTextFile(filename) {
    var ext = path.extname(filename).toLowerCase();
    var textExts = [
        '.txt', '.md', '.json', '.xml', '.yaml', '.yml', '.html', '.htm',
        '.css', '.scss', '.less', '.js', '.jsx', '.ts', '.tsx', '.vue',
        '.svelte', '.py', '.java', '.rs', '.go', '.c', '.cpp', '.h', '.hpp',
        '.sh', '.bat', '.cmd', '.ps1', '.sql', '.rb', '.php', '.swift',
        '.kt', '.dart', '.lua', '.r', '.m', '.mm', '.toml', '.ini', '.cfg',
        '.conf', '.log', '.env', '.gitignore', '.editorconfig', '.prettierrc',
        '.eslintrc', '.csv', '.tsv'
    ];
    if (textExts.indexOf(ext) !== -1) {
        return true;
    }
    var basename = path.basename(filename).toLowerCase();
    if (basename === 'makefile' || basename === 'dockerfile' || basename === 'license') {
        return true;
    }
    return false;
}

function writeFile(dir, filename, content, options) {
    const fp = resolvePath(dir, filename);
    const dirPath = path.dirname(fp);
    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
    if (fs.existsSync(fp) && options && options.md5) {
        var currentContent = readBinaryFile(fp);
        var currentMd5 = crypto.createHash('md5').update(currentContent).digest('hex');
        if (currentMd5 !== options.md5 && !options.force) return { conflict: true, currentMd5: currentMd5 };
    }
    writeBinaryFile(fp, content);
    return { success: true, md5: crypto.createHash('md5').update(content).digest('hex') };
}

function makeDir(dir, name) {
    const workDir = dir ? path.resolve(dir) : WORKSPACE_DIR;
    const full = path.resolve(workDir, name);
    if (!full.startsWith(workDir)) throw new Error('Access denied');
    if (!fs.existsSync(full)) fs.mkdirSync(full, { recursive: true });
    return { success: true };
}

function findFileInfo(rootDir, targetName) {
    var fp = path.join(rootDir, targetName);
    if (!fs.existsSync(fp)) return null;
    try {
        var st = fs.statSync(fp);
        var content = readBinaryFile(fp);
        return {
            path: fp,
            size: content.length,
            mtime: st.mtimeMs,
            content: content
        };
    } catch (e) {
        return null;
    }
}

function moveToTrash(fp) {
    if (!fs.existsSync(fp)) return;
    if (process.platform === 'win32') {
        var vbs = path.join(os.tmpdir(), '.freeclaw_trash_' + Date.now() + '.vbs');
        var script = 'set s=CreateObject("Shell.Application")\ns.Namespace(10).MoveHere "' + fp.replace(/\\/g, '\\\\') + '"';
        fs.writeFileSync(vbs, script);
        try {
            child_process.execSync('cscript //nologo "' + vbs + '"', { windowsHide: true });
        } finally {
            try { if (fs.existsSync(vbs)) fs.unlinkSync(vbs); } catch (e) {}
        }
    } else {
        fs.unlinkSync(fp);
    }
}

const server = http.createServer(function(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Save-Dir, X-Save-Filename');
    if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

    var body = '';
    req.on('data', function(chunk) { body += chunk; });
    req.on('end', function() {
        try {
            var data = {};
            if (body && req.headers['content-type'] !== 'text/plain') {
                try { data = JSON.parse(body); } catch (e) {}
            }

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
                        writeBinaryFile(testFile, 'test');
                        fs.unlinkSync(testFile);
                        validDirs.push(resolved);
                    } catch (e) {}
                });
                if (!validDirs.length) validDirs.push(WORKSPACE_DIR);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, dirs: validDirs }));
            } else if (req.url === '/api/files/list' && req.method === 'POST') {
                var dir = data.dir || '';
                var files = listFiles(dir);
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

                aiFiles.forEach(function(aiName) {
                    matches[aiName] = null;
                    for (var i = 0; i < searchDirs.length; i++) {
                        var found = findFileInfo(searchDirs[i], aiName);
                        if (found) {
                            found.workspace = searchDirs[i];
                            matches[aiName] = found;
                            break;
                        }
                    }
                });

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ matches: matches }));
            } else if (req.url === '/api/files/read' && req.method === 'POST') {
                var filename = data.filename || '';
                var dir = data.dir || '';
                var fp = resolvePath(dir, filename);
                if (!fs.existsSync(fp)) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'File not found' }));
                    return;
                }

                if (isTextFile(filename)) {
                    var content = readBinaryFile(fp);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        content: content,
                        md5: crypto.createHash('md5').update(content).digest('hex')
                    }));
                } else {
                    var hexContent = readFileHex(dir, filename);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        content: hexContent,
                        hex: true
                    }));
                }
            } else if (req.url.startsWith('/api/files/raw') && req.method === 'GET') {
                var urlObj = new URL(req.url, 'http://localhost:' + PORT);
                var filePath = urlObj.searchParams.get('path') || '';
                if (!filePath) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Missing path parameter' }));
                    return;
                }
                var fullPath = path.resolve(filePath);
                if (!fs.existsSync(fullPath)) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'File not found' }));
                    return;
                }
                var mimeType = getMimeType(filePath);
                var rawBuffer = fs.readFileSync(fullPath);
                res.writeHead(200, {
                    'Content-Type': mimeType,
                    'Content-Length': rawBuffer.length,
                    'Cache-Control': 'no-cache'
                });
                res.end(rawBuffer);
            } else if (req.url.startsWith('/api/files/raw') && req.method === 'POST') {
                var filePath = data.path || '';
                if (!filePath) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Missing path parameter' }));
                    return;
                }
                var fullPath = path.resolve(filePath);
                if (!fs.existsSync(fullPath)) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'File not found' }));
                    return;
                }
                var mimeType = getMimeType(filePath);
                var rawBuffer = fs.readFileSync(fullPath);
                res.writeHead(200, {
                    'Content-Type': mimeType,
                    'Content-Length': rawBuffer.length,
                    'Cache-Control': 'no-cache'
                });
                res.end(rawBuffer);
            } else if (req.url === '/api/files/write' && req.method === 'POST') {
                var result = writeFile(data.dir, data.filename, data.content, { md5: data.md5, force: data.force });
                if (result.conflict) { res.writeHead(409, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: 'File modified', currentMd5: result.currentMd5 })); }
                else { res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(result)); }
            } else if (req.url === '/api/files/write-raw' && req.method === 'POST') {
                var dir = req.headers['x-save-dir'] || '';
                var filename = req.headers['x-save-filename'] || '';
                var result = writeFile(dir, filename, body, {});
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result));
            } else if (req.url === '/api/files/mkdir' && req.method === 'POST') {
                var result = makeDir(data.dir, data.name);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result));
            } else if (req.url === '/api/files/delete' && req.method === 'POST') {
                var fp = resolvePath(data.dir, data.filename);
                if (!fs.existsSync(fp)) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'File not found' }));
                    return;
                }
                moveToTrash(fp);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
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