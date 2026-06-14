import type { JSX } from 'preact'

type InputProps = {
  value: string
  onValue?: (value: string) => void
  placeholder?: string
  id?: string
  type?: string
}

export function Input({ value, onValue, placeholder, id, type = 'text' }: InputProps): JSX.Element {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onInput={(event) => onValue?.((event.currentTarget as HTMLInputElement).value)}
      placeholder={placeholder}
      className="w-full px-2 py-1 rounded bg-figma-bg border border-figma-border text-figma-sm text-figma-text placeholder:text-figma-text-secondary focus:outline-none focus:border-figma-blue"
    />
  )
}
