/**
 * App.tsx — DS Library Sync main UI component
 *
 * Implements a state machine that drives the sync workflow:
 *
 *   init -> extracting -> comparing -> diff_ready -> [login] -> pushing -> done
 *
 * Each state renders a different panel via SyncPanel, DiffView, or LoginPanel.
 */

import { h } from 'preact'
import { useState, useEffect, useCallback } from 'preact/hooks'
import { signIn, getSession } from '@figma-forge/shared/services'
import type {
  SyncState,
  ExtractedComponent,
  ExtractedToken,
  DiffResult,
  LibraryState,
  MainToUIMessage,
} from './types'
import { computeDiff } from './services/diff'
import { getLibraryState, updateLibraryState } from './services/api'
import { deduplicateComponents } from './services/extract'
import { SyncPanel } from './components/SyncPanel'
import { DiffView } from './components/DiffView'
import { LoginPanel } from './components/LoginPanel'

export default function App() {
  // State machine
  const [state, setState] = useState<SyncState>('init')
  const [error, setError] = useState<string | null>(null)

  // File info from main thread
  const [fileKey, setFileKey] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string>('')

  // Extraction data
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [components, setComponents] = useState<ExtractedComponent[]>([])
  const [tokens, setTokens] = useState<ExtractedToken[]>([])

  // Stored state from backend
  const [storedState, setStoredState] = useState<LibraryState | null>(null)

  // Diff result
  const [diff, setDiff] = useState<DiffResult | null>(null)

  // Push result
  const [pushResult, setPushResult] = useState<{
    inserted: number
    updated: number
    removed: number
  } | null>(null)

  // Track which state to retry from
  const [retryState, setRetryState] = useState<SyncState>('init')

  // ------------------------------------------------------------------
  // Message listener (main thread -> UI)
  // ------------------------------------------------------------------
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const msg = event.data.pluginMessage as MainToUIMessage
      if (!msg) return

      if (msg.type === 'file-key') {
        setFileKey(msg.fileKey)
        setFileName(msg.fileName)
      }

      if (msg.type === 'extraction-progress') {
        setProgress({ current: msg.current, total: msg.total })
      }

      if (msg.type === 'extraction-complete') {
        handleExtractionComplete(msg.components, msg.tokens)
      }

      if (msg.type === 'extraction-error') {
        setError(msg.error)
        setRetryState('extracting')
        setState('error')
      }
    }

    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  // ------------------------------------------------------------------
  // Start extraction: send message to main thread
  // ------------------------------------------------------------------
  function startExtraction() {
    setState('extracting')
    setError(null)
    setProgress({ current: 0, total: 0 })
    parent.postMessage(
      { pluginMessage: { type: 'extract-data' } },
      '*'
    )
  }

  // ------------------------------------------------------------------
  // Handle extraction results: fetch stored state + compute diff
  // ------------------------------------------------------------------
  async function handleExtractionComplete(
    rawComponents: ExtractedComponent[],
    rawTokens: ExtractedToken[]
  ) {
    const dedupedComponents = deduplicateComponents(rawComponents)
    setComponents(dedupedComponents)
    setTokens(rawTokens)

    if (!fileKey) {
      setError('File key not available')
      setRetryState('init')
      setState('error')
      return
    }

    // Transition to comparing state
    setState('comparing')

    try {
      // Fetch stored state from backend
      const stored = await getLibraryState(fileKey)
      setStoredState(stored)

      // Compute diff between extracted and stored components
      const diffResult = computeDiff(dedupedComponents, stored.components)
      setDiff(diffResult)

      setState('diff_ready')
    } catch (err: any) {
      // If backend returns 404 or similar, treat as first sync (empty stored)
      const emptyStored: LibraryState = {
        libraryKey: fileKey,
        components: [],
        tokens: [],
        updatedAt: '',
      }
      setStoredState(emptyStored)

      const diffResult = computeDiff(dedupedComponents, [])
      setDiff(diffResult)
      setState('diff_ready')
    }
  }

  // ------------------------------------------------------------------
  // Push: check session, then push or redirect to login
  // ------------------------------------------------------------------
  const handleRequestLogin = useCallback(async () => {
    const session = await getSession()
    if (session) {
      doPush(session.access_token)
    } else {
      setState('login')
    }
  }, [components, tokens, fileKey])

  async function handleLogin(email: string, password: string) {
    const session = await signIn(email, password)
    doPush(session.access_token)
  }

  async function doPush(accessToken: string) {
    if (!fileKey) return
    setState('pushing')
    setError(null)

    try {
      const libraryState: LibraryState = {
        libraryKey: fileKey,
        components,
        tokens,
        updatedAt: new Date().toISOString(),
      }

      const result = await updateLibraryState(libraryState, accessToken)
      setPushResult(result)
      setState('done')
    } catch (err: any) {
      setError(err?.message || 'Failed to push updates')
      setRetryState('diff_ready')
      setState('error')
    }
  }

  // ------------------------------------------------------------------
  // Reset / Retry
  // ------------------------------------------------------------------
  function handleReset() {
    setState('init')
    setError(null)
    setComponents([])
    setTokens([])
    setStoredState(null)
    setDiff(null)
    setPushResult(null)
    setProgress({ current: 0, total: 0 })
  }

  function handleRetry() {
    setError(null)
    if (retryState === 'extracting') {
      startExtraction()
    } else if (retryState === 'diff_ready') {
      setState('diff_ready')
    } else {
      handleReset()
    }
  }

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------
  return (
    <div className="flex flex-col h-screen bg-white text-neutral-900">
      {/* Header */}
      <div className="px-4 pt-3 pb-2 border-b border-neutral-200">
        <h1 className="text-sm font-semibold">DS Library Sync</h1>
        <p className="text-[10px] text-neutral-400">
          Extract, compare, and sync design system libraries
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Login panel (replaces other content when active) */}
        {state === 'login' ? (
          <LoginPanel
            onLogin={handleLogin}
            onCancel={() => setState('diff_ready')}
          />
        ) : (
          <div className="space-y-3">
            {/* Main sync panel */}
            <SyncPanel
              state={state}
              error={error}
              fileKey={fileKey}
              fileName={fileName}
              progress={progress}
              components={components}
              tokens={tokens}
              diff={diff}
              pushResult={pushResult}
              onExtract={startExtraction}
              onPush={() => doPush('')}
              onReset={handleReset}
              onRetry={handleRetry}
              onRequestLogin={handleRequestLogin}
            />

            {/* Diff detail view (shown when diff is ready) */}
            {state === 'diff_ready' && diff && (
              <DiffView diff={diff} />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
