# Snippet: Manifest

Use this as a checklist, not a copy-paste contract.

```json
{
  "name": "My Plugin",
  "id": "YOUR_PLUGIN_ID",
  "api": "1.0.0",
  "editorType": ["figma"],
  "main": "build/main.js",
  "ui": "build/ui.html",
  "documentAccess": "dynamic-page",
  "networkAccess": {
    "allowedDomains": ["https://YOUR_BACKEND_HOST"]
  },
  "enablePrivatePluginApi": true
}
```

## Notes

- Add `networkAccess` only if the UI actually calls out
- Add `enablePrivatePluginApi` only if `figma.fileKey` is needed
- Use the smallest set of capabilities that matches the plugin
