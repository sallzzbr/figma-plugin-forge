/**
 * SearchInput.tsx
 * ----------------------------------------------------------------
 * Search field with magnifying-glass icon.
 *
 * Usage:
 * - <SearchInput value={q} onChange={setQ} placeholder="Search..." />
 */

import { h, JSX } from 'preact'
import clsx from 'clsx'

export interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function SearchInput({ value, onChange, placeholder, className }: SearchInputProps) {
  return (
    <div className={clsx('relative', className)}>
      <svg
        className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="7" cy="7" r="4.5" />
        <line x1="10.5" y1="10.5" x2="14" y2="14" />
      </svg>
      <input
        type="text"
        value={value}
        onInput={(e: JSX.TargetedEvent<HTMLInputElement>) => onChange(e.currentTarget.value)}
        placeholder={placeholder}
        className="w-full pl-8 pr-3 py-1.5 rounded-md border border-neutral-200 bg-white text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-300 focus:border-neutral-400"
      />
    </div>
  )
}
