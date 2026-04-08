---
name: brainstorming
description: Use when the user wants to create a new Figma plugin or add a major feature. Guides through design decisions before any implementation.
---

# Brainstorming a Figma Plugin

## Overview

Help turn plugin ideas into fully formed designs through collaborative Q&A. This skill ensures you understand what you're building before writing any code.

## HARD GATE

Do NOT write any code, scaffold any project, or take any implementation action until you have presented a design and the user has approved it. This applies to EVERY project regardless of perceived simplicity.

## The Process

### Phase 1: Understand the Idea

Ask ONE question at a time. Prefer multiple choice when possible.

**Questions to cover (in order):**

1. **Purpose**
   What does the plugin do? What problem does it solve for the user?

2. **User Interaction**
   What does the user select or do in Figma before using the plugin? (frames, components, text, nothing)

3. **Screens and Tabs**
   How many views does the plugin need? What does each view show?
   Multiple choice examples: "Single screen", "2-3 tabs", "Multi-step wizard"

4. **Canvas Interaction**
   - Read-only: inspect, audit, export (like ds-audit, ui-review)
   - Read-write: modify nodes, create elements, apply styles
   - Both: inspect + modify

5. **Backend Needs**
   Does this plugin need a server?
   - No backend (runs entirely in Figma) -> like ds-audit
   - Yes, needs backend -> ask what for:
     - LLM/AI calls (analysis, generation)
     - Data storage (sync, persistence)
     - Authentication
     - External API proxy
   - **Which backend?** Supabase Edge Functions are the default template in this framework, but any backend works. Ask what the user already uses or prefers:
     - Supabase (default template available)
     - Vercel Serverless Functions
     - AWS Lambda
     - Firebase Cloud Functions
     - Custom API server
     - Other

6. **Authentication** (if backend)
   Does it need auth? What kind?
   - Supabase Auth (email/password, OAuth)
   - API key based
   - OAuth direct
   - No auth needed

7. **AI/LLM Integration**
   Does the plugin use AI? For what?
   - Analysis (evaluate/score existing content)
   - Generation (create new content from input)
   - Classification (categorize/label)
   - None

8. **Local Storage**
   Does the plugin need to persist data locally in Figma?
   - Settings/preferences
   - Analysis history
   - Cache for performance
   - None

9. **Data Flow Summary**
   Confirm the full flow: selection -> [export?] -> [backend?] -> [result?] -> display
   Present this as a diagram and ask user to confirm or correct.

### Phase 2: Propose Approaches

Present 2-3 approaches with trade-offs. Lead with your recommendation and explain why.

Consider:
- Complexity vs. time to build
- Which boilerplate to start from
- Backend vs. local tradeoffs
- Single plugin vs. split into multiple

### Phase 3: Present Design

Present the design section by section. Ask "Does this look right?" after each section.

Sections (scale each to its complexity):
1. Architecture overview (which modules, data flow)
2. UI layout (tabs, panels, components needed)
3. Main thread responsibilities
4. Backend functions (if any)
5. Types and contracts
6. Error handling approach

### Phase 4: Write Design Doc

Save to `docs/plans/YYYY-MM-DD-<topic>-design.md` using the template from `docs/templates/design-doc.md`.

### Phase 5: Transition to Planning

Invoke the writing-plans skill to create a detailed implementation plan.

## Boilerplate Reference

When the design resembles an existing boilerplate, recommend starting from it:

| Pattern | Boilerplate | Key characteristics |
|---------|------------|-------------------|
| Local audit/inspection | ds-audit | No backend, rules engine, node traversal, settings |
| AI-powered analysis | ui-review | Backend + LLM, image export, structured results |
| Library sync/extraction | ds-library-sync | State machine, auth, diff comparison, backend CRUD |
| Document/spec generation | spec-generator | Backend + LLM, structured output, different from analysis |

## Backend Decision Tree

