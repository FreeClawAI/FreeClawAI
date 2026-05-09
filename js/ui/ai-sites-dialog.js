// FreeClaw - AI page settings dialog
const AiSitesDialog = {
    show: function() {
        var body = '';

        var preFoldEnabled = localStorage.getItem('fc_pre_fold') === '1';
        var userFoldEnabled = localStorage.getItem('fc_user_fold') === '1';

        body += '<div style="padding:8px 0;border-bottom:1px solid #eee">';
        body += '<label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px">';
        body += '<input type="checkbox" id="aiCfgPreFold" ' + (preFoldEnabled ? 'checked' : '') + '>';
        body += I18n.t('Fold AI code blocks') + ' (' + I18n.t('Click header to collapse') + ')';
        body += '</label>';
        body += '</div>';

        body += '<div style="padding:8px 0">';
        body += '<label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px">';
        body += '<input type="checkbox" id="aiCfgUserFold" ' + (userFoldEnabled ? 'checked' : '') + '>';
        body += I18n.t('Fold user messages');
        body += '</label>';
        body += '</div>';

        DialogStack.show('aisites', {
            title: I18n.t('Settings'),
            body: body,
            buttons: [
                { text: I18n.t('Close'), id: 'aiSitesClose', primary: true, onClick: function() {
                    var preFold = document.getElementById('aiCfgPreFold').checked;
                    var userFold = document.getElementById('aiCfgUserFold').checked;
                    localStorage.setItem('fc_pre_fold', preFold ? '1' : '0');
                    localStorage.setItem('fc_user_fold', userFold ? '1' : '0');
                    if (preFold) CodeFolder.start(); else CodeFolder.stop();
                    if (userFold) UserFolder.start(); else UserFolder.stop();
                    DialogStack.close();
                }}
            ],
            onRender: function() {
                var c = document.getElementById('aiDialog');
                if (c) { c.style.width = '400px'; c.style.maxWidth = '90%'; }
            }
        });
    },

    init: function() {
        if (localStorage.getItem('fc_pre_fold') === '1') CodeFolder.start();
        if (localStorage.getItem('fc_user_fold') === '1') UserFolder.start();
    }
};