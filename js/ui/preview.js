// Code preview panel with line numbers
const Preview = {
    show(file) {
        const empty = document.getElementById('aiEmpty');
        const nums = document.getElementById('aiLineNumbers');
        const code = document.getElementById('aiPreviewCode');
        if (!file || !file.content) {
            empty.style.display = 'flex'; nums.style.display = 'none'; code.style.display = 'none'; code.readOnly = true;
            return;
        }
        const lines = file.content.split('\n');
        let numStr = '';
        for (let i = 0; i < lines.length; i++) numStr += (i + 1) + '\n';
        nums.value = numStr;
        code.value = file.content;
        code.readOnly = !(file.isUser || file.isEditing);
        empty.style.display = 'none'; nums.style.display = 'block'; code.style.display = 'block';
    },
    getContent() { return document.getElementById('aiPreviewCode').value; },
    setContent(content) { document.getElementById('aiPreviewCode').value = content; this.syncLineNumbers(); },
    syncLineNumbers() {
        const code = document.getElementById('aiPreviewCode');
        const nums = document.getElementById('aiLineNumbers');
        const lines = code.value.split('\n');
        let numStr = '';
        for (let i = 0; i < lines.length; i++) numStr += (i + 1) + '\n';
        nums.value = numStr;
    },
    scrollSync() {
        const code = document.getElementById('aiPreviewCode');
        const nums = document.getElementById('aiLineNumbers');
        code.onscroll = () => { nums.scrollTop = code.scrollTop; };
    }
};