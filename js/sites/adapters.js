// Site adapter configurations for different AI platforms
const Sites = {
    'chat.deepseek.com': {
        name: 'DeepSeek',
        extract: {
            container: '.ds-markdown .md-code-block',
            codeElement: 'pre',
            getFilename: function(block) {
                var el = block.previousElementSibling;
                for (var j = 0; j < 10; j++) {
                    if (!el) break;
                    var text = (el.textContent || '').trim();
                    var m = text.match(/([a-zA-Z0-9_\-\.\/]+\.\w{1,6})\s*$/);
                    if (m && m[1].indexOf('.') > 0) {
                        var ext = m[1].split('.').pop().toLowerCase();
                        var validExts = ['cs','js','html','css','json','txt','py','java','ts','tsx','jsx','md','xml','yaml','yml','sql','sh','bat','cmd'];
                        if (validExts.indexOf(ext) >= 0) return m[1];
                    }
                    el = el.previousElementSibling;
                }
                return null;
            }
        },
        sender: {
            inputSelectors: ['textarea[placeholder*="发送"]', '#chat-input', '[role="textbox"]'],
            triggerInput: true
        },
        isTyping: function() {
            var sendBtn = document.querySelector('[class*="send"] button') || document.querySelector('button[aria-label*="发送"]') || document.querySelector('[class*="stop"]');
            return sendBtn && sendBtn.offsetParent !== null;
        }
    },
    'chat.openai.com': {
        name: 'ChatGPT',
        extract: {
            container: '[data-message-author-role="assistant"]',
            codeElement: 'pre',
            getFilename: function(block) {
                var container = block.closest('[data-message-author-role="assistant"]');
                if (!container) return null;
                var text = container.textContent || '';
                var m = text.match(/([a-zA-Z0-9_\-\.\/]+\.\w{1,6})\s*\n```/);
                if (m && m[1].indexOf('.') > 0) {
                    var ext = m[1].split('.').pop().toLowerCase();
                    var validExts = ['cs','js','html','css','json','txt','py','java','ts','tsx','jsx','md','xml','yaml','yml','sql','sh','bat','cmd'];
                    if (validExts.indexOf(ext) >= 0) return m[1];
                }
                return null;
            }
        },
        sender: {
            inputSelectors: ['#prompt-textarea', 'textarea'],
            triggerInput: false
        },
        isTyping: function() {
            var stopBtn = document.querySelector('[data-testid="stop-button"]');
            return stopBtn && stopBtn.offsetParent !== null;
        }
    },
    'chatgpt.com': {
        name: 'ChatGPT',
        extract: {
            container: '[data-message-author-role="assistant"]',
            codeElement: 'pre',
            getFilename: function(block) {
                var container = block.closest('[data-message-author-role="assistant"]');
                if (!container) return null;
                var text = container.textContent || '';
                var m = text.match(/([a-zA-Z0-9_\-\.\/]+\.\w{1,6})\s*\n```/);
                if (m && m[1].indexOf('.') > 0) {
                    var ext = m[1].split('.').pop().toLowerCase();
                    var validExts = ['cs','js','html','css','json','txt','py','java','ts','tsx','jsx','md','xml','yaml','yml','sql','sh','bat','cmd'];
                    if (validExts.indexOf(ext) >= 0) return m[1];
                }
                return null;
            }
        },
        sender: {
            inputSelectors: ['#prompt-textarea', 'textarea'],
            triggerInput: false
        },
        isTyping: function() {
            var stopBtn = document.querySelector('[data-testid="stop-button"]');
            return stopBtn && stopBtn.offsetParent !== null;
        }
    },
    'claude.ai': {
        name: 'Claude',
        extract: {
            container: '.code-block__code',
            codeElement: null,
            getFilename: function(block) {
                var cb = block.closest('.code-block');
                if (!cb) return null;
                var header = cb.querySelector('.code-block__header');
                return header ? header.textContent.trim() : null;
            }
        },
        sender: {
            inputSelectors: ['[contenteditable="true"][role="textbox"]', '[contenteditable="true"]'],
            triggerInput: true
        },
        isTyping: function() { return false; }
    },
    'gemini.google.com': {
        name: 'Gemini',
        extract: {
            container: 'pre.code-block',
            codeElement: null,
            getFilename: function(block) {
                var title = block.querySelector('.code-block-title');
                return title ? title.textContent.trim() : null;
            }
        },
        sender: {
            inputSelectors: ['textarea[aria-label]', 'textarea'],
            triggerInput: true
        },
        isTyping: function() { return false; }
    }
};