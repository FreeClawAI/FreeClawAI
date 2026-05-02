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
                '<span id="aiStatusLight" style="position:absolute;top:10px;right:50px;width:10px;height:10px;border-radius:50%;background:#dc3545;z-index:10" title="' + (I18n._lang === 'zh' ? '服务器断开' : 'Disconnected') + '"></span>' +
                '<div class="ai-left">' +
                    '<div class="ai-left-header">' +
                        '<input id="aiSearchFiles" class="ai-search" placeholder="' + I18n.t('file.search') + '">' +
                        '<button id="aiRefreshBtn" title="' + I18n.t('tooltip.extract') + '">' + I18n.t('btn.extract') + '</button>' +
                        '<button id="aiSaveBtn" title="' + I18n.t('tooltip.save') + '">' + I18n.t('btn.save') + '</button>' +
                        '<button id="aiNewFileBtn" title="' + I18n.t('tooltip.newFile') + '">' + I18n.t('btn.newFile') + '</button>' +
                        '<button id="aiNewFolderBtn" title="' + I18n.t('tooltip.newFolder') + '">' + I18n.t('btn.newFolder') + '</button>' +
                        '<button id="aiConfigBtn" title="' + I18n.t('tooltip.config') + '">' + I18n.t('btn.config') + '</button>' +
                    '</div>' +
                    '<div id="aiFileList"></div>' +
                    '<div id="aiSelectedInfo"></div>' +
                '</div>' +
                '<div class="ai-right">' +
                    '<div class="ai-body">' +
                        '<div id="aiEmpty">' + I18n.t('file.empty') + '</div>' +
                        '<textarea id="aiLineNumbers" readonly></textarea>' +
                        '<textarea id="aiPreviewCode" readonly></textarea>' +
                    '</div>' +
                    '<div id="aiPromptBar"></div>' +
                    '<div id="aiTemplateBar"></div>' +
                    '<div class="ai-bottom">' +
                        '<textarea id="aiInput" rows="1" placeholder="' + I18n.t('send.placeholder') + '"></textarea>' +
                        '<button id="aiSendBtn">' + I18n.t('btn.send') + '</button>' +
                        '<button id="aiStarBtn" style="display:none">⭐</button>' +
                        '<button id="aiClosePanelBtn" style="background:#6c757d">' + I18n.t('btn.close') + '</button>' +
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
            if (!confirm(I18n.t('toast.unsaved'))) return;
        }
        this.el.classList.remove('show');
        this.overlay.classList.remove('show');
        this.btn.classList.remove('hidden');
        Dialog.close();
    }
};