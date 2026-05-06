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

FreeClawAI 遵循 [FreeClaw Protocol](https://github.com/FreeClawAI/freeclaw-protocol) - 一套基于 Markdown 的代码文件交付协议，用于 AI 向文件系统输出结构化代码。

该协议支持完整文件替换和基于行范围的局部更新，非常适合 AI 与人类协作编码的工作流。

完整规范见 [github.com/FreeClawAI/freeclaw-protocol](https://github.com/FreeClawAI/freeclaw-protocol)。

### 示例

````markdown
## js/services/extractor.js
```javascript
const Extractor = {
    extract() {
        return files;
    }
};
```

## css/main.css[10,15]
```css
.container {
    display: flex;
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
| chatgpt.com | 计划中 |
| claude.ai | 计划中 |
| gemini.google.com | 计划中 |

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