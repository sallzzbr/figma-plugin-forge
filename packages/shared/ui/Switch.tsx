/**
 * Switch.tsx
 * ----------------------------------------------------------------
 * Toggle switch component with optional label and description.
 *
 * Usage:
 * - <Switch checked={true} onChange={(v) => ...} label="Rule" />
 * - <Switch checked={false} label="Name" description="Details" />
 */

import { h } from 'preact'
import clsx from 'clsx'

export interface SwitchProps {
  /** Current switch state */
  checked: boolean
  /** Callback when the state changes */
  onChange?: (checked: boolean) => void
  /** Whether the switch is disabled */
  disabled?: boolean
  /** Primary label displayed beside the switch */
  label?: string
  /** Secondary description below the label */
  description?: string
  /** Additional CSS classes on the container */
  className?: string
}

/**
 * Toggle switch with label and description.
 */
export function Switch({
  checked,
  onChange,
  disabled = false,
  label,
  description,
  className,
}: SwitchProps) {
  function handleClick() {
    if (!disabled && onChange) {
      onChange(!checked)
    }
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={handleClick}
      className={clsx(
        "flex items-start gap-3 w-full text-left",
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
        className
      )}
    >
      {/* Track + Knob */}
      <span
        className={clsx(
          "relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors duration-200",
          checked ? "bg-indigo-500" : "bg-neutral-300"
        )}
      >
        <span
          className={clsx(
            "inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform duration-200 mt-0.5",
            checked ? "translate-x-4 ml-0.5" : "translate-x-0 ml-0.5"
          )}
        />
      </span>

      {/* Label + Description */}
      {(label || description) && (
        <span className="flex flex-col min-w-0">
          {label && (
            <span className="text-sm font-medium text-neutral-900">{label}</span>
          )}
          {description && (
            <span className="text-xs text-neutral-500 mt-0.5">{description}</span>
          )}
        </span>
      )}
    </button>
  )
}
