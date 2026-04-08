# @figma-forge/shared

Shared package used by all plugins in this monorepo. It centralizes UI components, Figma runtime bridges, TypeScript types, and base styles that must remain consistent across multiple workspaces.

If you are an AI or agent, also read `packages/shared/AGENTS.md` before editing any export.

## When to use this package

Before creating something new in a plugin, check if the case fits here:

- Reusable visual component
- UI <-> main thread communication helper
- TypeScript contract used by more than one plugin
- Shared base style or visual token

If the change is specific to a single plugin, keep it local.

## Exports

### `@figma-forge/shared/ui`

Reusable Preact components for plugin UIs: `Button`, `Input`, `Card`, `Badge`, `Tabs`, `LoadingSpinner`, `ErrorMessage`, etc.

### `@figma-forge/shared/services`

Shared services between plugins: `figmaBridge.ts` for UI <-> main thread messaging, storage, node focus, and selection export.

### `@figma-forge/shared/types`

Shared TypeScript types used by more than one plugin.

### `@figma-forge/shared/styles`

`styles/base.css` contains base styles and shared CSS custom properties (color tokens, typography, spacing) imported by all plugins.

## Scripts and shared config

- `scripts/build-html.js` -- generates `build/ui.html` with embedded CSS and JS
- `tailwind.config.base.js` -- base Tailwind config for plugins to extend

## How to import

```ts
// UI components
import { Button, Card } from '@figma-forge/shared/ui'

// Services
import { figmaBridge } from '@figma-forge/shared/services'

// Types
import type { SomeType } from '@figma-forge/shared/types'

// Styles (in plugin's input.css)
@import '../../../packages/shared/styles/base.css';
```

## How to extend the Tailwind config

In a plugin's `tailwind.config.js`:

```js
import base from '../../packages/shared/tailwind.config.base.js'

export default {
  ...base,
  content: [...base.content, './src/**/*.{ts,tsx,js,jsx,html}'],
}
```

## Maintenance rules

- Changes in `ui/` affect multiple plugins -- review all consumers
- Changes in `services/` can break communication between UI and Figma sandbox
- Changes in `types/` are contract changes -- must be synced with all consumers
- Framework: Preact (not React)
- JSX fragments must be avoided in this repo
- `shared` exists for real reuse, not for centralizing code by habit
