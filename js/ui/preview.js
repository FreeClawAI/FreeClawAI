// Code preview panel with line numbers
const Preview = {
    show(file) {
        const empty = document.getElementById('aiEmpty');
        const nums = document.getElementById('aiLineNumbers');
        const code = document.getElementById('aiPreviewCode');
        if (!file || !file.content) {
            if (empty) empty.style.display = 'flex';
            if (nums) { nums.style.display = 'none'; }
            if (code) { code.style.display = 'none'; }
            return;
        }
        const lines = file.content.split('\n');
        let numStr = '';
        for (let i = 0; i < lines.length; i++) numStr += (i + 1) + '\n';
        if (nums) { nums.value = numStr; nums.style.display = 'block'; }
        if (code) {
            code.value = file.content;
            code.readOnly = !(file.fileType === 'user');
            code.style.display = 'block';
        }
        if (empty) empty.style.display = 'none';
    },
    getContent() {
        var code = document.getElementById('aiPreviewCode');
        return code ? code.value : '';
    },
    setContent(content) {
        var code = document.getElementById('aiPreviewCode');
        if (code) { code.value = content; }
        this.syncLineNumbers();
    },
    syncLineNumbers() {
        const code = document.getElementById('aiPreviewCode');
        const nums = document.getElementById('aiLineNumbers');
        if (!code || !nums) return;
        const lines = code.value.split('\n');
        let numStr = '';
        for (let i = 0; i < lines.length; i++) numStr += (i + 1) + '\n';
        nums.value = numStr;
    },
    scrollSync() {
        const code = document.getElementById('aiPreviewCode');
        const nums = document.getElementById('aiLineNumbers');
        if (!code || !nums) return;
        code.onscroll = () => { nums.scrollTop = code.scrollTop; };
    }
};