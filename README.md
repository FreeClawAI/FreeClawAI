# FreeClaw

**Code AI, Free Forever.**

Grab code from AI chats, save to your local project instantly. Zero API cost. Zero copy-paste.

> **No compilation. No dependencies. No signup. Download and use.**

[中文说明](README_zh.md)

---

## Install (30 seconds)

1. Click **Code → Download ZIP**
2. Extract to any folder
3. Open Chrome, go to `chrome://extensions/`, enable **Developer mode**
4. Click **Load unpacked** → select the extracted folder
5. Open DeepSeek Chat, the 📁 and 💾 buttons appear in the top-right corner

> ✅ No `npm install` | ✅ No `pip install` | ✅ No Docker

---

## Optional: Local File Server

To save files to your project directory:

```bash
node server.js
```

Uses only Node.js built-in modules. **No npm install required.** Runs on `http://127.0.0.1:8080`.

---

## Usage

### Parasitic Mode

Works directly on DeepSeek Chat. Lives inside the AI Chat page, **costs you zero tokens**.

#### Get Source Code Files

When asking AI to return code, use this prompt to ensure FreeClaw-compatible formatting:

> Use h2 headings for file relative paths. No extra text. Put complete source code in code blocks. File paths must be relative to the working directory. For example, use `js/services/xxx.js` instead of `xxx.js`. You must follow this format, otherwise I will use another AI.

Save this as a FreeClaw template for quick reuse.

The AI will reply in this format:

```
## js/services/example.js
``javascript
// complete source code
``

## panel.css
``css
/* complete styles */
``
```

FreeClaw automatically extracts filenames from `h2` headings and code from the following code blocks.

#### Save Files Locally

**Quick Save (Recommended)**

Click the 💾 button in the top-right corner. The save dialog appears directly. Check files → Confirm save → Done. No panel needed.

**Panel Save**

Click the 📁 button to open the main panel:
- 🔍 **Extract**: Grab all code files from AI replies
- 📄 **Preview**: Click a file to view its content
- 💾 **Save**: Check files and click Save (or press Ctrl+S)
- 📤 **Send**: Select local files + prompts, send to AI

#### Workflow

```
AI replies with code → Click 💾 → Check files → Confirm → Files appear in your project
AI replies with code → Click 📁 → View/Edit → Batch save
Local code → Click 📁 → Select files → Send → AI reviews or modifies
```

---

## Features

- 🔍 **One-click extract** all code files from AI replies
- 💾 **Quick Save** save directly without opening the panel
- 💾 **Batch save** to local project folder, ready for VSCode
- 📤 **Send local files** to AI for review or modification
- 🔄 **Diff view** before overwriting files
- ✨ **Code formatting** with js-beautify
- 📋 **Prompt templates** for quick reuse
- 📁 **Multi workspace** support for multiple project directories

---

## Why FreeClaw

| | Manual | FreeClaw |
|------|------|---------|
| Save AI code | Copy → New → Paste → Save × N | One click grab all |
| Send local code to AI | Open → Copy → Paste | Click → Send |
| API cost | Your own Key | 0 token |
| Setup | Compilation needed | Zero dependencies |

---

## vs OpenClaw / OpenCode

| | FreeClaw | OpenClaw | OpenCode |
|------|------|------|------|
| Token cost | **Free** (parasitic) | Requires API Key | Requires API Key |
| Installation | 0 dependencies | Needs setup | Needs setup |
| File save | Direct to project dir | Via API | Via API |
| Code extraction | Auto from DOM | N/A | N/A |
| Multi-platform | DeepSeek | OpenAI API | OpenAI API |
| Diff view | ✅ | ❌ | ❌ |
| Quick Save | ✅ | ❌ | ❌ |

---

## Supported Platforms

| Platform | Status |
|------|------|
| chat.deepseek.com | ✅ |
| chatgpt.com | Planned |
| claude.ai | Planned |
| gemini.google.com | Planned |

---

## FAQ

**Do I need an API Key?**

No. FreeClaw lives inside the AI Chat page and uses the platform's free quota.

**Is my data safe?**

Yes. All code stays on your machine. Server only listens on 127.0.0.1.

**Code formatting?**

Yes. Right-click file → Format Code. Uses js-beautify (MIT License).

**Why doesn't Quick Save work?**

Make sure the page has AI reply code blocks (h2 heading + code block format). If it says "No files to save", the page has no extractable code.

---

## Third-Party Libraries

- js-beautify (MIT License)

---

## License

MIT License

---

**Code AI, Free Forever.**
```