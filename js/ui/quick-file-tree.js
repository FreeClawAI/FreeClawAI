// FreeClaw - Quick file tree with folder hierarchy
const QuickFileTree = {
    _allFiles: [],

    build: async function(containerId) {
        var dirs = Config.workDirs || [];
        var container = document.getElementById(containerId);
        if (!container) return;

        if (!dirs.length) {
            container.innerHTML = '<div style="text-align:center;color:#999;padding:20px">' + I18n.t('No work directories configured') + '</div>';
            return;
        }

        container.innerHTML = '<div style="text-align:center;color:#999;padding:20px">' + I18n.t('Loading...') + '</div>';

        var self = this;

        this._allFiles = [];
        for (var d = 0; d < dirs.length; d++) {
            try {
                var list = await Api.treeFiles(dirs[d]);
                var dn = dirs[d].split('\\').pop().split('/').pop() || dirs[d];
                for (var i = 0; i < list.length; i++) {
                    this._allFiles.push({
                        name: list[i],
                        dir: dirs[d],
                        dirName: dirs[d].split('\\').pop().split('/').pop(),
                        selected: false
                    });
                }
            } catch (e) {}
        }

        var hasSaved = false;
        try {
            var state = await DB.getState();
            if (state && state.selectedFiles && state.workDir === Config.mainDir) {
                hasSaved = true;
                var saved = state.selectedFiles;
                this._allFiles.forEach(function(f) {
                    if (saved.hasOwnProperty(f.name)) f.selected = (saved[f.name] === true);
                });
            }
        } catch (e) {}

        if (!hasSaved) {
            this._allFiles.forEach(function(f) { f.selected = true; });
            this._save();
        }

        container.innerHTML = _buildHtml(this._allFiles);
        _setIndeterminate(container);
        _bindEvents(container);

        function _buildHtml(allFiles) {
            var tree = _filesToTree(allFiles);
            _calcStates(tree);
            var html = '';
            var keys = Object.keys(tree).filter(function(k) { return k !== '_files'; }).sort();
            keys.forEach(function(k) {
                html += _renderNode(k, tree[k], 0, true);
            });
            return html || '<div style="text-align:center;color:#999;padding:20px">' + I18n.t('No files') + '</div>';
        }

        function _filesToTree(files) {
            var root = {};
            files.sort(function(a, b) { return a.name.localeCompare(b.name); });
            files.forEach(function(f) {
                var parts = f.name.split('/');
                var cur = root;
                for (var i = 0; i < parts.length - 1; i++) {
                    if (!cur[parts[i]]) cur[parts[i]] = {};
                    cur = cur[parts[i]];
                }
                if (!cur._files) cur._files = [];
                cur._files.push(f);
            });
            return root;
        }

        function _calcStates(tree) {
            var keys = Object.keys(tree).filter(function(k) { return k !== '_files'; });
            keys.forEach(function(k) { _calcStates(tree[k]); });

            var hasTrue = false;
            var hasFalse = false;

            if (tree._files) {
                tree._files.forEach(function(f) {
                    if (f.selected) hasTrue = true;
                    else hasFalse = true;
                });
            }

            keys.forEach(function(k) {
                if (tree[k]._state === 1) hasTrue = true;
                if (tree[k]._state === 0) hasFalse = true;
                if (tree[k]._state === 2) { hasTrue = true; hasFalse = true; }
            });

            if (hasTrue && hasFalse) tree._state = 2;
            else if (hasTrue) tree._state = 1;
            else tree._state = 0;
        }

        function _renderNode(folderName, children, depth, expanded) {
            var indent = depth * 20;
            var state = children._state;
            var displayName = folderName.split('/').pop();

            var html = '<div class="ai-qft-folder" data-folder="' + Utils.escAttr(folderName) +
                '" style="padding:3px 10px 3px ' + indent + 'px;cursor:pointer;font-size:12px;font-weight:bold;display:flex;align-items:center">' +
                '<span class="ai-qft-arrow" style="width:12px;font-size:10px">' + (expanded ? '▼' : '▶') + '</span>' +
                '<input type="checkbox" class="ai-qft-folder-cb" style="width:13px;height:13px;margin-right:6px" ' + (state === 1 ? 'checked' : '') + '>' +
                '📁 ' + Utils.esc(displayName) + '</div>';

            html += '<div class="ai-qft-children" style="display:' + (expanded ? 'block' : 'none') + '">';
            var subKeys = Object.keys(children).filter(function(k) { return k !== '_files' && k !== '_state'; }).sort();
            subKeys.forEach(function(k) {
                html += _renderNode(folderName + '/' + k, children[k], depth + 1, false);
            });

            if (children._files) {
                children._files.sort(function(a, b) { return a.name.localeCompare(b.name); });
                children._files.forEach(function(f) {
                    var displayName = f.name.split('/').pop();
                    html += '<div class="ai-qft-file" data-name="' + Utils.escAttr(f.name) +
                        '" style="display:flex;align-items:center;padding:3px 10px 3px ' + (indent + 20) +
                        'px;font-size:12px;border-bottom:1px solid #f9f9f9">' +
                        '<input type="checkbox" class="ai-qft-cb" style="width:13px;height:13px;margin-right:6px" ' + (f.selected ? 'checked' : '') + '>' +
                        '<span>📄 ' + Utils.esc(displayName) + '</span></div>';
                });
            }

            html += '</div>';
            return html;
        }

        function _setIndeterminate(container) {
            container.querySelectorAll('.ai-qft-folder-cb').forEach(function(cb) {
                var folderName = cb.closest('.ai-qft-folder').dataset.folder;
                var prefix = folderName + '/';
                var hasTrue = false, hasFalse = false;
                for (var i = 0; i < self._allFiles.length; i++) {
                    if (self._allFiles[i].name.indexOf(prefix) === 0) {
                        if (self._allFiles[i].selected) hasTrue = true;
                        else hasFalse = true;
                    }
                }
                if (hasTrue && hasFalse) cb.indeterminate = true;
            });
        }

        function _bindEvents(container) {
            container.querySelectorAll('.ai-qft-folder').forEach(function(el) {
                el.addEventListener('click', function(e) {
                    if (e.target.tagName === 'INPUT') return;
                    var children = this.nextElementSibling;
                    var arrow = this.querySelector('.ai-qft-arrow');
                    if (!children || !arrow) return;
                    if (children.style.display === 'none') { children.style.display = 'block'; arrow.textContent = '▼'; }
                    else { children.style.display = 'none'; arrow.textContent = '▶'; }
                });
            });

            container.querySelectorAll('.ai-qft-folder-cb').forEach(function(cb) {
                cb.addEventListener('change', function() {
                    var folderName = cb.closest('.ai-qft-folder').dataset.folder;
                    var checked = cb.checked;
                    var prefix = folderName + '/';
                    self._allFiles.forEach(function(f) { if (f.name.indexOf(prefix) === 0) f.selected = checked; });
                    var children = cb.closest('.ai-qft-folder').nextElementSibling;
                    if (children) {
                        children.querySelectorAll('.ai-qft-cb').forEach(function(c) { c.checked = checked; });
                        children.querySelectorAll('.ai-qft-folder-cb').forEach(function(c) { c.checked = checked; c.indeterminate = false; });
                    }
                    self._save();
                });
            });

            container.querySelectorAll('.ai-qft-cb').forEach(function(cb) {
                cb.addEventListener('change', function() {
                    var name = cb.closest('.ai-qft-file').dataset.name;
                    var file = self._allFiles.find(function(f) { return f.name === name; });
                    if (file) file.selected = cb.checked;
                    self._save();
                    _updateAncestors(name);
                });
            });

            function _updateAncestors(childName) {
                var slash = childName.lastIndexOf('/');
                if (slash <= 0) return;
                var parentName = childName.substring(0, slash);
                var parentEl = document.querySelector('.ai-qft-folder[data-folder="' + Utils.escAttr(parentName) + '"]');
                if (parentEl) {
                    var parentCb = parentEl.querySelector('.ai-qft-folder-cb');
                    if (parentCb) {
                        var prefix = parentName + '/';
                        var hasTrue = false, hasFalse = false;
                        for (var i = 0; i < self._allFiles.length; i++) {
                            if (self._allFiles[i].name.indexOf(prefix) === 0) {
                                if (self._allFiles[i].selected) hasTrue = true;
                                else hasFalse = true;
                            }
                        }
                        if (hasTrue && hasFalse) { parentCb.checked = false; parentCb.indeterminate = true; }
                        else if (hasTrue) { parentCb.checked = true; parentCb.indeterminate = false; }
                        else { parentCb.checked = false; parentCb.indeterminate = false; }
                    }
                }
                _updateAncestors(parentName);
            }
        }
    },

    _save: function() {
        var data = {};
        this._allFiles.forEach(function(f) { data[f.name] = f.selected; });
        DB.saveState({ selectedFiles: data, workDir: Config.mainDir });
    },

    sendChecked: function() {
        var selected = this._allFiles.filter(function(f) { return f.selected; });
        if (!selected.length) { Toast.show(I18n.t('No files selected'), 'error'); return; }
        var msg = '以下是我的项目文件列表，工作目录为 ' + Config.mainDir + '：\n\n';
        selected.forEach(function(f) { msg += '- ' + f.name + '\n'; });
        var editor = Sender._findEditor();
        if (editor) {
            var old = editor.value;
            editor.value = old ? old + '\n\n' + msg : msg;
            editor.dispatchEvent(new Event('input', { bubbles: true }));
            editor.focus();
        }
        DialogStack.close();
    }
};