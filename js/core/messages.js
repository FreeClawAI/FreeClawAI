// FreeClaw - Default quick messages (bilingual)
var DEFAULT_MESSAGES = function() {
    var zh = I18n._lang === 'zh';
    return [
        {
            id: 'fc-protocol',
            title: zh ? 'FreeClaw 协议 v2（完整）' : 'FreeClaw Protocol v2 (full)',
            content: zh ?
                '# FreeClaw 协议 v2\n\n这是一套结构化代码交付协议。输出代码时请遵循以下规则。\n\n## 规则\n\n1. 每个文件使用二级标题，标题为相对文件路径。示例：## js/services/utils.js\n2. 部分文件更新时，在路径后加 [start,end] 行范围。示例：## src/app.js [10,25]\n3. 标题只能包含相对路径和可选行范围。不得包含额外文字。\n4. 路径必须使用正斜杠 (/)，不能使用反斜杠 (\\\ )。\n5. 标题后必须紧跟带语言标记的代码块。\n6. 代码块必须包含完整文件内容或精确范围内容。绝不能使用 "..." 截断。\n7. 每个文件独立一个标题+代码块对。\n8. 一次回复可以包含多个文件。\n9. 回复第一行应为工作目录声明：## /absolute/path/to/project\n10. 禁止空代码块。\n\n## 示例输出\n\n## /Users/dev/myproject\n\n## src/utils.js\n```javascript\nconst Utils = {\n    hello() {\n        return "hello";\n    }\n}\n```\n\n## src/style.css [1,5]\n```css\nbody {\n    margin: 0;\n    padding: 0;\n    font-family: sans-serif;\n}\n```\n\n## README.md\n```markdown\n# 我的项目\n这是一个示例。\n```'
                :
                '# FreeClaw Protocol v2\n\nThis is a structured code delivery protocol. You MUST follow these rules when outputting code.\n\n## Rules\n\n1. Each file MUST use a level-2 heading with the relative file path. Example: ## js/services/utils.js\n2. For partial file updates, append [start,end] line range to the path. Example: ## src/app.js [10,25]\n3. The heading MUST contain ONLY the relative path and optional range. No extra text.\n4. The path MUST use forward slashes (/). Do NOT use backslashes (\\).\n5. The heading MUST be followed by a code block with the language tag.\n6. The code block MUST contain the COMPLETE file content or EXACT range content. Never truncate with "...".\n7. Each file MUST be in its own heading+code-block pair.\n8. You MAY include multiple files in one response.\n9. The first line of the response SHOULD be a work directory declaration: ## /absolute/path/to/project\n10. Empty code blocks are FORBIDDEN.\n\n## Example Output\n\n## /Users/dev/myproject\n\n## src/utils.js\n```javascript\nconst Utils = {\n    hello() {\n        return "hello";\n    }\n}\n```\n\n## src/style.css [1,5]\n```css\nbody {\n    margin: 0;\n    padding: 0;\n    font-family: sans-serif;\n}\n```\n\n## README.md\n```markdown\n# My Project\nThis is a sample.\n```'
        },
        {
            id: 'fc-rules-1',
            title: zh ? '规则：始终使用 FreeClaw 格式' : 'Rule: Always use FreeClaw format',
            content: zh ?
                '请使用 FreeClaw 协议格式输出所有代码文件：\n\n## path/to/file.ext\n```language\n完整代码\n```\n\n每个文件独立一个标题。不要用列表或纯文本块。我需要自动提取它们。'
                :
                'Please output ALL code files using the FreeClaw Protocol format:\n\n## path/to/file.ext\n```language\ncomplete code here\n```\n\nEach file gets its own heading. Do not list files as bullet points or plain text blocks. I need to extract them automatically.'
        },
        {
            id: 'fc-rules-2',
            title: zh ? '规则：只使用相对路径' : 'Rule: Use relative paths only',
            content: zh ?
                '所有文件路径必须相对于项目根目录。示例：js/ui/panel.js 而非 C:\\Users\\...\\panel.js。只使用正斜杠 (/)。不带反斜杠。不带绝对路径。必须带文件扩展名。'
                :
                'All file paths MUST be relative to the project root. Example: js/ui/panel.js NOT C:\\Users\\...\\panel.js. Use forward slashes only (/). No backslashes. No absolute paths. File extensions are required.'
        },
        {
            id: 'fc-rules-3',
            title: zh ? '规则：完整代码，禁止省略' : 'Rule: Complete code, no omissions',
            content: zh ?
                '每个代码块必须包含完整文件内容。绝不能写 "..."、"// 其余代码"、"// 同上"。即使文件有 500 行，也必须输出全部 500 行。省略内容会导致提取工具出错。'
                :
                'Every code block MUST contain the complete file content. Do NOT write "...", "// rest of the file", or "// same as before". If the file is 500 lines, output all 500 lines. Partial content breaks the extraction tool.'
        },
        {
            id: 'fc-rules-4',
            title: zh ? '规则：行范围部分更新' : 'Rule: Partial updates with line ranges',
            content: zh ?
                '如果只需修改特定行，标题会包含行范围：## file.js [10,25]。你必须先读取原始文件，然后只输出代码块中变更的行。工具会自动合并。'
                :
                'If I only need to modify specific lines, the heading will include a line range: ## file.js [10,25]. You MUST read the original file first, then output ONLY the changed lines in the code block. The tool will merge them automatically.'
        },
        {
            id: 'fc-rules-5',
            title: zh ? '规则：第一行声明工作目录' : 'Rule: Work directory on first line',
            content: zh ?
                '回复的第一行应为工作目录：## /path/to/project。这帮助工具知道文件保存位置。如果我的消息里提供了工作目录，就用那个。如果没有，可以跳过。'
                :
                'The first line of your response SHOULD be the work directory: ## /path/to/project. This helps the tool know where to save files. If I provide a work directory in my message, use that. If not, you can skip it.'
        }
    ];
};