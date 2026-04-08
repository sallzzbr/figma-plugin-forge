# DS Audit

A local design system auditor for Figma. Checks selected elements against configurable rules to verify they use design system variables and styles.

## What this demonstrates

- **Rules engine**: Pluggable rule system with walker, helpers, and per-rule check functions
- **Local-only**: No backend, no network -- all analysis runs in the Figma sandbox
- **Shared UI**: Uses `@figma-forge/shared/ui` components (Tabs, Card, Badge, Button, Switch, Collapsible)
- **Config persistence**: Rules enabled/disabled state persisted via `figma.clientStorage`

## How to run

```bash
# From the monorepo root
npm install
npm run build --workspace=@figma-forge/ds-audit

# Or from this directory
npm run build
```

Then load the plugin in Figma via "Import plugin from manifest" pointing to `manifest.json`.

## How to add rules

1. Create a new file in `src/rules/` (e.g. `src/rules/my-rule.ts`)
2. Export a check function: `export function checkMyRule(nodes: readonly SceneNode[]): RuleViolation[]`
3. Use `walkNodes()` and `createViolation()` from the shared helpers
4. Register the rule in `src/rules/index.ts` by adding it to the `RULES` array

The rule will automatically appear in Settings and be executed during analysis.

## Built-in rules

| Rule ID | Description |
|---------|-------------|
| `color-variables` | Checks fills/strokes use DS variables or color styles |
| `spacing-variables` | Checks Auto Layout padding/gap use DS variables |
