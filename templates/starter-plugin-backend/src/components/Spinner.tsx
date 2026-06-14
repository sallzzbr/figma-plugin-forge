import type { JSX } from 'preact'

export function Spinner({ label }: { label?: string }): JSX.Element {
  return (
    <div
      className="flex items-center gap-2 text-figma-sm text-figma-text-secondary"
      role="status"
    >
      <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-figma-border border-t-figma-blue" />
      {label}
    </div>
  )
}
