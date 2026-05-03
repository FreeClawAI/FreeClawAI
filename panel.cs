#ai-file-btn{position:fixed;top:60px;right:12px;z-index:999999;width:36px;height:36px;border-radius:50%;background:#007bff;color:white;border:none;cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,.2)}
#ai-file-btn.hidden{display:none}
#ai-quick-save-btn{position:fixed;top:104px;right:12px;z-index:999999;width:36px;height:36px;border-radius:50%;background:#28a745;color:white;border:none;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,.2)}
#ai-quick-save-btn.hidden{display:none}
#ai-file-overlay{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.3);z-index:999997;display:none}
#ai-file-overlay.show{display:block}
#ai-file-panel{position:fixed;top:0;left:0;width:100%;height:100vh;background:white;z-index:999998;display:none;flex-direction:column;font-family:-apple-system,sans-serif;font-size:13px}
#ai-file-panel.show{display:flex}
.ai-main{flex:1;display:flex;overflow:hidden}
.ai-left{width:260px;border-right:1px solid #ddd;display:flex;flex-direction:column;flex-shrink:0;background:#fafafa}
.ai-left-header{display:flex;gap:2px;padding:4px 6px;border-bottom:1px solid #ddd;align-items:center;flex-wrap:wrap}
.ai-left-header button{padding:3px 6px;border:1px solid #ccc;border-radius:3px;background:white;cursor:pointer;font-size:11px}
.ai-left-header button:hover{background:#e9ecef}
.ai-search{flex:1;min-width:60px;padding:3px 6px;border:1px solid #ccc;border-radius:3px;font-size:11px;outline:none}
#aiFileList{flex:1;overflow-y:auto;overflow-x:hidden;padding:2px 0}
.ai-tree-folder{padding:4px 8px;cursor:pointer;display:flex;align-items:center;gap:4px;font-size:12px;user-select:none;white-space:nowrap}
.ai-tree-folder:hover{background:#e8e8e8}
.ai-tree-arrow{width:12px;font-size:10px;color:#888;flex-shrink:0;text-align:center}
.ai-tree-icon{flex-shrink:0;font-size:13px}
.ai-tree-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ai-tree-children{padding:0}
.ai-tree-file{padding:4px 8px;cursor:pointer;display:flex;align-items:center;gap:4px;font-size:12px;user-select:none;white-space:nowrap}
.ai-tree-file:hover{background:#e3f2fd}
.ai-tree-file.active{background:#bbdefb}
.ai-tree-file.ai-ai-file{background:#fffde7}
.ai-tree-file.ai-ai-file:hover{background:#fff9c4}
.ai-tree-file .ai-tree-icon{width:16px;text-align:center;font-size:11px}
.ai-right{flex:1;display:flex;flex-direction:column;overflow:hidden}
.ai-body{flex:1;background:#1e1e1e;overflow:hidden;display:flex}
#aiEmpty{display:flex;align-items:center;justify-content:center;width:100%;height:100%;color:#999;font-size:14px}
#aiLineNumbers{display:none;width:40px;height:100%;background:#1e1e1e;color:#858585;border:none;outline:none;resize:none;font-family:monospace;font-size:12px;line-height:1.5;padding:8px 0;text-align:right;overflow:hidden;user-select:none}
#aiPreviewCode{display:none;flex:1;height:100%;background:#1e1e1e;color:#d4d4d4;border:none;outline:none;resize:none;font-family:monospace;font-size:12px;line-height:1.5;padding:8px 10px;overflow:auto;white-space:pre;tab-size:4}
#aiPromptBar{display:flex;gap:3px;padding:3px 8px;border-top:1px solid #eee;flex-wrap:wrap;flex-shrink:0;background:#fafafa}
.ai-prompt-item{display:flex;align-items:center;gap:2px;font-size:11px;background:#e8e8e8;border-radius:3px;padding:1px 5px}
.ai-prompt-name{max-width:90px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ai-prompt-select,.ai-prompt-send{border:none;background:none;cursor:pointer;font-size:11px;padding:0 1px}
.ai-prompt-send{color:#007bff}
#aiTemplateBar{display:flex;gap:3px;padding:2px 8px;flex-wrap:wrap;flex-shrink:0;align-items:center}
.ai-template-btn{font-size:11px;padding:2px 8px;border:1px solid #ddd;border-radius:12px;background:white;cursor:pointer}
.ai-template-btn:hover{background:#e3f2fd}
.ai-bottom{display:flex;gap:6px;padding:5px 8px;border-top:1px solid #ddd;background:#f8f9fa;align-items:center}
.ai-bottom textarea{flex:1;padding:5px 8px;border:1px solid #ccc;border-radius:4px;font-size:13px;font-family:inherit;resize:none;outline:none;height:30px;line-height:1.4}
.ai-bottom button{padding:5px 12px;border:none;border-radius:4px;background:#007bff;color:white;cursor:pointer;font-size:12px;height:30px;white-space:nowrap}
.ai-bottom button:hover{opacity:.9}
.ai-status-btn{background:transparent!important;font-size:16px!important;padding:5px 6px!important;min-width:30px}
.ai-status-btn.disconnected{opacity:.5}
.ai-menu-dropdown{position:fixed;z-index:9999999;background:white;border:1px solid #ddd;border-radius:4px;box-shadow:0 2px 8px rgba(0,0,0,.15);padding:4px 0;min-width:140px}
.ai-menu-item{padding:8px 14px;cursor:pointer;font-size:13px;white-space:nowrap}
.ai-menu-item:hover{background:#e3f2fd}
.ai-dialog-overlay{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.4);z-index:9999999}
.ai-dialog{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:white;border-radius:8px;padding:0;z-index:10000000;min-width:400px;max-width:750px;max-height:85vh;overflow:auto;box-shadow:0 4px 20px rgba(0,0,0,.3);display:flex;flex-direction:column}
.ai-dialog-header{padding:16px 20px 0;flex-shrink:0}
.ai-dialog-header h3{margin:0;font-size:16px}
.ai-dialog-body{padding:16px 20px;flex:1;overflow:auto}
.ai-dialog-footer{padding:12px 20px 16px;display:flex;gap:8px;justify-content:flex-end;flex-shrink:0;border-top:1px solid #eee}
.ai-dialog-btn{padding:6px 16px;border:1px solid #ccc;border-radius:4px;background:white;cursor:pointer;font-size:13px}
.ai-dialog-btn:hover{background:#f0f0f0}
.ai-dialog-btn.primary{background:#007bff;color:white;border-color:#007bff}
.ai-dialog-layer{display:none}
.ai-dialog label{display:block;margin:8px 0 3px;font-size:12px;color:#666}
.ai-dialog-input{width:100%;padding:6px 8px;border:1px solid #ccc;border-radius:4px;font-size:13px;box-sizing:border-box}
.ai-dialog-textarea{width:100%;padding:6px 8px;border:1px solid #ccc;border-radius:4px;font-size:13px;box-sizing:border-box;resize:vertical;font-family:inherit}
.ai-picker-path-bar{padding:6px 0;display:flex;align-items:center}
.ai-picker-input-bar{display:flex;gap:6px;align-items:center;margin-bottom:8px}
.ai-picker-body{display:flex;gap:0;min-height:250px;max-height:450px;border:1px solid #eee;border-radius:4px;overflow:hidden}
.ai-picker-sidebar{width:160px;border-right:1px solid #eee;overflow-y:auto;background:#fafafa;padding:4px 0;flex-shrink:0}
.ai-picker-main{flex:1;display:flex;flex-direction:column;overflow:hidden}
.ai-picker-quick{padding:6px 10px;cursor:pointer;font-size:12px;border-bottom:1px solid #f0f0f0}
.ai-picker-quick:hover{background:#e3f2fd}
.ai-picker-item{padding:6px 8px;cursor:pointer;border-bottom:1px solid #f0f0f0;font-size:12px;display:flex;align-items:center;gap:6px}
.ai-picker-item:hover{background:#e3f2fd}
.ai-breadcrumb-link{cursor:pointer;color:#007bff}
.ai-breadcrumb-link:hover{text-decoration:underline}