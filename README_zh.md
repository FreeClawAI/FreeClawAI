# FreeClaw

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
5. 打开 DeepSeek Chat，右上角出现 📁 和 💾 按钮

> ✅ 不需要 `npm install` | ✅ 不需要 `pip install` | ✅ 不需要 Docker

---

## 可选：本地文件服务

```bash
node server.js
```

仅依赖 Node.js 内置模块，**无需 npm install**。服务运行在 `http://127.0.0.1:8080`。

---

## FreeClaw 协议

FreeClaw 定义了一套人与 AI 之间的简单通信协议，用于代码交付：

1. 每个文件以 h2 标题开头，标题内容为**项目根目录下的相对路径**
2. 标题后紧跟一个带语言标记的代码块，包含**完整源代码**
3. FreeClaw 自动提取所有符合此格式的文件并保存到你的项目

### 协议规范

```
## 项目根目录的相对路径/文件名.扩展名
```语言
完整的源代码——绝不截断、绝不省略
```
```

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

## js/ui/panel.js
```javascript
const Panel = {
    open() { this.el.classList.add('show'); }
};
```

## css/main.css
```css
#app { margin: 0; padding: 0; }
```

## README.md
```markdown
# 项目标题
内容在这里。
```
````

FreeClaw 保存文件时会根据路径结构自动创建子目录。

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
