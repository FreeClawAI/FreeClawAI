// FreeClaw - Dialog utilities
const Dialog = {
    show: function(html) {
        document.getElementById('aiDialog').innerHTML = html;
        document.getElementById('aiDialog').style.display = 'block';
        document.getElementById('aiDialogOverlay').style.display = 'block';
    },

    close: function() {
        document.getElementById('aiDialog').style.display = 'none';
        document.getElementById('aiDialogOverlay').style.display = 'none';
        document.getElementById('aiDialog').innerHTML = '';
    }
};