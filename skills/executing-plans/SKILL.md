---
name: executing-plans
description: Use when a plan exists and it is time to implement task by task with commits and verification
---

# Executing Implementation Plans

You are implementing a Figma plugin feature from a written plan. Execute one task at a time, verify each step, commit, and move on.

## When to use this skill

- A plan exists in `docs/plans/` and has been approved
- The user says "execute the plan" or "implement task N"
- You are resuming a partially completed plan

## Step 0: Load the plan

1. Read the plan file (the user will provide the path or you can check `docs/plans/` for the most recent one)
2. Extract the full task list into a numbered checklist
3. Identify which tasks are already done (look for existing commits or completed code)
4. Present the task list to the user with status markers:
   - `[x]` — already completed
   - `[ ]` — pending
   - `[~]` — partially done (needs review)
5. Confirm with the user which task to start from

## Execution loop

For each task, follow this cycle exactly:

### 1. Announce the task

State which task you are starting. Quote the task title and file list from the plan.

### 2. Read before writing

Before modifying any file, read its current contents. Never assume a file's state from the plan alone — it may have been changed by a previous task or manual edit.

Check for:
- Does the file exist yet?
- Are there imports or patterns already in place that the task assumes?
- Has a previous task already made some of the changes?

### 3. Implement the changes

Follow the plan's instructions precisely. If the plan provides code snippets, use them. If something in the plan contradicts the current code, stop and flag it (see "When blocked" below).

Key reminders for Figma plugin code:
- **Preact, not React**: use `h` from `preact` and `preact/hooks`
- **No JSX fragments**: use `<div>` wrappers instead of `<>...</>`
- **No innerHTML with closing tags**: use `textContent` to avoid breaking the Figma iframe sandbox
- **UI entry point**: must be `export default function(rootNode: HTMLElement)`
- **Main thread**: no DOM, no network, no browser APIs — only Figma API
- **UI iframe**: no direct Figma API access — communicate via `postMessage`
- **Shared components**: import from `@figma-forge/shared/ui`, never duplicate locally

### 4. Build verification

After every task that changes code, run:

```
npm run build -w plugins/<name>
```

If the task changed `packages/shared`, run:

```
npm run build:all
```

The build **must pass** before proceeding. If it fails:
1. Read the error output carefully
2. Fix the issue
3. Rebuild
4. Do not move on until the build is clean

### 5. Self-review

After implementing, compare what you built against the plan:

- Did you modify exactly the files listed?
- Did you create the types, handlers, or components specified?
- Does the code match the plan's intent (not just the letter)?
- Are there any imports, exports, or message contracts you forgot to wire up?

If you find a discrepancy, fix it before committing.

### 6. Commit

Create a commit using the message from the plan. If the plan does not specify a commit message, write one using conventional commit format:

```
feat(<plugin>): <what this task accomplished>
```

One commit per task. Do not batch multiple tasks into a single commit.

### 7. Move to the next task

Mark the task as done in your mental checklist and proceed.

## Checkpoints

After every 3-5 completed tasks, pause and provide a progress summary:

```
## Checkpoint — Tasks 1-5

**Completed**:
- Task 1: Added SelectionPayload type
- Task 2: Registered message handler in main.ts
- Task 3: Created SelectionPanel component
- Task 4: Wired panel into App.tsx
- Task 5: Added build-time CSS for panel

**Build status**: Passing
**Next up**: Task 6 — Connect backend endpoint
**Issues**: None so far
```

This gives the user a chance to review progress, course-correct, or pause.

## When blocked

If you encounter any of these situations, **stop and flag it to the user** before proceeding:

- The plan references a file that does not exist and was not created by a previous task
- The plan's code contradicts existing code patterns or types
- A build fails with an error that is not obviously related to the current task
- The plan assumes a shared component or service that does not exist in `packages/shared`
- The plan's task order seems wrong (e.g., Task 5 depends on something from Task 8)
- You discover a Figma API limitation that the plan did not account for

Present the issue clearly:

```
BLOCKED on Task N: <title>

The plan says to import `FooService` from `@figma-forge/shared/services`,
but this service does not exist. Options:
1. Create it in shared (adds a new task)
2. Create it locally in the plugin
3. Skip this task and revisit after clarification

Which approach do you prefer?
```

Never silently deviate from the plan. If the plan is wrong, update it.

## Figma-specific testing reminder

After any build that changes the plugin's behavior:

- The plugin must be **closed and reopened** in Figma to pick up the new build
- If the plugin uses `figma.clientStorage`, test with both fresh and existing storage states
- If the plugin reads selection, test with: no selection, single node, multiple nodes, nested nodes
- If the plugin has a backend dependency, verify the edge function is deployed or mocked

## Final verification

After all tasks are complete:

1. Run the full build one more time:
   ```
   npm run build -w plugins/<name>
   ```

2. If shared code was changed:
   ```
   npm run build:all
   ```

3. Verify the git log shows one commit per task with clear messages:
   ```
   git log --oneline -<number-of-tasks>
   ```

4. Walk through the post-completion checklist from the plan (if present):
   - All tasks committed
   - Build passes
   - Plugin loads in Figma
   - AGENTS.md files updated if contracts or structure changed
   - No local duplicates of shared components or types

5. Report to the user: plan path, tasks completed (N/N), final build status, list of files created and modified, and any follow-up items. Remind them to close and reopen the plugin in Figma to test.

## Resuming a partial execution

If resuming a plan that was partially completed in a previous session:

1. Read the plan file
2. Check `git log` for commits matching the plan's commit messages
3. Read the files listed in completed tasks to confirm they match expectations
4. Present the status to the user and confirm where to resume
5. Continue the execution loop from the next pending task
