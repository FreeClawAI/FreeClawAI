// FreeClaw - Main panel builder
const Panel = {
    el: null,
    overlay: null,
    btn: null,

    init: function() {
        if (document.getElementById('ai-file-btn')) return;

        this.btn = document.createElement('button');
        this.btn.id = 'ai-file-btn';
        this.btn.textContent = '📁';
        this.btn.title = 'FreeClaw - Code AI, Free Forever';
        this.btn.onclick = function() { Panel.open(); };
        document.body.appendChild(this.btn);

        this.overlay = document.createElement('div');
        this.overlay.id = 'ai-file-overlay';
        this.overlay.onclick = function() { Panel.close(); };
        document.body.appendChild(this.overlay);

        this.el = document.createElement('div');
        this.el.id = 'ai-file-panel';
        this.el.innerHTML =
            '<div class="ai-main">' +
                '<div class="ai-left">' +
                    '<div class="ai-left-header">' +
                        '<input id="aiSearchFiles" class="ai-search" placeholder="' + I18n.t('Search...') + '">' +
                        '<button id="aiRefreshBtn" title="' + I18n.t('Extract AI files') + '">🔍</button>' +
                        '<button id="aiSaveBtn" title="' + I18n.t('Save selected') + '">💾</button>' +
                        '<button id="aiNewFileBtn" title="' + I18n.t('New file') + '">📄</button>' +
                        '<button id="aiNewFolderBtn" title="' + I18n.t('New folder') + '">📁</button>' +
                        '<button id="aiConfigBtn" title="' + I18n.t('Disconnected') + '" class="ai-status-btn">🔌</button>' +
                    '</div>' +
                    '<div id="aiFileList"></div>' +
                '</div>' +
                '<div class="ai-right">' +
                    '<div class="ai-body">' +
                        '<div id="aiEmpty">' + I18n.t('Click a file to view') + '</div>' +
                        '<textarea id="aiLineNumbers" readonly></textarea>' +
                        '<textarea id="aiPreviewCode" readonly></textarea>' +
                    '</div>' +
                    '<div id="aiPromptBar"></div>' +
                    '<div id="aiTemplateBar"></div>' +
                    '<div class="ai-bottom">' +
                        '<textarea id="aiInput" rows="1" placeholder="' + I18n.t('Add message... (Enter)') + '"></textarea>' +
                        '<button id="aiSendBtn">' + I18n.t('Send') + '</button>' +
                        '<button id="aiStarBtn" style="display:none">⭐</button>' +
                        '<button id="aiClosePanelBtn" style="background:#6c757d">' + I18n.t('Close') + '</button>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<div id="aiDialogOverlay" class="ai-dialog-overlay" style="display:none"></div>' +
            '<div id="aiDialog" class="ai-dialog" style="display:none"></div>';
        document.body.appendChild(this.el);
    },

    open: function() {
        this.el.classList.add('show');
        this.overlay.classList.add('show');
        this.btn.classList.add('hidden');
    },

    close: function() {
        if (Editor && typeof Editor.hasChanges === 'function' && Editor.hasChanges()) {
            if (!confirm(I18n.t('Unsaved changes. Close anyway?'))) return;
        }
        this.el.classList.remove('show');
        this.overlay.classList.remove('show');
        this.btn.classList.remove('hidden');
        Dialog.close();
    }
};