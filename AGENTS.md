# figma-plugin-forge — Agent Context

## Repo responsibility

Monorepo framework for building Figma plugins with AI-assisted spec-driven development.

- `packages/shared`: reusable UI components, services, shared types, and base styles (`@figma-forge/shared`)
- `plugins/ds-audit`: Design System audit engine with local rules — no backend needed
- `plugins/ui-review`: LLM-powered UX/UI analysis across independent heuristic tabs — requires backend
- `plugins/ds-library-sync`: DS library extraction, fingerprinting, and sync with backend
- `plugins/spec-generator`: product requirement generation from selected Figma frames — requires backend
- `backend/supabase/functions`: optional Supabase Edge Functions consumed by plugins
- `skills/`: AI skills for Claude Code, Codex, and Cursor (brainstorming, plan writing, execution, etc.)
- `agents/`: code reviewer agent
- `docs/templates/`: design doc and plan templates
- `docs/plans/`: design docs and execution plans

## Documentation map

| Path                       | Audience | Purpose                                    |
| -------------------------- | -------- | ------------------------------------------ |
| `README.md` (root)        | Humans   | Onboarding, quick start, repo overview     |
| `AGENTS.md` (root)        | AI       | This file — global rules and patterns      |
| `CLAUDE.md` (root)        | AI       | Symlink to AGENTS.md                       |
| `<module>/README.md`      | Humans   | Module-specific usage and commands          |
| `<module>/AGENTS.md`      | AI       | Module-specific operational context         |
| `docs/templates/`         | Both     | Design doc and plan templates              |
| `docs/plans/`             | Both     | Active design docs and execution plans     |

## Reading guide by task type

### Selection, export, or storage flows

Start at the plugin's `src/main.ts` and trace outward through bridge services and storage helpers. The main thread owns all Figma API access.

### UI-only flows

Start at `src/App.tsx`, then `src/components/`, then `@figma-forge/shared/ui`. Understand the message contract between UI and main before changing either side.

### Backend-dependent flows

Read these together — they form a contract chain:

1. Plugin controller or service (`src/controllers/` or `src/services/`)
2. `@figma-forge/shared/services` (bridge, auth, config)
3. `@figma-forge/shared/types` (shared payloads)
4. `backend/supabase/functions/<function-name>`

### Shared package changes

Start at `packages/shared/AGENTS.md`, then check all consumer plugins. Treat any export change as potentially breaking.

## Code patterns

### Principles

- Prefer small, explicit contracts
- Reuse shared code only when the reuse is real — do not promote plugin-specific logic to shared
- Treat documentation as part of the deliverable
- Prefer verified facts from current code over assumptions from old docs

### Runtime boundaries

**Main thread (Figma sandbox)**

- `src/main.ts` runs inside Figma's sandbox
- It controls Figma APIs: selection, export, navigation, node traversal, storage bridges
- No DOM access, no browser APIs, no network calls in this context

**UI iframe**

- `src/ui.tsx` bootstraps the UI; `src/App.tsx` orchestrates state and flow
- Network calls, rendering, and browser helpers belong here
- Communication with `main.ts` happens via `postMessage` — keep the message boundary explicit and typed

**Backend**

- `backend/supabase/functions/*` handles validation, auth, persistence, and LLM calls
- If a backend request or response shape changes, update all consumers in the same work unit

### Stack

- **UI framework**: Preact (`h` from `preact`, `preact/hooks`) — NOT React
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript
- **Build**: `@create-figma-plugin/build`
- **Entry point**: `export default function(rootNode: HTMLElement)` — required by the build system

### Build constraints

- **No JSX fragments**: the build does not support `jsxFragmentFactory`. Use a wrapper `<div>` instead of `<>...</>`.
- **No innerHTML with closing tags**: using `</` inside a `<script>` block breaks the Figma iframe sandbox. Use `textContent` instead.

### Shared package rules

`@figma-forge/shared` exposes four entry points:

| Export                        | Contains                                      |
| ----------------------------- | --------------------------------------------- |
| `@figma-forge/shared/ui`     | Reusable UI primitives (Button, Card, etc.)   |
| `@figma-forge/shared/services` | Bridge, auth, config helpers                |
| `@figma-forge/shared/types`  | Cross-plugin TypeScript contracts             |
| `@figma-forge/shared/styles` | Base Tailwind config and CSS                  |

**Never duplicate a shared component locally.** Before creating a local UI primitive, service, or type, check `packages/shared` first.

### Contract rules

Any change in the categories below requires reviewing neighboring layers:

- UI-to-main messages (types must match on both sides)
- HTTP payloads between plugin and backend (both must update together)
- Shared TypeScript types (affects all consumer plugins)
- Storage keys persisted by plugins
- Library state shapes used across plugins (e.g., ds-library-sync output consumed by ds-audit)

The practical rule: producer, consumer, and docs move together.

## Figma API gotchas

### boundVariables

- `boundVariables` works for fills, strokes, padding, and gap on most nodes
- `fillStyleId` (Color Style) and `boundVariables.fills` (Color Variable) are **different concepts** — design systems often use Styles, not Variables. Always check BOTH.
- `StyledTextSegment.boundVariables` only supports `VariableBindableTextField` keys (fontSize, fontFamily, etc.). **`fills` is NOT a valid key** on text segments — `seg.boundVariables?.fills` is always undefined.

### Text fill colors

For text fill colors, check all three sources:

1. `node.boundVariables?.fills` — variable binding at node level
2. `node.boundVariables?.textRangeFills` — variable binding at text range level
3. `node.fillStyleId` — Color Style binding

### Paint-level bindings

