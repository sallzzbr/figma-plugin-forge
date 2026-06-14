import type { ComponentChildren, JSX } from 'preact'

type ButtonProps = {
  children: ComponentChildren
  onClick?: () => void
  type?: 'button' | 'submit'
  variant?: 'primary' | 'secondary'
  disabled?: boolean
}

export function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled,
}: ButtonProps): JSX.Element {
  const base = 'px-3 py-1.5 rounded text-figma-sm font-medium disabled:opacity-50'
  const styles =
    variant === 'primary'
      ? 'bg-figma-blue text-white hover:opacity-90'
      : 'bg-figma-bg text-figma-text hover:bg-figma-bg-hover'
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${styles}`}>
      {children}
    </button>
  )
}
