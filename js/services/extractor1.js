// // Extract AI-generated code files from AI chat page DOM
// const Extractor = {
//     _fileListCache: null,
//     _fileListTime: 0,

//     extract() {
//         const site = this._getSite();
//         if (!site) return [];
//         const files = [];
//         const seen = [];

//         var allBlocks = document.querySelectorAll(site.extract.container);
//         if (!allBlocks.length) return [];

//         // Process from last reply only
//         var lastBlock = allBlocks[allBlocks.length - 1];
//         var replyContainer = lastBlock.closest('.ds-markdown') || lastBlock;
//         var codeBlocks = replyContainer.querySelectorAll('.md-code-block');

//         codeBlocks.forEach(function(block) {
//             const pre = site.extract.codeElement ? block.querySelector(site.extract.codeElement) : block;
//             if (!pre) return;
//             const code = (pre.textContent || '').trim();
//             if (!code || code.length < 2) return;

//             // Step 1: Try FreeClaw Protocol - find h2 heading with relative path
//             var name = _findFromH2(block);
//             if (name) {
//                 if (seen.indexOf(name) === -1) {
//                     seen.push(name);
//                     files.push({ name: name, content: code });
//                 }
//                 return;
//             }

//             // Step 2: Fallback - match against workspace file list
//             _matchFromFileList(block, pre, code, files, seen);
//         });

//         return files;
//     },

//     _getSite() {
//         const host = location.hostname;
//         for (const key in Sites) {
//             if (host.includes(key.replace('www.', ''))) return Sites[key];
//         }
//         return null;
//     },

//     // Fetch workspace file list with cache
//     async _getFileList() {
//         var now = Date.now();
//         if (this._fileListCache && (now - this._fileListTime) < 30000) {
//             return this._fileListCache;
//         }
//         try {
//             var dirs = Config.workDirs || [];
//             var allFiles = [];
//             for (var d = 0; d < dirs.length; d++) {
//                 var list = await Api.treeFiles(dirs[d]);
//                 allFiles = allFiles.concat(list);
//             }
//             this._fileListCache = allFiles;
//             this._fileListTime = now;
//             return allFiles;
//         } catch (e) {
//             return [];
//         }
//     }
// };

// // Step 1: FreeClaw Protocol - h2 heading with relative path
// function _findFromH2(block) {
//     var el = block.previousElementSibling;
//     for (var j = 0; j < 10; j++) {
//         if (!el) break;

//         // Check h2-h6 headings
//         if (/^H[2-6]$/.test(el.tagName)) {
//             var text = (el.textContent || '').trim();
//             var name = _parseRelativePath(text);
//             if (name) return name;
//         }

//         // Check for path pattern in any text node
//         var allText = (el.textContent || '').trim();
//         if (allText && allText.indexOf('/') === -1 && allText.indexOf('\\') === -1) {
//             // Single line text, might be filename
//             var name = _parseRelativePath(allText);
//             if (name) return name;
//         }

//         el = el.previousElementSibling;
//     }
//     return null;
// }

// // Parse a string to extract a valid relative file path
// function _parseRelativePath(text) {
//     if (!text) return null;
//     // Remove markdown heading markers
//     text = text.replace(/^#+\s*/, '').replace(/\*+/g, '').trim();
//     // Must not be an absolute path
//     if (text.charAt(0) === '/' || text.charAt(0) === '\\') return null;
//     // Must not contain ..
//     if (text.indexOf('..') !== -1) return null;
//     // Must have a valid file extension
//     var m = text.match(/([a-zA-Z0-9_\-\.\/]+\.\w{1,6})\s*$/);
//     if (!m) return null;
//     var name = m[1];
//     // Filter valid extensions
//     var ext = name.split('.').pop().toLowerCase();
//     var validExts = ['cs','js','html','css','json','txt','py','java','ts','tsx','jsx','md','xml','yaml','yml','sql','sh','bat','cmd'];
//     if (validExts.indexOf(ext) < 0) return null;
//     // Use forward slashes
//     name = name.replace(/\\/g, '/');
//     return name;
// }

// // Step 2: Match code block against workspace file list
// async function _matchFromFileList(block, pre, code, files, seen) {
//     var fileList = await Extractor._getFileList();
//     if (!fileList.length) {
//         // No workspace files, treat as new file
//         var fallbackName = 'code_' + (files.length + 1) + '.txt';
//         if (seen.indexOf(fallbackName) === -1) {
//             seen.push(fallbackName);
//             files.push({ name: fallbackName, content: code });
//         }
//         return;
//     }

//     // Get text before this code block within the reply
//     var replyText = _getReplyText(block);

//     // Find the position of code in the reply text
//     var codeStart = replyText.indexOf(code.substring(0, Math.min(100, code.length)));
//     if (codeStart === -1) codeStart = replyText.length;
//     var prefixText = replyText.substring(0, codeStart);

//     // Try matching file paths against prefix text
//     var candidates = [];
//     fileList.forEach(function(filePath) {
//         if (prefixText.indexOf(filePath) !== -1) {
//             candidates.push({ path: filePath, match: 'full', score: filePath.length });
//         } else {
//             // Try short name
//             var shortName = filePath.split('/').pop();
//             if (prefixText.indexOf(shortName) !== -1) {
//                 candidates.push({ path: filePath, match: 'short', score: shortName.length });
//             }
//         }
//     });

//     if (candidates.length === 1) {
//         // Single match
//         var name = candidates[0].path;
//         if (seen.indexOf(name) === -1) {
//             seen.push(name);
//             files.push({ name: name, content: code });
//         }
//     } else if (candidates.length > 1) {
//         // Multiple matches: compare similarity
//         var best = _pickBestMatch(candidates, code);
//         if (best) {
//             if (seen.indexOf(best.path) === -1) {
//                 seen.push(best.path);
//                 files.push({ name: best.path, content: code });
//             }
//         }
//     } else {
//         // No match, treat as new file
//         var fallbackName = 'code_' + (files.length + 1) + '.txt';
//         if (seen.indexOf(fallbackName) === -1) {
//             seen.push(fallbackName);
//             files.push({ name: fallbackName, content: code });
//         }
//     }
// }

// // Get all text from the reply containing this block
// function _getReplyText(block) {
//     var container = block.closest('.ds-markdown');
//     if (container) return container.textContent || '';
//     // Fallback: get text from all previous siblings
//     var text = '';
//     var el = block;
//     while (el) {
//         text = (el.textContent || '') + '\n' + text;
//         el = el.previousElementSibling;
//         if (el && el.classList && el.classList.contains('ds-markdown')) break;
//     }
//     return text;
// }

// // Pick best match from multiple candidates by comparing file similarity
// function _pickBestMatch(candidates, code) {
//     // Sort by match quality: full path > short name, longer path > shorter
//     candidates.sort(function(a, b) {
//         if (a.match !== b.match) return a.match === 'full' ? -1 : 1;
//         return b.score - a.score;
//     });
//     return candidates[0];
// }