# Pattern: Local Audit

Use this when the plugin inspects existing nodes and returns findings without requiring a backend.

## Good fit

- design system audits
- accessibility checks
- naming and structure validation
- style and variable compliance

## Core shape

- Main thread reads selection and traverses nodes
- Rules stay pure and return findings
- UI shows filters, summaries, and drill-down details
- Local storage is optional for settings and disabled rules

## Key decisions

- Which node types enter the audit
- Which checks are stable contracts versus project-specific rules
- Whether results are only informational or can guide navigation/focus

## Failure modes

- empty selection
- unsupported node types
- hidden or ignored nodes affecting counts
- unclear severity labels in the UI
