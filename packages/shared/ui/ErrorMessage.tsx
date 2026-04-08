/**
 * ErrorMessage.tsx
 * ----------------------------------------------------------------
 * Standardized error display with optional dismiss button.
 *
 * Usage:
 * - <ErrorMessage message="Something failed" />
 * - <ErrorMessage message="Error" onDismiss={handler} />
 * - <ErrorMessage message="Error" dismissible={false} />
 */

import { h, JSX } from 'preact'
import clsx from "clsx"
import { Card } from "./Card"

export interface ErrorMessageProps {
  /** Error message text */
  message: string
  /** Whether to show a close button */
  dismissible?: boolean
  /** Callback when the user dismisses the error */
  onDismiss?: () => void
  /** Additional CSS classes */
  className?: string
}

/**
 * Error display using a red Card with optional dismiss button.
 */
export function ErrorMessage({
  message,
  dismissible = true,
  onDismiss,
  className,
}: ErrorMessageProps) {
  return (
    <Card variant="error" className={clsx("text-sm", className)}>
      <div className="flex items-center justify-between">
        <span>{message}</span>
        {dismissible && onDismiss && (
          <button
            className="text-red-600 hover:text-red-800 ml-2 text-lg leading-none"
            onClick={onDismiss}
            aria-label="Dismiss error"
          >
            &#x2715;
          </button>
        )}
      </div>
    </Card>
  )
}
