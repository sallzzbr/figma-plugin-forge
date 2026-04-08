/**
 * Input.tsx
 * ----------------------------------------------------------------
 * Standardized form field — renders <input> or <textarea>.
 *
 * Usage:
 * - <Input placeholder="name" />                  - text input
 * - <Input type="password" />                     - password input
 * - <Input multiline placeholder="long text" />   - textarea
 * - <Input variant="error" />                     - red error border
 * - <Input value={val} onInput={handler} />       - controlled
 */

import { h } from 'preact'
import clsx from "clsx"

export interface InputProps {
  /** Visual state of the field */
  variant?: "default" | "error"
  /** Render as textarea (default: false) */
  multiline?: boolean
  /** Input type (text, email, password, etc.) — ignored when multiline */
  type?: string
  placeholder?: string
  value?: string
  onChange?: (e: any) => void
  onInput?: (e: any) => void
  disabled?: boolean
  required?: boolean
  className?: string
}

/**
 * Standardized form field.
 * Renders `<input>` by default; with `multiline` renders `<textarea>`.
 */
export function Input({
  variant = "default",
  multiline = false,
  type = "text",
  className,
  ...props
}: InputProps) {
  const baseClasses = "w-full rounded-md bg-white border text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"

  const variantClasses = {
    default: "border-neutral-300",
    error: "border-red-300 focus:ring-red-300",
  }

  const classes = clsx(
    baseClasses,
    variantClasses[variant],
    multiline ? "p-2 h-16 resize-none" : "px-3 py-2",
    className
  )

  if (multiline) {
    return <textarea className={classes} {...props} />
  }

  return <input type={type} className={classes} {...props} />
}
