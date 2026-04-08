/**
 * types.ts — DS Library Sync type definitions
 *
 * Defines the state machine, extraction models, diff structures,
 * and message contracts between the main thread and UI.
 */

// ---------------------------------------------------------------------------
// State Machine
// ---------------------------------------------------------------------------

/**
 * UI state machine transitions:
 *
 *   init -> extracting -> comparing -> diff_ready -> [login] -> pushing -> done
 *                                        |                                  |
 *                                        +----------<-- (reset) <-----------+
 *   Any state -> error (on failure)
 */
export type SyncState =
  | 'init'
  | 'extracting'
  | 'comparing'
  | 'diff_ready'
  | 'login'
  | 'pushing'
  | 'done'
  | 'error'

// ---------------------------------------------------------------------------
// Extraction — Components
// ---------------------------------------------------------------------------

/** A component or component set extracted from the Figma file. */
export interface ExtractedComponent {
  /** Figma component key (immutable, persists across renames) */
  key: string
  /** Component name (may change over time) */
  name: string
  /** Description from the Figma component panel */
  description: string
}

// ---------------------------------------------------------------------------
// Extraction — Tokens (Variables)
// ---------------------------------------------------------------------------

/** A variable (token) extracted from the Figma file. */
export interface ExtractedToken {
  /** Figma variable key (immutable) */
  key: string
  /** Variable name (e.g. "colors/primary/500") */
  name: string
  /** Resolved type (COLOR, FLOAT, STRING, BOOLEAN) */
  type: string
  /** Serialized value for display */
  value: string
}

// ---------------------------------------------------------------------------
// Library State (stored in backend)
// ---------------------------------------------------------------------------

export interface LibraryState {
  /** Figma file key identifying this library */
  libraryKey: string
  /** Components extracted from this library */
  components: ExtractedComponent[]
  /** Tokens extracted from this library */
  tokens: ExtractedToken[]
  /** ISO timestamp of last update */
  updatedAt: string
}

// ---------------------------------------------------------------------------
// Diff
// ---------------------------------------------------------------------------

export interface DiffResult {
  added: ExtractedComponent[]
  removed: ExtractedComponent[]
  changed: ExtractedComponent[]
  unchanged: number
}

// ---------------------------------------------------------------------------
// Messages: Main thread <-> UI
// ---------------------------------------------------------------------------

export type MainToUIMessage =
  | { type: 'file-key'; fileKey: string; fileName: string }
  | { type: 'extraction-progress'; current: number; total: number }
  | { type: 'extraction-complete'; components: ExtractedComponent[]; tokens: ExtractedToken[] }
  | { type: 'extraction-error'; error: string }
  | { type: 'storage-value'; key: string; value: unknown; requestId: number }
  | { type: 'storage-set'; key: string; success: boolean; requestId: number }
  | { type: 'storage-error'; key: string; error: string; requestId: number }

export type UIToMainMessage =
  | { type: 'extract-data' }
  | { type: 'get-storage'; key: string; defaultValue?: unknown; requestId: number }
  | { type: 'set-storage'; key: string; value: unknown; requestId: number }
