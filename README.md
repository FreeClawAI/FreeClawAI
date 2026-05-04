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

FreeClaw implements the [FreeClaw Protocol v1](https://github.com/FreeClawAI/freeclaw-protocol) — a Markdown-based protocol for structured code file delivery from AI to file systems.

### Syntax

```
## relative/path/to/file.ext
```language
complete source code
```
```

### Core Rules

1. Each file MUST be represented by one h2 heading
2. The heading MUST contain a relative file path
3. The path MUST NOT start with / or ./
4. The path MUST NOT contain .. (no directory traversal)
5. Only forward slashes (/) are allowed
6. No extra text or annotations are allowed in the path

7. The h2 heading MUST be followed by a code block
8. Parsers MAY skip blank lines or non-structural elements before the code block
9. Only the FIRST code block after an h2 is considered valid

10. The code block MUST contain complete, non-truncated source code
11. Empty code blocks are NOT allowed

12. Each h2 corresponds to exactly one file
13. Duplicate file paths SHOULD be avoided; if present, the last occurrence SHOULD win

14. Language tags in code blocks are OPTIONAL and for readability only
15. Parsers SHOULD rely on file extensions, not language tags

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

## css/main.css
```css
body {
    margin: 0;
}
```

## README.md
```markdown
# Project
This is a sample project.
```
````

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