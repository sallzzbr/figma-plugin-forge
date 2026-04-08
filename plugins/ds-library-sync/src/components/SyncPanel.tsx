/**
 * components/SyncPanel.tsx
 * ---------------------------------------------------------------
 * Main sync panel that shows different content per state.
 * Renders extraction progress, diff summary, and push controls.
 */

import { h } from 'preact'
import {
  Button,
  Card,
  Badge,
  LoadingSpinner,
  ErrorMessage,
  ContentInfo,
} from '@figma-forge/shared/ui'
import type { SyncState, DiffResult, ExtractedComponent, ExtractedToken } from '../types'

interface SyncPanelProps {
  state: SyncState
  error: string | null
  fileKey: string | null
  fileName: string
  progress: { current: number; total: number }
  components: ExtractedComponent[]
  tokens: ExtractedToken[]
  diff: DiffResult | null
  pushResult: { inserted: number; updated: number; removed: number } | null
  onExtract: () => void
  onPush: () => void
  onReset: () => void
  onRetry: () => void
  onRequestLogin: () => void
}

export function SyncPanel({
  state,
  error,
  fileKey,
  fileName,
  progress,
  components,
  tokens,
  diff,
  pushResult,
  onExtract,
  onPush,
  onReset,
  onRetry,
  onRequestLogin,
}: SyncPanelProps) {
  return (
    <div className="space-y-3">
      {/* File info */}
      {fileKey && (
        <div className="flex items-center justify-between">
          <span
            className="text-xs font-medium text-neutral-500 truncate"
            title={fileName}
          >
            {fileName || 'Untitled'}
          </span>
          <Badge variant="info" size="sm">
            {fileKey.slice(0, 8)}...
          </Badge>
        </div>
      )}

      {/* INIT */}
      {state === 'init' && (
        <div className="space-y-3">
          <ContentInfo>
            Extract components and tokens from this Figma library file, compare
            against the stored backend state, and push updates.
          </ContentInfo>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={onExtract}
            disabled={!fileKey}
          >
            Start Extraction
          </Button>
          {!fileKey && (
            <p className="text-xs text-neutral-400 text-center">
              Waiting for file key... (requires enablePrivatePluginApi)
            </p>
          )}
        </div>
      )}

      {/* EXTRACTING */}
      {state === 'extracting' && (
        <div className="flex flex-col items-center justify-center py-6 space-y-3">
          <LoadingSpinner size="lg" />
          <span className="text-sm text-neutral-500">
            {progress.total > 0
              ? `Extracting... page ${progress.current} of ${progress.total}`
              : 'Starting extraction...'}
          </span>
        </div>
      )}

      {/* COMPARING */}
      {state === 'comparing' && (
        <div className="flex flex-col items-center justify-center py-6 space-y-3">
          <LoadingSpinner size="lg" />
          <span className="text-sm text-neutral-500">
            Comparing with stored state...
          </span>
        </div>
      )}

      {/* DIFF_READY */}
      {state === 'diff_ready' && diff && (
        <div className="space-y-3">
          <Card padding="md">
            <div className="text-sm font-semibold mb-2">Extraction Summary</div>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="info" size="sm">
                {components.length} components
              </Badge>
              <Badge variant="info" size="sm">
                {tokens.length} tokens
              </Badge>
            </div>
            <div className="text-xs text-neutral-500">
              {diff.unchanged} unchanged
            </div>
          </Card>

          {/* Show diff counts if there are changes */}
          {(diff.added.length > 0 ||
            diff.removed.length > 0 ||
            diff.changed.length > 0) && (
            <div className="flex flex-wrap gap-2">
              {diff.added.length > 0 && (
                <Badge variant="success">+{diff.added.length} added</Badge>
              )}
              {diff.changed.length > 0 && (
                <Badge variant="warning">{diff.changed.length} changed</Badge>
              )}
              {diff.removed.length > 0 && (
                <Badge variant="error">-{diff.removed.length} removed</Badge>
              )}
            </div>
          )}

          {diff.added.length === 0 &&
            diff.removed.length === 0 &&
            diff.changed.length === 0 && (
            <ContentInfo>
              Everything is in sync. No changes detected.
            </ContentInfo>
          )}
        </div>
      )}

      {/* PUSHING */}
      {state === 'pushing' && (
        <div className="flex flex-col items-center justify-center py-6 space-y-3">
          <LoadingSpinner size="lg" />
          <span className="text-sm text-neutral-500">
            Pushing updates to backend...
          </span>
        </div>
      )}

      {/* DONE */}
      {state === 'done' && pushResult && (
        <div className="space-y-3">
          <Card padding="md" variant="success">
            <div className="text-sm font-semibold mb-2">Sync Complete</div>
            <div className="flex flex-wrap gap-2">
              {pushResult.inserted > 0 && (
                <Badge variant="success">{pushResult.inserted} inserted</Badge>
              )}
              {pushResult.updated > 0 && (
                <Badge variant="warning">{pushResult.updated} updated</Badge>
              )}
              {pushResult.removed > 0 && (
                <Badge variant="error">{pushResult.removed} removed</Badge>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* ERROR */}
      {state === 'error' && error && (
        <div className="space-y-3">
          <ErrorMessage message={error} dismissible={false} />
          <Button variant="secondary" size="md" fullWidth onClick={onRetry}>
            Retry
          </Button>
        </div>
      )}

      {/* Footer actions */}
      {state === 'diff_ready' &&
        diff &&
        (diff.added.length > 0 ||
          diff.removed.length > 0 ||
          diff.changed.length > 0) && (
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={onRequestLogin}
        >
          Push Changes
        </Button>
      )}

      {(state === 'diff_ready' || state === 'done') && (
        <Button variant="ghost" size="sm" fullWidth onClick={onReset}>
          Start Over
        </Button>
      )}
    </div>
  )
}
