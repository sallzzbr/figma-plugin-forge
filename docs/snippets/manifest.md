# Snippet: Manifest

**This is the single manifest contract for plugins built with this method.** [`docs/guides/project-setup.md`](../guides/project-setup.md) links here. Do not duplicate this template elsewhere.

Start from the minimal block below. Add opt-in fragments only when the design doc's `## Manifest Decisions` section says you need them.

## Minimal (default)

Copy this as-is for any plugin that runs locally against the current page with no network access:

```json
{
  "name": "My Plugin",
  "id": "YOUR_PLUGIN_ID",
  "api": "1.0.0",
  "editorType": ["figma"],
  "main": "build/main.js",
  "ui": "build/ui.html",
  "documentAccess": "dynamic-page"
}
```

Get the plugin `id` from the [Figma Plugin Dashboard](https://www.figma.com/developers) when you're ready to publish. During development you can use any placeholder string.

## Opt-ins

Merge only the fragments that match your design doc. Never copy a fragment you don't need — unused capabilities either trigger permission prompts or get rejected at review.

### Add `networkAccess` — only if the UI calls external domains

```json
{
  "networkAccess": {
    "allowedDomains": ["https://api.example.com"]
  }
}
```

List the exact domains the UI will `fetch`. Do not use `"*"`. See [common-pitfalls.md § 12](../guides/common-pitfalls.md).

### Switch to `documentAccess: "dynamic"` — only if you need cross-page access

```json
{
  "documentAccess": "dynamic"
}
```

Default `"dynamic-page"` restricts the API to the current page. Use `"dynamic"` only when traversal across pages is required; it triggers a user permission prompt. See [common-pitfalls.md § 11](../guides/common-pitfalls.md).

### Add `enablePrivatePluginApi` — only if `figma.fileKey` is needed

```json
{
  "enablePrivatePluginApi": true
}
```

Required only for private, org-distributed plugins that use `figma.fileKey` or other private APIs. Leave out for public plugins.

### Change `editorType` — only if targeting FigJam, Slides, or Dev Mode

```json
{
  "editorType": ["figjam"]
}
```

Or a combination: `["figma", "figjam"]`, `["dev"]`, `["slides"]`. Default is `["figma"]` for design-file plugins.

## Archetype → manifest shape

Pick your archetype from [`docs/patterns/README.md`](../patterns/README.md), then use this table to decide which opt-ins you need:

| Archetype | Minimal | + `networkAccess` | + `documentAccess: "dynamic"` | + `enablePrivatePluginApi` |
| --- | --- | --- | --- | --- |
| `local-audit` | yes | no | only if scanning other pages | no |
| `llm-analysis` | yes | yes (the LLM backend) | no | no |
| `spec-generation` | yes | only if exporting to a backend | only if reading multiple pages | no |
| `library-sync` | yes | only if syncing with a remote service | yes | often yes |

If your plugin does not fit any archetype cleanly, document the choice in the design doc's `## Architecture` section and list every opt-in with a reason.

## Rule

The smallest set of capabilities that matches the plugin. Every extra field is either a permission prompt the user sees or a review risk. If a field isn't in the minimal block above and your design doc doesn't justify it, delete it.