// UI iframe (browser context). Talks to the main thread via the typed bridge
// (./bridge) and to the backend via the vendor-agnostic client (./backend).
// figma.* does NOT exist here.

import { useEffect, useState } from 'preact/hooks'
import { onMainEvent, request, sendEvent } from './bridge'
import { Button, ErrorBanner, Input, Spinner } from './components'
import { summarizeSelection, type SelectionSummary } from './backend/analyze'
import type { SelectionItem } from './types/messages'

const NOTES_KEY = 'starter:notes'

export default function App() {
  const [items, setItems] = useState<SelectionItem[]>([])
  const [pageName, setPageName] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [summary, setSummary] = useState<SelectionSummary | null>(null)
  const [summarySource, setSummarySource] = useState<'remote' | 'local' | null>(null)
  const [analyzing, setAnalyzing] = useState(false)

  // Subscribe to selection events from the main thread (fire-and-forget).
  useEffect(
    () =>
      onMainEvent((event) => {
        setItems(event.items)
        setPageName(event.pageName)
      }),
    [],
  )

  // Load persisted notes once on open (round-trip to clientStorage).
  useEffect(() => {
    request('get-storage', { key: NOTES_KEY })
      .then((value) => setNotes(value ?? ''))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  async function saveNotes(): Promise<void> {
    setError(null)
    try {
      await request('set-storage', { key: NOTES_KEY, value: notes })
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  async function analyze(): Promise<void> {
    setError(null)
    setAnalyzing(true)
    try {
      const { data, source } = await summarizeSelection(items)
      setSummary(data)
      setSummarySource(source)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setAnalyzing(false)
    }
  }

  if (loading) {
    return (
      <div className="p-3">
        <Spinner label="Loading…" />
      </div>
    )
  }

  return (
    <div className="p-3 space-y-3">
      <header>
        <h1 className="text-figma-base font-semibold">Starter Plugin (Backend)</h1>
        <p className="text-figma-sm text-figma-text-secondary">
          {pageName ? `Page: ${pageName}` : 'No page'} · {items.length} selected
        </p>
      </header>

      {error && <ErrorBanner message={error} />}

      <section className="space-y-1">
        <Button onClick={analyze} disabled={analyzing || items.length === 0}>
          {analyzing ? 'Analyzing…' : 'Analyze selection'}
        </Button>
        {summary && (
          <div className="text-figma-sm text-figma-text-secondary">
            <p>{summary.headline}</p>
            <p className="text-figma-xs">
              source: {summarySource}
              {summarySource === 'local' ? ' (backend unavailable — local fallback)' : ''}
            </p>
          </div>
        )}
      </section>

      <section className="space-y-1">
        {items.length === 0 ? (
          <p className="text-figma-sm text-figma-text-secondary">
            Select one or more layers on the canvas.
          </p>
        ) : (
          <ul className="space-y-1">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  className="w-full text-left px-2 py-1 rounded bg-figma-bg hover:bg-figma-bg-hover text-figma-sm"
                  onClick={() => sendEvent({ type: 'focus-node', nodeId: item.id })}
                >
                  {item.name}{' '}
                  <span className="text-figma-text-secondary">({item.type})</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-1">
        <label className="text-figma-sm text-figma-text-secondary" htmlFor="notes">
          Notes (persisted via clientStorage)
        </label>
        <Input id="notes" value={notes} onValue={setNotes} placeholder="Type a note…" />
        <Button variant="secondary" onClick={saveNotes}>
          Save
        </Button>
      </section>
    </div>
  )
}
