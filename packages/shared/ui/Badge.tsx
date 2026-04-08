/**
 * Badge.tsx
 * ----------------------------------------------------------------
 * Badge and ScoreDisplay components — semantic status indicators.
 *
 * Usage:
 * - <Badge variant="success">Pass</Badge>   - green success badge
 * - <Badge variant="error">Fail</Badge>     - red error badge
 * - <ScoreDisplay>8/10</ScoreDisplay>        - highlighted score
 * - <ScoreDisplay size="2xl">9/10</ScoreDisplay>
 */

import { h, JSX } from 'preact'
import clsx from "clsx"

export interface BadgeProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  /** Semantic color variant */
  variant?: "success" | "error" | "warning" | "info" | "neutral" | "score"
  /** Badge size */
  size?: "sm" | "md"
}

/**
 * Semantic Badge for status indicators, tags, and counts.
 */
export function Badge({
  variant = "neutral",
  size = "md",
  className,
  children,
  ...props
}: BadgeProps) {
  const baseClasses = "inline-flex items-center rounded font-semibold"

  const variantClasses = {
    success: "bg-green-100 text-green-700",
    error: "bg-red-100 text-red-700",
    warning: "bg-yellow-100 text-yellow-700",
    info: "bg-blue-100 text-blue-700",
    neutral: "bg-neutral-100 text-neutral-700",
    score: "bg-indigo-100 text-indigo-600 font-bold",
  }

  const sizeClasses = {
    sm: "px-1.5 py-0.5 text-xs",
    md: "px-2 py-0.5 text-xs",
  }

  const classes = clsx(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className
  )

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  )
}

export interface ScoreDisplayProps extends JSX.HTMLAttributes<HTMLDivElement> {
  /** Font size of the score */
  size?: "lg" | "xl" | "2xl"
}

/**
 * Highlighted score / KPI display.
 */
export function ScoreDisplay({
  size = "xl",
  className,
  children,
  ...props
}: ScoreDisplayProps) {
  const sizeClasses = {
    lg: "text-lg",
    xl: "text-2xl",
    "2xl": "text-3xl",
  }

  const classes = clsx(
    "font-bold text-indigo-600",
    sizeClasses[size],
    className
  )

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  )
}
