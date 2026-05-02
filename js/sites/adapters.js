// Site adapter configurations for different AI platforms
const Sites = {
    'chat.deepseek.com': {
        name: 'DeepSeek',
        extract: {
            container: '.ds-markdown .md-code-block',
            codeElement: 'pre',
            getFilename(block) {
                let el = block.previousElementSibling;
                for (let j = 0; j < 10 && el; j++) {
                    const h2 = el.tagName === 'H2' ? el : el.querySelector('h2');
                    if (h2) return h2.textContent.trim();
                    el = el.previousElementSibling;
                }
                return null;
            }
        },
        sender: {
            inputSelectors: ['textarea[placeholder*="发送"]', '#chat-input', '[role="textbox"]'],
            triggerInput: true
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
        }
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
        }
    }
};