Individual `SolidPaint` objects have `boundVariables?.color` for paint-level variable binding.

### Style ID edge cases

- `MinimalFillsMixin.fillStyleId`: type is `string | mixed` — empty string `""` when no style is applied
- `MinimalStrokesMixin.strokeStyleId`: type is `string` — empty string `""` when no style is applied

### Private API

`figma.fileKey` requires `"enablePrivatePluginApi": true` in `manifest.json`. Without it, the call always returns `null`.

## Spec-driven development flow

### When to write a design doc

Write a design doc in `docs/plans/` when the change:

- Crosses module boundaries
- Adds a new plugin or subsystem
- Changes a backend contract or shared type
- Reorganizes folders or documentation layers
- Could create ambiguity for future maintenance

For small doc fixes the design can be brief. The goal is clarity, not bureaucracy.

### Template

Use `docs/plans/YYYY-MM-DD-<topic>-design.md` and answer:

1. What problem are we solving?
2. What is in scope?
3. What is out of scope?
4. Which contracts or folders will be affected?
5. How will we know it worked?

### Execution plan

Use `docs/plans/YYYY-MM-DD-<topic>.md` and break work into small, verifiable tasks. Each task states:

- Exact files to create, modify, move, or verify
- Expected outcome
- How to verify the task afterward

### Execution rules

- Read current code and docs before implementing
- Prefer the smallest change that satisfies the approved design
- If the change touches a contract, update producer, consumer, and docs in the same work unit
- If the plan becomes wrong mid-execution, update the plan instead of silently deviating

### Definition of done

A change is not done until:

1. Implementation matches the approved design
2. Verification has been executed and read
3. Affected docs have been updated
4. Obsolete or conflicting docs have been removed or archived

## Plugin structure template

### Standard folder layout

```text
plugins/<plugin-name>/
|-- package.json
|-- manifest.json
|-- README.md
|-- AGENTS.md
|-- src/
|   |-- main.ts              # Figma sandbox runtime
|   |-- ui.tsx                # UI bootstrap (entry point)
|   |-- App.tsx               # Main UI orchestration
|   |-- components/           # Visual and feature blocks
|   |-- controllers/ or services/  # API calls, transforms, side effects
|   |-- types.ts or types/    # Local type definitions
|   |-- input.css             # Tailwind source
|   `-- output.css            # Tailwind compiled (generated)
`-- scripts/                  # Only if the plugin needs local build helpers
```

Not every plugin needs every folder, but the runtime separation must stay clear.

### manifest.json required fields

- `name`: plugin display name
- `id`: Figma plugin ID (assigned after first publish)
- `api`: Figma API version
- `editorType`: array of supported editors (`figma`, `figjam`, `dev`)
- `ui`: path to built UI HTML
- `main`: path to built main JS
- `enablePrivatePluginApi`: set to `true` if using `figma.fileKey`

### package.json scripts

Every plugin should have at minimum:

- `dev`: watch mode for development
- `build`: production build
- Both should run the Tailwind compile step, the plugin build, and the HTML embedding

## Build and style rules

### CSS pipeline

1. `packages/shared/styles/base.css` defines shared base styles
2. `packages/shared/tailwind.config.base.ts` defines shared Tailwind theme extensions
3. Each plugin has its own `tailwind.config.ts` that extends the shared base
4. `src/input.css` imports Tailwind directives and any plugin-specific styles
5. Tailwind compiles `input.css` into `output.css`
6. `build-html.js` embeds `output.css` into the final `build/ui.html`

Always edit source files (`input.css`, config files), never generated artifacts (`output.css`, `build/`).

### Build flow

1. Tailwind CSS: `src/input.css` -> `src/output.css`
2. `@create-figma-plugin/build`: `main.ts` + `ui.tsx` -> `build/main.js` + `build/ui.js`
3. `build-html.js`: CSS + JS -> `build/ui.html` (single embedded file for Figma iframe)

Prefer the shared build-html helper in `packages/shared/scripts/build-html.js` when creating new plugins.

## Messaging conventions

### Message naming

- Use **kebab-case** for all message type names
- Suffix conventions: `-changed` (state update), `-loaded` (data ready), `-error` (failure), `-set` (explicit assignment)
- Each message should have a single, clear responsibility
- If a message ID is used in storage or filtering, treat it as a stable contract

### Storage keys

Format: `plugin-name:category` (e.g., `ds-audit:rules`, `ds-library-sync:state`)

Treat persisted keys as stable contracts. Changing a key requires migration or explicit reset logic.

## Sensitive contracts

These cross-module contracts require synchronized updates when changed:

| Contract                                | Parties involved                                         |
| --------------------------------------- | -------------------------------------------------------- |
| Plugin UI <-> main messages             | `src/ui.tsx` / `src/App.tsx` <-> `src/main.ts`          |
| Plugin -> backend HTTP payloads         | Plugin controller <-> Edge Function <-> shared types     |
| `@figma-forge/shared` exports           | `packages/shared` <-> all consumer plugins               |
| Library state schema                    | `ds-library-sync` <-> `ds-audit` shared contract         |
| Plugin -> backend auth flow             | `@figma-forge/shared/services` <-> backend auth function |

## Quick checklist

Before finishing any change, confirm:

1. The change is reflected in the appropriate docs
2. Related contracts were updated together
3. No local duplication where `@figma-forge/shared` should be used
4. The nearest `AGENTS.md` still matches reality

## Working agreements

- Prefer verified facts from current code over assumptions
- Do not treat archived docs (`docs/plans/` completed items) as current guidance without revalidation
- Keep all documentation in English
- When adding a new plugin, follow the plugin structure template and checklist above
