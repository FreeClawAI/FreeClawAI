# FreeClaw(Developing)

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
5. Open any supported AI Chat:
   - [DeepSeek](https://chat.deepseek.com)
   - [ChatGPT](https://chatgpt.com) Developing
   - [Claude](https://claude.ai) Developing
   - [Gemini](https://gemini.google.com) Developing
6. Click the 📁 button in the top-right corner

> ✅ No `npm install` | ✅ No `pip install` | ✅ No Docker

---

## Save Files Locally

FreeClaw needs a local file server to save files.

1. Open terminal in the plugin folder
2. Run:
   ```bash
   node server.js
   ```
   Or double-click `server.bat` (Windows) / run `server.sh` (Mac/Linux)
3. Click the ⚙️ button in the panel, then **Test** to confirm connection

> No `npm install` — uses only Node.js built-in modules.

---

## Usage

### Grab AI Code

```
AI replies with code → Click 📁 → 🔍 Extract → Check files → 💾 Save
```

### Send Local Code to AI

```
📁 Open panel → Click local file → Pick a prompt → 📩 Send
```

---

## Why FreeClaw

| | Manual | FreeClaw |
|------|------|---------|
| Save AI code | Copy → New → Paste → Save × N | One click |
| Send local code | Open → Copy → Paste | Click → Send |
| API cost | Your own Key | Zero token |
| Setup | Compilation needed | Zero dependencies |

---

## Supported Platforms

| Platform | Grab Code | Send Message |
|------|---------|---------|
| chat.deepseek.com | ✅ | ✅ |
| chatgpt.com | ✅ | ✅ |
| claude.ai | ✅ | ✅ |
| gemini.google.com | ✅ | ✅ |

---

## FAQ

**Do I need an API Key?**
No. FreeClaw works inside AI Chat pages, using the platform's free quota.

**Is my data safe?**
Yes. All code stays on your machine. Server only listens on 127.0.0.1.

**Code formatting?**
Yes. Right-click a file → Format (powered by js-beautify).

---

## Third-Party Libraries

- js-beautify (MIT)
- diff (BSD-3-Clause)

---

## License

MIT

---

**Code AI, Free Forever.**
```