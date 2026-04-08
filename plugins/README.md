# Plugins

This directory contains 4 boilerplate Figma plugins demonstrating common patterns.

| Plugin | Description | Backend |
|--------|-------------|---------|
| [ds-audit](ds-audit/) | Design system audit (colors, spacing, typography) | No |
| [ui-review](ui-review/) | AI-powered UX/UI analysis | Yes |
| [ds-library-sync](ds-library-sync/) | DS library extraction and sync | Yes |
| [spec-generator](spec-generator/) | Requirements/spec generation from frames | Yes |

## Running a plugin

From the monorepo root:
```
npm run ds-audit:dev
npm run ui-review:build
# etc.
```

## Creating a new plugin

1. Copy an existing plugin directory (ds-audit is simplest for local-only)
2. Update `manifest.json` with new ID and name
3. Update `package.json` with new workspace name
4. Add scripts to root `package.json`
5. Run `npm install` from root
6. Start developing: `npm run <name>:dev`

> For AI/agent context, see `AGENTS.md` in this directory.
