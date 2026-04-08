/**
 * Card.tsx
 * ----------------------------------------------------------------
 * Reusable Card component — visual container with variants.
 *
 * Usage:
 * - <Card>content</Card>                          - default white card
 * - <Card variant="error">error</Card>            - red error card
 * - <Card variant="nested" padding="sm">item</Card> - nested sub-card
 * - <Card shadow>with shadow</Card>               - card with shadow
 */

import { h, JSX } from 'preact'
import clsx from "clsx"

export interface CardProps extends JSX.HTMLAttributes<HTMLDivElement> {
  /** Visual variant */
  variant?: "default" | "error" | "success" | "nested"
  /** Inner padding size */
  padding?: "sm" | "md" | "lg"
  /** Whether to show a box shadow */
  shadow?: boolean
}

/**
 * Card container component.
 *
 * @param variant - Visual style (default, error, success, nested)
 * @param padding - Inner padding (sm, md, lg)
 * @param shadow - Whether to apply shadow
 */
export function Card({
  variant = "default",
  padding = "md",
  shadow = false,
  className,
  children,
  ...props
}: CardProps) {
  const baseClasses = "forge-card rounded-lg border"

  const variantClasses = {
    default: "bg-white text-neutral-900 border-neutral-200",
    error: "bg-red-50 text-red-800 border-red-300",
    success: "bg-green-50 text-green-800 border-green-300",
    nested: "bg-neutral-50 text-neutral-900 border-neutral-200",
  }

  const paddingClasses = {
    sm: "p-2",
    md: "p-3",
    lg: "p-4",
  }

  const classes = clsx(
    baseClasses,
    variantClasses[variant],
    paddingClasses[padding],
    shadow && "shadow",
    className
  )

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  )
}
