# <Feature Name> - Design Doc

**Date**: YYYY-MM-DD
**Status**: Draft | Approved | Replaced | Archived
**Target repo**: <path, repo name, or "new project">
**Related pattern(s)**: <docs/patterns/...>
**Related plan**: <docs/plans/... or docs/examples/...>

## Problem

What user problem are we solving? Why is this worth building?

## Solution

What are we building at a high level? Keep this concrete.

## Architecture

- Which pattern(s) from `figma-plugin-forge` are we intentionally using?
- Which decisions are specific to the target repo or product?
- Which runtime pieces exist?

## UI Layout

- What screens, tabs, or panels exist?
- What does each one let the user do?

## Runtime Responsibilities

### Main thread

- What stays in the Figma sandbox?

### UI iframe

- What stays in the browser/UI layer?

### Backend

- What is optional or required outside Figma?

## User Flow

Describe the user journey step by step.

## Data Flow

Describe the flow of data from selection/input to final result.

## Interfaces and Contracts

- Message types between UI and main
- Backend request and response shapes
- Stable identifiers, storage keys, and state contracts

## Manifest Decisions

Fill in every field. These answers drive `manifest.json` per [`docs/snippets/manifest.md`](../snippets/manifest.md).

- `editorType`: figma / figjam / slides / dev (one or more, with reason)
- `documentAccess`: `dynamic-page` (current page only) vs `dynamic` (cross-page, triggers permission prompt) — which and why
- `networkAccess.allowedDomains`: exact domains the UI will call, or empty if none
- `enablePrivatePluginApi`: true or false + reason (only true if `figma.fileKey` or other private APIs are required)
- Plugin ID source: new from [Figma Plugin Dashboard](https://www.figma.com/developers), reusing an existing ID, or placeholder for development

## Error Handling

- What can fail?
- How will the user see and recover from errors?

## Verification Criteria

- How will we know the design worked?
- Which behaviors must be demonstrable?

## Notes

Anything intentionally deferred, risky, or worth revisiting later.
