// Site adapter configurations for different AI platforms
const Sites = {
    'chat.deepseek.com': {
        name: 'DeepSeek',
        extract: {
            container: '.ds-markdown .md-code-block',
            codeElement: 'pre',
            getFilename(block) {
                var container = block.closest('.ds-markdown');
                if (!container) return null;
                var allH2 = container.querySelectorAll('h2');
                for (var k = allH2.length - 1; k >= 0; k--) {
                    var h2 = allH2[k];
                    var text = h2.textContent.trim();
                    if (text && h2.compareDocumentPosition(block) & Node.DOCUMENT_POSITION_FOLLOWING) {
                        return text;
                    }
                }
                return null;
            }
        },
        sender: {
            inputSelectors: ['textarea[placeholder*="发送"]', '#chat-input', '[role="textbox"]'],
            triggerInput: true
        },
        isTyping: function() {
            var sendBtn = document.querySelector('[class*="send"] button') ||
                           document.querySelector('button[aria-label*="发送"]') ||
                           document.querySelector('[class*="stop"]');
            if (!sendBtn) return false;
            return sendBtn.offsetParent !== null;
        }
    },
    'chat.openai.com': {
        name: 'ChatGPT',
        extract: {
            container: '[data-message-author-role="assistant"]',
            codeElement: 'pre',
            getFilename(block) {
                const header = block.querySelector('.text-xs, [class*="header"]');
                return header ? header.textContent.trim() : null;
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
            getFilename(block) {
                const header = block.querySelector('.text-xs, [class*="header"]');
                return header ? header.textContent.trim() : null;
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
            getFilename(block) {
                const header = block.closest('.code-block')?.querySelector('.code-block__header');
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
            getFilename(block) {
                const title = block.querySelector('.code-block-title');
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