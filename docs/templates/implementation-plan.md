# <Feature Name> Implementation Plan

> **For Claude:** Use executing-plans skill to implement this plan task-by-task.

**Goal:** One sentence describing what this builds.

**Architecture:** 2-3 sentences about approach.

**Tech Stack:** Key technologies/libraries involved.

---

### Task N: <Component Name>

**Files:**
- Create: `exact/path/to/file.ts`
- Modify: `exact/path/to/existing.ts`

**Step 1: <Action description>**

```typescript
// Code to write or change
```

**Step 2: Build and verify**

```bash
npm run build -w plugins/<name>
```
Expected: Build succeeds with no errors.

**Step 3: Commit**

```bash
git add <files>
git commit -m "feat: description"
```

---

### Verification

After all tasks:
1. All builds pass: `npm run build:all`
2. No TypeScript errors
3. Plugin loads correctly in Figma
4. [Feature-specific checks]
