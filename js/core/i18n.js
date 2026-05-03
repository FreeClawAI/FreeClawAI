// FreeClaw - Internationalization (English base + Chinese mapping)
var I18N_ZH = {
    'Save selected': '保存选中',
    'Extract AI files': '提取AI文件',
    'New file': '新建文件',
    'New folder': '新建文件夹',
    'Settings': '设置',
    'Click a file to view': '点击文件查看内容',
    'Search...': '搜索...',
    'Add message... (Enter)': '补充内容... (Enter发送)',
    'Send': '发送',
    'Close': '关闭',
    'Save Confirmation': '保存确认',
    'Overwrite:': '覆盖:',
    'New:': '新建:',
    'View Diff': '查看差异',
    'Confirm Save': '确认保存',
    'All ({0} cover + {1} new)': '共 {0} 覆盖 + {1} 新建',
    '[New]': '[新]',
    'Cancel': '取消',
    'File {0} was modified. Force overwrite?': '文件 {0} 已被修改，强制覆盖？',
    'Saved {0} files': '已保存 {0} 个文件',
    'Failed: {0}': '保存失败: {0}',
    '--- Attachments ---': '--- 附件 ---',
    'Content exceeds limit ({0}/{1})': '内容超出限制 ({0}/{1})',
    'Local File Service': '本地文件服务',
    'Server URL': '服务器地址',
    'Test': '测试',
    'Work Directory': '工作目录',
    'Main directory': '主目录',
    'Set as main': '设为主目录',
    'Browse & Add Directory': '浏览并添加目录',
    'Start Local File Service': '启动本地文件服务',
    'Open terminal in the plugin folder, run <code>node server.js</code><br>Or double-click <code>server.bat</code> (Windows)<br>Or run <code>server.sh</code> (Mac/Linux)': '在插件目录下打开终端，执行 <code>node server.js</code><br>或双击 <code>server.bat</code>（Windows）<br>或运行 <code>server.sh</code>（Mac/Linux）',
    'Confirm': '确认',
    'Testing...': '测试中...',
    '✅ Connected': '✅ 连接成功',
    '❌ HTTP {0}': '❌ HTTP {0}',
    '❌ Cannot connect': '❌ 无法连接',
    'Validating...': '验证中...',
    '✅ Added': '✅ 已添加',
    '❌ Cannot access this directory': '❌ 无权访问此目录',
    'Delete': '删除',
    'Select Folder': '选择文件夹',
    'Folder:': '文件夹:',
    'Go': '跳转',
    'Loading...': '加载中...',
    'No subfolders': '无子文件夹',
    'Cannot load folders': '无法加载文件夹',
    'Selected': '已选',
    'Diff: {0}': '差异: {0}',
    'Original': '原始',
    'AI': 'AI',
    '+{0} -{1}': '+{0} -{1}',
    'Confirm Overwrite': '确认覆盖',
    'Templates': '模板管理',
    'Name': '名称',
    'Prompt': '提示词',
    'Edit': '编辑',
    'New Template': '新建模板',
    'Edit Template': '编辑模板',
    '+ New': '+ 新建',
    'Copy': '复制',
    'Download': '下载',
    'Format Code': '格式化',
    'Rename': '重命名',
    'Delete {0}? Cannot undo!': '确定删除 {0}？不可恢复！',
    'Copied: {0}': '已复制: {0}',
    'Renamed: {0}': '已重命名: {0}',
    'Deleted: {0}': '已删除: {0}',
    'Added: {0}': '已添加: {0}',
    'Auto-saved': '已自动保存',
    'Settings saved': '配置已保存',
    'Folder: {0}': '已创建: {0}',
    'Template: {0}': '已收藏: {0}',
    'Unsaved changes. Close anyway?': '有未保存的修改，确定关闭？',
    '[Unable to read file]': '[无法读取文件]',
    'Formatted: {0}': '已格式化: {0}',
    'Cannot connect. Start node server.js': '无法连接服务器，请启动 node server.js',
    'Connected': '已连接',
    'Disconnected': '已断开',
    'Folder name:': '文件夹名:',
    'File name:': '文件名:',
    'Template name:': '模板名称:',
    'Enter new directory path': '输入新目录路径',
    'Desktop': '桌面',
    'Documents': '文档',
    'Downloads': '下载',
    'This PC': '此电脑',
    'Quick access': '快速访问',
    'Workspace': '工作区',
    'Menu': '菜单',
    'Only work directories can be selected': '只能选择工作目录',
    'Can only save to work directories': '只能保存到工作目录',
    'No work directories configured': '未配置工作目录',
    'No files to save': '没有可保存的文件',
    'files selected': '个已选',
    'total': '总计',
    'All': '全选',
    'File': '文件',
    'Size': '大小',
    'Save to': '保存到',
    'Save': '保存',
    'No files selected': '未选择文件',
    '[File too large to preview]': '[文件过大，无法预览]',
    'Opening in browser...': '正在浏览器中打开...',
    'The following files have been modified externally:': '以下文件已被外部修改:',
    'Do you want to overwrite?': '是否覆盖？'
};

var I18n = {
    _lang: 'en',
    _map: {},

    init: function() {
        var navLang = navigator.language || navigator.userLanguage || '';
        if (navLang.startsWith('zh')) {
            this._lang = 'zh';
            this._map = I18N_ZH;
        } else {
            this._lang = 'en';
            this._map = {};
        }
    },

    t: function(text) {
        if (this._lang === 'en') return text;
        var translated = this._map[text];
        if (translated === undefined) return text;
        var result = translated;
        for (var i = 1; i < arguments.length; i++) {
            result = result.replace('{' + (i - 1) + '}', arguments[i]);
        }
        return result;
    }
};