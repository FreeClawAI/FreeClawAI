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

## The FreeClaw Protocol

FreeClaw defines a simple communication protocol between humans and AI for code delivery:

1. Each file begins with an h2 heading containing the **relative path from project root**
2. The heading is immediately followed by a fenced code block with the **complete source code**
3. FreeClaw extracts all files matching this pattern and saves them to your project

### Protocol Specification

```
## path/relative/to/project/root/filename.ext
```language
complete source code here - never truncated, never abbreviated
```
```

### Example

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
# Project Title
Content here.
```
````

FreeClaw automatically creates subdirectories matching the path structure when saving files.

---

## Usage

### Parasitic Mode

Works directly on DeepSeek Chat. Lives inside the AI Chat page, **costs you zero tokens**.

#### Quick Save (Recommended)

Click the 💾 button in the top-right corner. The save dialog appears directly. Check files → Confirm save → Done. No panel needed.

#### Panel Save

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