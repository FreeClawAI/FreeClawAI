# FreeClawAI

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
5. Open [DeepSeek Chat](https://chat.deepseek.com/), the 📁 and 💾 buttons appear in the top-right corner

> ✅ No `npm install` | ✅ No `pip install` | ✅ No Docker

---

## Optional: Local File Server

```bash
node server.js
```

Uses only Node.js built-in modules. **No npm install required.** Runs on `http://127.0.0.1:8080`.

---

## The FreeClaw Protocol

FreeClawAI follows the FreeClaw Protocol - a Markdown-based protocol for structured code file delivery from AI to local file systems.

### Rules

1. Each file MUST use an h2 heading as the file path
2. File paths MUST be relative to the project root (e.g. js/services/extractor.js)

3. File paths MUST be canonical:
   - Must not start with / or ./
   - Must not contain .. (no path traversal)
   - Must use forward slashes /
   - Must not contain extra descriptions (e.g. "a.js (updated)")

4. Each h2 MUST be followed by a code block
5. Empty lines or non-structural content between heading and code block MAY be skipped during parsing
6. If multiple code blocks exist after a heading, only the first one is valid

7. Each h2 corresponds to exactly one file
8. Code blocks MUST contain complete source code, never truncated or omitted
9. Code blocks MUST NOT be empty

10. Duplicate paths within the same response are allowed:
    - Represents full replacement
    - Multiple entries with the same filename are all valid, user may choose which to keep
    - Parser should preserve all entries, do not overwrite automatically

11. Language tags are for display only, file type is determined by extension

12. If you output only a partial file (e.g. just the modified lines), you MUST follow up with the complete file in protocol format. Files already output in complete protocol format do not need to be sent again.

### Parser Model

A compliant parser should:

1. Iterate over all h2 headings
2. Extract heading content as the file path
3. Find the nearest code block after the heading (pre > code)
4. Extract the code content
5. Write to the corresponding file path

### Example

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
| chatgpt.com | ✅ |
| claude.ai | ✅ |
| gemini.google.com | ✅ |

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