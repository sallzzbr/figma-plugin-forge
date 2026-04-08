/**
 * Collapsible.tsx
 * ----------------------------------------------------------------
 * Expandable / collapsible section with chevron toggle.
 *
 * Usage:
 * - <Collapsible title="Details">...content...</Collapsible>
 * - <Collapsible title="Section" defaultOpen>...content...</Collapsible>
 */

import { h, ComponentChildren } from 'preact'
import { useState } from 'preact/hooks'

export interface CollapsibleProps {
  title: string | ComponentChildren
  defaultOpen?: boolean
  children: ComponentChildren
  className?: string
}

export function Collapsible({ title, defaultOpen = false, children, className }: CollapsibleProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 w-full text-left cursor-pointer py-1"
      >
        <span className="text-neutral-400 text-[10px] shrink-0">{open ? '\u25BC' : '\u25B6'}</span>
        <div className="flex-1 text-xs font-semibold text-neutral-700">
          {title}
        </div>
      </button>
      {open && <div className="mt-1">{children}</div>}
    </div>
  )
}