```
Does the plugin need a server?
|-- No -> Pure local plugin (start from ds-audit)
|   +-- Consider: Can you accomplish everything with Figma API + local storage?
|-- Yes, Supabase (default template)
|   +-- Copy backend/ structure, configure edge functions
|   +-- Available templates: analyze, generate-spec, library-state CRUD
|-- Yes, other backend (Vercel, AWS, Firebase, custom)
|   +-- Adapt the controller layer in the plugin
|   +-- Document the backend separately
|   +-- Keep the same plugin-side patterns (controllers/, hooks/)
+-- Yes, multiple backends
    +-- Design service abstraction in plugin's services/
    +-- Each backend gets its own controller
```

## Question Flow Guidelines

### Starting the Conversation

When the user describes their plugin idea, acknowledge it and immediately start Phase 1. Do not summarize or restate what they said at length -- get to the first question quickly.

Example opening:
> "Great idea. Let me ask a few questions to shape the design. First: [question]"

### Handling Vague Ideas

If the user's idea is vague, start with the Purpose question but offer concrete examples:
> "What specific problem does this solve? For example:
> a) Designers forget to use design tokens -> audit plugin
> b) Handoff docs are incomplete -> spec generator
> c) Something else?"

### Handling Detailed Ideas

If the user already provides lots of detail, skip questions they've already answered. Confirm your understanding and move to the first unanswered question.

### When the User Wants to Skip Ahead

If the user says "just build it" or "skip the questions":
> "I hear you, but 5 minutes of design saves hours of rework. Let me ask just the critical questions -- I'll skip anything obvious."

Then ask only questions 1, 4, 5, and 9 from Phase 1.

## Design Principles

### YAGNI (You Aren't Gonna Need It)

Ruthlessly cut features that are not essential for v1. If the user mentions a nice-to-have, acknowledge it and move it to a "Future" section. Build the smallest useful thing first.

### Start Local, Add Backend Later

If the plugin CAN work without a backend (even with reduced functionality), recommend starting local. Backend adds complexity in auth, deployment, error handling, and latency.

### Reuse Before Building

Check if existing shared components, services, or patterns already solve the problem. The shared package (`@mt-figma/shared`) has UI components, services, and types that cover common needs.

### One Plugin, One Job

Each plugin should do one thing well. If the brainstorm reveals two distinct jobs, recommend two plugins that can share code via the shared package.

## Common Patterns to Recognize

### The Audit Pattern
User wants to check/validate/lint something in their Figma file.
-> ds-audit boilerplate, rules engine, no backend needed.

### The AI Analysis Pattern
User wants intelligent feedback on their designs.
-> ui-review boilerplate, backend with LLM, image export pipeline.

### The Sync Pattern
User wants to keep something in sync between Figma and an external system.
-> ds-library-sync boilerplate, state machine, backend CRUD, auth.

### The Generator Pattern
User wants to create something (specs, docs, code) from their Figma designs.
-> spec-generator boilerplate, backend with LLM, structured output.

### The Utility Pattern
User wants a simple tool (rename layers, swap themes, batch operations).
-> Minimal plugin, possibly no UI needed, no backend.

## Output Format for Design Doc

After brainstorming is complete, the design doc should contain:

```markdown
# Plugin Name

## Problem
One paragraph describing the problem this plugin solves.

## Solution
One paragraph describing how the plugin solves it.

## Architecture
- Plugin type: [local | backend-required]
- Backend: [none | supabase | vercel | other]
- Canvas interaction: [read-only | read-write | both]
- Boilerplate: [ds-audit | ui-review | ds-library-sync | spec-generator | minimal]

## User Flow
Step-by-step description of how the user interacts with the plugin.

## UI Design
Description of each screen/tab and what it contains.

## Data Flow
Diagram showing: selection -> processing -> result -> display

## Types
Key TypeScript interfaces for the plugin's domain.

## Future (v2+)
Features explicitly deferred from v1.
```

## Key Principles

- One question at a time
- Multiple choice preferred
- YAGNI ruthlessly -- remove unnecessary features
- Explore alternatives before settling
- Incremental validation -- approve before moving on
- Be flexible -- go back when something does not make sense
