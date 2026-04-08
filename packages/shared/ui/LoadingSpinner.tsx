/**
 * LoadingSpinner.tsx
 * ----------------------------------------------------------------
 * Standardized loading spinner in three sizes.
 *
 * Usage:
 * - <LoadingSpinner />           - medium (default)
 * - <LoadingSpinner size="sm" /> - small, e.g. inside buttons
 * - <LoadingSpinner size="lg" /> - large, e.g. for overlays
 */

import { h, JSX } from 'preact'
import clsx from "clsx"

export interface LoadingSpinnerProps {
  /** Spinner size */
  size?: "sm" | "md" | "lg"
  /** Additional CSS classes */
  className?: string
}

/**
 * Spinning loading indicator.
 *
 * @param size - sm (16px), md (20px), lg (32px)
 */
export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4 border",
    md: "w-5 h-5 border-2",
    lg: "w-8 h-8 border-2",
  }

  const classes = clsx(
    "animate-spin rounded-full border-current border-t-transparent",
    sizeClasses[size],
    className
  )

  return <div className={classes} aria-label="Loading..." />
}
