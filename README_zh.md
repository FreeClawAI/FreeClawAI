# FreeClaw

**写代码，不花 Token。**

从 AI 对话中抓取代码，一键保存到本地项目。不花 API Token，不用复制粘贴。

> **无需编译、无需安装依赖、无需注册。下载即用。**

[English](README.md)

---

## 安装（30 秒）

1. 点击 **Code → Download ZIP** 下载
2. 解压到任意目录
3. Chrome 打开 `chrome://extensions/`，开启**开发者模式**
4. **加载已解压的扩展程序** → 选择解压文件夹
5. 打开 DeepSeek / ChatGPT / Claude / Gemini 任意一个 AI Chat 页面
6. 右上角出现 📁 按钮，点击即可使用

> ✅ 不需要 `npm install` | ✅ 不需要 `pip install` | ✅ 不需要 Docker

---

## 保存文件到本地

FreeClaw 需要本地文件服务才能保存文件。

1. 在插件目录下打开终端
2. 执行：
   ```bash
   node server.js
   ```
   或双击 `server.bat`（Windows）/ 运行 `server.sh`（Mac/Linux）
3. 点击插件面板的 ⚙️ 按钮，**测试**确认连接成功

> 无需 `npm install`，仅使用 Node.js 内置模块。

---

## 使用

### 抓取 AI 代码

```
AI 回复了代码 → 点击 📁 → 🔍 提取 → 勾选文件 → 💾 保存
```

### 发送本地代码给 AI

```
📁 打开面板 → 点击本地文件 → 选提示词 → 📩 发送
```

---

## 为什么选择 FreeClaw

| 对比 | 手动操作 | FreeClaw |
|------|---------|------|
| 保存 AI 代码 | 复制→新建→粘贴→保存 × N | 一键抓取 |
| 发送本地代码 | 打开→复制→粘贴 | 点击→发送 |
| API 费用 | 自己花钱 | 0 Token |
| 安装 | 需要编译 | 0 依赖 |

---

## 支持的 AI 平台

| 平台 | 抓取代码 | 发送消息 |
|------|---------|---------|
| chat.deepseek.com | ✅ | ✅ |
| chatgpt.com | ✅ | ✅ |
| claude.ai | ✅ | ✅ |
| gemini.google.com | ✅ | ✅ |

---

## 常见问题

**需要 API Key 吗？**
不需要。FreeClaw 寄生在 AI Chat 页面上，消耗 AI 平台的免费额度。

**数据安全吗？**
代码全在你电脑上。服务器只监听本地 127.0.0.1。

**支持代码格式化吗？**
支持。右键文件 → 格式化（使用 js-beautify）。

---

## 第三方库

- js-beautify (MIT)
- diff (BSD-3-Clause)

---

## 开源协议

MIT

---

**写代码，不花 Token。**
```