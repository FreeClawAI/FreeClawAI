// FreeClaw - Local File Server
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = 8080;
const WORKSPACE_DIR = path.join(__dirname, 'workspace');
if (!fs.existsSync(WORKSPACE_DIR)) fs.mkdirSync(WORKSPACE_DIR, { recursive: true });

function resolvePath(dir, filename) {
    const workDir = path.resolve(dir || WORKSPACE_DIR);
    const full = path.resolve(workDir, filename || '');
    if (!full.startsWith(workDir)) throw new Error('Access denied');
    return full;
}

function md5(str) { return crypto.createHash('md5').update(str).digest('hex'); }

function listFiles(dir) {
    const workDir = path.resolve(dir || WORKSPACE_DIR);
    if (!fs.existsSync(workDir)) return [];
    const result = [];
    function walk(d, prefix) {
        const items = fs.readdirSync(d, { withFileTypes: true });
        items.forEach(item => {
            if (item.isDirectory()) walk(path.join(d, item.name), prefix + item.name + '/');
            else { const st = fs.statSync(path.join(d, item.name)); result.push({ name: prefix + item.name, size: st.size }); }
        });
    }
    walk(workDir, '');
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
    const workDir = path.resolve(dir || WORKSPACE_DIR);
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

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
        try {
            let data = {};
            if (body) data = JSON.parse(body);

            if (req.url === '/api/files/list' && req.method === 'GET') {
                const url = new URL(req.url, 'http://localhost');
                const dir = url.searchParams.get('dir') || '';
                const files = listFiles(dir);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ files }));
            } else if (req.url === '/api/files/read' && req.method === 'POST') {
                const result = readFileContent(data.dir, data.filename);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result));
            } else if (req.url === '/api/files/write' && req.method === 'POST') {
                const result = writeFile(data.dir, data.filename, data.content, { md5: data.md5, force: data.force });
                if (result.conflict) {
                    res.writeHead(409, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'File modified', currentMd5: result.currentMd5 }));
                } else {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(result));
                }
            } else if (req.url === '/api/files/mkdir' && req.method === 'POST') {
                const result = makeDir(data.dir, data.name);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result));
            } else if (req.url === '/api/files/delete' && req.method === 'POST') {
                const result = deleteFile(data.dir, data.filename);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result));
            } else {
                res.writeHead(404);
                res.end('Not found');
            }
        } catch (e) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: e.message }));
        }
    });
});

server.listen(PORT, () => console.log('FreeClaw Server running on http://localhost:' + PORT));