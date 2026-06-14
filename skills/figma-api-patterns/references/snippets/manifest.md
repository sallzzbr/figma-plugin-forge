# Snippet: Manifest

The verified manifest ships in [`templates/starter-plugin/manifest.json`](../../../../templates/starter-plugin/manifest.json).
Copy that; this snippet explains the fields. `node scripts/validate-scaffold.mjs` checks the critical ones.

```json
{
  "name": "My Plugin",
  "id": "REPLACE_WITH_PLUGIN_ID",
  "api": "1.0.0",
  "editorType": ["figma"],
  "main": "build/main.js",
  "ui": "build/ui.html",
  "documentAccess": "dynamic-page",
  "networkAccess": {
    "allowedDomains": ["none"]
  }
}
```

## Rules (these break the plugin if wrong)

- `documentAccess` must be `"dynamic-page"` — the only valid value, required for new plugins. There is no `"dynamic"` mode. To read other pages, call `await figma.loadAllPagesAsync()` in the main thread.
- `networkAccess` is required and `allowedDomains` must be a non-empty array. Use `["none"]` for a local-only plugin (never `[]`, never omit it). When the UI calls an API, list those domains instead: `"allowedDomains": ["https://YOUR_BACKEND_HOST"]`.
- `main` and `ui` must match the build output paths exactly (`build/main.js`, `build/ui.html`). Figma injects the `ui` file's contents as `__html__`.
- `id` comes from the Figma Plugin Dashboard; the placeholder must be replaced before publishing.

## Optional fields

- `editorType` can include `"figjam"` and/or `"dev"` if the plugin supports those surfaces.
- `capabilities` (e.g. `["inspect"]` for Dev Mode) — add only the ones the plugin actually uses. Omit if unused; it is not required.
- `enablePrivatePluginApi: true` unlocks `figma.fileKey` and other private APIs, but is gated to private/org plugins and is rejected for public Community plugins. Add it only for a private plugin that needs it.
