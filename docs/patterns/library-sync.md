# Pattern: Library Sync

Use this when the plugin extracts structured state from a Figma library and reconciles it with remote storage or downstream tooling.

## Good fit

- design system library fingerprinting
- token and component sync
- diff and push workflows

## Core shape

- Main thread extracts components, variables, or styles
- UI drives the state machine: extract, compare, authenticate, push, done
- Optional backend stores the remote representation and supports reconciliation

## Key decisions

- Which identifiers are stable enough to sync on
- Whether auth is required
- How much diff detail the user needs before pushing

## Failure modes

- no file identity available
- auth missing at comparison or push time
- remote schema drift
- large library payloads
