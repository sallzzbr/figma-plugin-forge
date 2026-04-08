/**
 * Tabs.tsx
 * ----------------------------------------------------------------
 * Tab navigation component with optional count badges.
 *
 * Usage:
 * - <Tabs tabs={[...]} activeId="tab1" onChange={(id) => ...} />
 */

import { h } from 'preact'
import clsx from 'clsx'

export interface TabDef {
  id: string
  label: string
  count?: number
  disabled?: boolean
}

export interface TabsProps {
  tabs: TabDef[]
  activeId: string
  onChange: (id: string) => void
  className?: string
}

/**
 * Tab navigation with underline indicator and optional count badges.
 */
export function Tabs({ tabs, activeId, onChange, className }: TabsProps) {
  return (
    <div className={clsx("flex items-center gap-2 border-b border-neutral-200 mb-2", className)}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeId
        const isDisabled = !!tab.disabled

        return (
          <button
            key={tab.id}
            onClick={() => !isDisabled && onChange(tab.id)}
            disabled={isDisabled}
            className={clsx(
              "relative rounded-t-md px-3 py-2 text-sm transition-colors",
              isDisabled
                ? "text-gray-400 cursor-not-allowed"
                : "hover:bg-neutral-50",
              isActive ? "bg-white text-neutral-900" : "text-neutral-600"
            )}
          >
            <span>{tab.label}</span>

            {typeof tab.count === "number" && (
              <span
                className={clsx(
                  "ml-2 inline-flex min-w-[18px] justify-center rounded-full px-2 text-[11px] font-semibold",
                  isDisabled
                    ? "bg-neutral-200 text-neutral-400"
                    : isActive
                    ? "bg-indigo-500 text-white"
                    : "bg-neutral-200 text-neutral-700"
                )}
              >
                {tab.count}
              </span>
            )}

            {isActive && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 bg-indigo-500" />
            )}
          </button>
        )
      })}
    </div>
  )
}
