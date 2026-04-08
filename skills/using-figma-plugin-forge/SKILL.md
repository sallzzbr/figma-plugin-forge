---
name: using-figma-plugin-forge
description: Use when starting any conversation in a figma-plugin-forge project -- establishes available skills and conventions for Figma plugin development
---

# Using Figma Plugin Forge

This is the meta-skill for figma-plugin-forge. It tells you what skills are available, when to invoke them, and how to follow the project's spec-driven development flow.

## How Skills Work

Skills are markdown files that provide domain-specific guidance for AI assistants working in this repository. Each skill covers a different aspect of Figma plugin development. You should invoke the relevant skill BEFORE taking any action or writing any response.

## Available Skills

| Skill | When to use |
|-------|------------|
| brainstorming | User wants to create a new plugin or major feature. ALWAYS before implementation. |
| writing-plans | Design doc approved, need task-by-task implementation plan. |
| executing-plans | Plan exists, time to implement task by task with commits. |
| figma-api-patterns | Working with Figma Plugin API: selection, traversal, export, variables, styles. |
| plugin-architecture | Build pipeline, shared package, CSS/Tailwind, manifest, project structure. |

## The Rule

Invoke relevant skills BEFORE any response or action. Even 1% chance a skill applies = invoke it.

## Priority

1. Process skills first (brainstorming, writing-plans, executing-plans)
2. Reference skills second (figma-api-patterns, plugin-architecture)

## For any Figma plugin work

1. Read AGENTS.md at repo root first
2. Read the specific module's AGENTS.md
3. Follow spec-driven flow: design doc -> plan -> implement -> verify

## Red Flags (stop and check for skills)

- "Let me just code this" -> brainstorming first
- "I'll figure out the Figma API" -> figma-api-patterns first
- "How does the build work" -> plugin-architecture first

## Without Skills Installed

If you're an AI without this plugin installed, read AGENTS.md at the repo root. It contains all conventions needed for autonomous operation.
