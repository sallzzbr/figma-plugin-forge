/**
 * Button.tsx
 * ----------------------------------------------------------------
 * Reusable Button component with variants, sizes, and states.
 *
 * Usage:
 * - <Button>text</Button>              - default secondary button
 * - <Button variant="primary">go</Button> - primary action button
 * - <Button loading>saving</Button>    - button with spinner
 * - <Button fullWidth>wide</Button>    - full-width button
 */

import { h, JSX } from 'preact'
import clsx from "clsx"

export interface ButtonProps {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "link"
  size?: "xs" | "sm" | "md" | "lg"
  fullWidth?: boolean
  loading?: boolean
  disabled?: boolean
  className?: string
  children?: any
  onClick?: () => void
  type?: "button" | "submit" | "reset"
  title?: string
  [key: string]: any  // Allow other HTML attributes
}

/**
 * Primary Button component.
 *
 * @param variant - Visual variant (primary, secondary, ghost, danger, link)
 * @param size - Button size (xs, sm, md, lg)
 * @param fullWidth - Whether the button spans full width
 * @param loading - Shows spinner and disables clicks
 * @param disabled - Whether the button is disabled
 */
export function Button({
  variant = "secondary",
  size = "md",
  fullWidth = false,
  loading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses = "rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"

  const variantClasses = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    ghost: "bg-transparent text-neutral-700 hover:bg-neutral-50",
    danger: "bg-red-600 text-white hover:bg-red-500",
    link: "bg-transparent !p-0 !rounded-none text-[10px] hover:underline",
  }

  const sizeClasses = {
    xs: "px-2 py-1 text-xs",
    sm: "px-2 py-1 text-sm",
    md: "px-3 py-2 text-sm",
    lg: "px-4 py-2 text-base",
  }

  const classes = clsx(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    fullWidth && "w-full",
    className
  )

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full"></span>
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  )
}
