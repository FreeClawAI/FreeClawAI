# FreeClawAI

**写代码，不花 Token。**

从 AI 对话中抓取代码，一键保存到本地项目。不花 API Token，不用复制粘贴。

> **无需编译、无需安装依赖、无需注册账号。下载即用。**

[English](README.md)

---

## 安装（30 秒）

1. 点击 **Code → Download ZIP** 下载
2. 解压到任意目录
3. Chrome 打开 `chrome://extensions/`，开启**开发者模式**
4. **加载已解压的扩展程序** → 选择解压文件夹
5. 打开 [DeepSeek Chat](https://chat.deepseek.com/)，右上角出现 📁 和 💾 按钮

> ✅ 不需要 `npm install` | ✅ 不需要 `pip install` | ✅ 不需要 Docker

---

## 可选：本地文件服务

```bash
node server.js
```

仅依赖 Node.js 内置模块，**无需 npm install**。服务运行在 `http://127.0.0.1:8080`。

---

## FreeClaw 协议

FreeClawAI 遵循 FreeClaw 协议 - 一套基于 Markdown 的代码文件交付协议，用于 AI 向文件系统输出结构化代码。

### 规则

1. 每个文件使用一个 h2 标题表示文件路径
2. 文件路径必须是相对于项目根目录的路径（如 js/services/extractor.js）

3. 文件路径必须是规范路径：
   - 不得以 / 或 ./ 开头
   - 不得包含 ..（禁止路径回退）
   - 必须使用正斜杠 /
   - 不得包含额外描述（如 "a.js (updated)"）

4. 每个 h2 后必须跟一个代码块
5. 标题与代码块之间的空行或非结构性内容，解析时可以跳过
6. 若标题后存在多个代码块，仅第一个有效

7. 每个 h2 只对应一个文件
8. 代码块必须是完整源码，不得截断或省略
9. 代码块不能为空

10. 同一响应中允许出现重复路径：
    - 代表完整替换
    - 同名文件的多个条目均有效，用户可选择保留哪个
    - 解析器应保留所有条目，不做自动覆盖

11. 语言标记仅用于展示，文件类型以扩展名为准

12. 如果你只输出了文件的部分内容（如仅修改的几行），必须随后用完整文件格式重新发送整个文件。已经符合协议格式的完整文件无需重复发送。

### 解析模型

一个符合协议的解析器应当：

1. 遍历所有 h2 标题
2. 提取标题内容作为文件路径
3. 向后查找最近的代码块（pre > code）
4. 提取代码内容
5. 写入对应路径的文件

### 示例

````markdown
## src/utils.js
```javascript
function hello() {
    return "hello";
}
```

## src/style.css
```css
body {
    margin: 0;
    font-family: sans-serif;
}
```
````

---

## 使用方式

### 寄生模式

直接在 DeepSeek Chat 上使用。寄生在 AI Chat 页面中，**不消耗你的 Token**。

#### 极速保存（推荐）

点击右上角 💾 按钮，直接弹出保存对话框。勾选文件 → 确认保存 → 完成。无需打开面板。

#### 面板保存

点击 📁 按钮打开主面板：
- 🔍 **提取**：一键抓取 AI 回复中的所有代码文件
- 📄 **预览**：点击文件查看内容
- 💾 **保存**：勾选文件后点击保存（或按 Ctrl+S）
- 📤 **发送**：选择本地文件 + 提示词，发送给 AI

#### 工作流程

```
AI 回复代码 → 点击 💾 → 勾选文件 → 确认 → 文件出现在你的项目中
AI 回复代码 → 点击 📁 → 查看/编辑 → 批量保存
本地代码 → 点击 📁 → 选择文件 → 发送 → AI 审查或修改
```

---

## 功能特性

- 🔍 **一键提取** AI 回复中的所有代码文件
- 💾 **极速保存** 无需打开面板，直接保存
- 💾 **批量保存** 到本地项目目录，VSCode 直接打开
- 📤 **发送本地文件** 给 AI 审查或修改
- 🔄 **差异对比** 覆盖保存前查看代码变更
- ✨ **代码格式化** 使用 js-beautify
- 📋 **提示词模板** 一键复用
- 📁 **多工作区** 支持多个项目目录

---

## 为什么选择 FreeClaw

| 对比 | 手动操作 | FreeClaw |
|------|---------|------|
| 保存 AI 代码 | 复制→新建→粘贴→保存 × N | 一键抓取 |
| 发送本地代码 | 打开→复制→粘贴 | 点击→发送 |
| API 费用 | 自己花钱 | 寄生模式 0 Token |
| 安装 | 需要编译 | 0 依赖 |

---

## 支持的平台

| 平台 | 状态 |
|------|------|
| chat.deepseek.com | ✅ |
| chatgpt.com | ✅ |
| claude.ai | ✅ |
| gemini.google.com | ✅ |

---

## 常见问题

**需要 API Key 吗？**

不需要。FreeClaw 寄生在 AI Chat 页面中，使用平台的免费额度。

**数据安全吗？**

代码全在你自己的电脑上。服务器只监听本地 127.0.0.1。

**支持代码格式化吗？**

支持。右键文件 → 格式化代码。使用 js-beautify（MIT License）。

---

## 第三方库

- js-beautify (MIT License)

---

## 开源协议

MIT License

---

**写代码，不花 Token。**



全部18个UI文件已收齐。现在我对整个插件有了完整理解。

---

## 完整总览

```
FreeClawAI (Chrome Extension MV3)
│
├── content.js          ← 入口：初始化顺序、事件绑定、心跳、Panel生命周期
│
├── js/core/            ← 基础层
│   ├── utils.js        ← HTML转义、debounce、路径处理、内容标准化
│   ├── md5.js          ← 纯JS MD5（文件校验）
│   ├── db.js           ← IndexedDB：files/templates/state/quickMessages
│   ├── config.js       ← chrome.storage.local：serverUrl、workDirs
│   ├── i18n.js         ← 中英文自动切换 + 参数替换
│   └── messages.js     ← FreeClaw协议中英文提示词模板
│
├── js/services/        ← 服务层
│   ├── api.js          ← fetch封装，与 localhost:8080 通信
│   ├── extractor.js    ← 从AI聊天DOM提取代码块（调用adapters）
│   ├── file-service.js ← 文件树状态管理、AI/本地文件匹配、范围合并
│   ├── sender.js       ← 将文件+提示词格式化写入AI输入框
│   ├── formatter.js    ← js-beautify 代码格式化
│   ├── quick-save.js   ← 💾 浮动按钮
│   └── send-btn.js     ← ⚡ 浮动按钮
│
├── js/sites/           ← 平台适配
│   └── adapters.js     ← DeepSeek/ChatGPT/Claude/Gemini 的DOM选择器
│
├── js/ui/              ← UI组件 (18个)
│   ├── panel.js        ← 主面板HTML构建 + 打开/关闭
│   ├── toast.js        ← Toast通知（2.5秒自动消失）
│   ├── dialog.js       ← 对话框栈管理器（多层支持）
│   ├── file-tree.js    ← 文件树渲染 + 懒加载子目录 + 右键菜单
│   ├── editor.js       ← 用户文件编辑器 + 10秒自动保存
│   ├── preview.js      ← 代码预览 + 行号 + 选区高亮
│   ├── save-dialog.js  ← 保存确认对话框（含路径修改、差异对比入口）
│   ├── diff-dialog.js  ← 左右分栏差异对比（支持更改保存路径）
│   ├── send-dialog.js  ← 发送本地文件到AI（含目录树勾选）
│   ├── settings-dialog.js ← 服务器URL、工作目录管理
│   ├── context-menu.js ← 右键菜单（复制/下载/删除/格式化/重命名）
│   ├── dir-picker.js   ← 文件夹选择器（快速访问/面包屑/驱动器）
│   ├── quick-msg.js    ← 快捷消息对话框（文件列表/消息两Tab）
│   ├── quick-file-tree.js ← 快速文件树（全选/层级勾选）
│   ├── prompts-bar.js  ← 提示词快捷栏（从服务器/api/prompts/list加载）
│   ├── templates-bar.js ← 用户模板栏（IndexedDB存储）
│   ├── ai-sites-dialog.js ← AI页面设置（折叠代码块/折叠用户消息）
│   └── code-folder.js  ← 代码块折叠功能
│
├── js/input/           ← 输入处理
│   ├── keyboard.js     ← Ctrl+S/N/F, Escape 快捷键
│   └── dnd.js          ← 拖放文件到面板
│
├── server.js           ← Node.js 本地文件服务器（零依赖，端口8080）
├── panel.css           ← 所有UI样式
├── popup.html          ← 插件弹出窗口（4个AI平台快捷入口）
├── server.bat/sh       ← 启动脚本
└── lib/                ← js-beautify, diff 库
```

## 数据流

```
AI对话页面 (DeepSeek/ChatGPT/Claude/Gemini)
    │
    ▼ adapters.js 定义DOM选择器
Extractor.extract()  ← 解析 h2 + code block
    │
    ▼ {name, content}[]
FileService.refresh()
    ├── 加载本地工作目录树 (Api.listFiles / Api.treeFiles)
    ├── Api.findFiles() 匹配AI文件↔本地文件
    ├── 范围合并 (如 file.js [3,10])
    └── 标记 unsavedAiFiles / userFiles
    │
    ▼
FileTree.render()  ← 左侧文件树 (懒加载目录)
    │
    ├── 点击文件 → Api.readFile() → Preview.show() → Editor.startEdit()
    ├── 双击AI文件 → DiffDialog.show() → 左右分栏差异对比
    └── 右键 → 复制/下载/删除/格式化/重命名
    │
    ▼
SaveDialog.show()  ← 💾 按钮 / Ctrl+S
    ├── 显示文件列表 + 大小 + 保存路径
    ├── 可更改每个文件的保存路径 (DirPicker)
    ├── 可查看差异 (DiffDialog)
    └── Api.writeFileRaw() → Toast通知
    │
    ▼
Sender.send()  ← 📤 发送按钮 / Enter键
    └── 格式化 FreeClaw协议 → 写入AI输入框 → 关闭面板
```

## 关键设计模式

| 模式 | 实现 |
|------|------|
| **寄生模式** | 插件直接注入AI聊天页面DOM，使用页面输入框，0 API Token |
| **FreeClaw协议** | `## path/file.ext` + ` ```code``` ` 标准化AI代码输出 |
| **MD5冲突检测** | server端写入前校验MD5，冲突返回409让用户确认 |
| **范围替换** | 支持 `## file.js [行号,行号]` 部分替换，与本地文件合并 |
| **懒加载目录** | 文件树按需加载子目录，避免一次性请求大量数据 |
| **对话框栈** | DialogStack支持多层对话框叠加，可回退 |
| **自动保存** | 用户编辑的文件每10秒自动存入IndexedDB |
| **双层存储** | chrome.storage.local（配置） + IndexedDB（文件/模板/状态） |
