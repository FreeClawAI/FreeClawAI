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

## FreeClaw Protocol v1

FreeClaw uses a simple protocol to identify files in AI replies. When asking AI for code, include this protocol in your prompt:

### Format

```
// freeclaw:relative/path/to/file.ext
complete source code
```

### Rules

1. Each file starts with `// freeclaw:relative/path/to/file.ext` on its own line
2. The path is relative to the workspace root directory
3. After the path line, output the **complete** source code — never use `...` or truncated
4. Separate multiple files with a blank line

### Example

```
// freeclaw:js/services/extractor.js
const Extractor = {
    extract() {
        const files = [];
        const text = document.body.innerText;
        const pattern = /\/\/ freeclaw:([^\n]+)\n([\s\S]*?)(?=\n\/\/ freeclaw:|$)/g;
        let match;
        while ((match = pattern.exec(text)) !== null) {
            files.push({ name: match[1].trim(), content: match[2].trim() });
        }
        return files;
    }
};
```

```
// freeclaw:panel.css
#main { color: red; }
```

---

## Usage

### Parasitic Mode

Works directly on DeepSeek Chat. Lives inside the AI Chat page, **costs you zero tokens**.

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

---

## Third-Party Libraries

- js-beautify (MIT License)

---

## License

MIT License

---

**Code AI, Free Forever.**
```