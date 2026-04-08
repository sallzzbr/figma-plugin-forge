/**
 * ContentInfo.tsx
 * ----------------------------------------------------------------
 * Informational / empty-state panel (blue tinted).
 *
 * Usage:
 * - <ContentInfo>Select a frame to begin.</ContentInfo>
 */

import { h, JSX } from 'preact'
import clsx from "clsx"

export interface ContentInfoProps {
  children?: any
  className?: string
}

export function ContentInfo({ children, className }: ContentInfoProps) {
  return (
    <div
      className={clsx(
        "rounded-lg border border-blue-300 bg-blue-50 px-4 py-3 text-sm text-blue-700",
        className
      )}
    >
      {children}
    </div>
  )
}
