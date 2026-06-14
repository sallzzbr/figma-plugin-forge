import type { JSX } from 'preact'

export function ErrorBanner({ message }: { message: string }): JSX.Element {
  return (
    <p
      role="alert"
      className="text-figma-sm text-red-400 bg-red-950/40 border border-red-900 rounded px-2 py-1"
    >
      {message}
    </p>
  )
}
