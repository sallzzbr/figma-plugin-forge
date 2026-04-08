/**
 * components/LoginPanel.tsx
 * ---------------------------------------------------------------
 * Email/password login form for admin operations (push updates).
 * Uses shared Input and Button components.
 */

import { h } from 'preact'
import { useState } from 'preact/hooks'
import {
  Button,
  Input,
  Card,
  ErrorMessage,
} from '@figma-forge/shared/ui'

interface LoginPanelProps {
  /** Called with email + password when the user submits. */
  onLogin: (email: string, password: string) => Promise<void>
  /** Called when the user cancels the login. */
  onCancel: () => void
}

export function LoginPanel({ onLogin, onCancel }: LoginPanelProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: Event) {
    e.preventDefault()
    if (!email.trim() || !password) return

    setLoading(true)
    setError(null)

    try {
      await onLogin(email.trim(), password)
    } catch (err: any) {
      setError(err?.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card padding="md">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="text-sm font-semibold text-neutral-800">
          Admin Login
        </div>
        <p className="text-xs text-neutral-500">
          Sign in to push library updates to the backend.
        </p>

        {error && (
          <ErrorMessage message={error} dismissible={false} />
        )}

        <div className="space-y-2">
          <label className="block text-xs font-medium text-neutral-600">
            Email
          </label>
          <Input
            value={email}
            onInput={(e: any) => setEmail(e.target.value)}
            placeholder="admin@example.com"
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-medium text-neutral-600">
            Password
          </label>
          <Input
            value={password}
            onInput={(e: any) => setPassword(e.target.value)}
            placeholder="Password"
            disabled={loading}
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant="primary"
            size="md"
            fullWidth
            disabled={loading || !email.trim() || !password}
          >
            {loading ? 'Signing in...' : 'Sign In & Push'}
          </Button>
          <Button
            variant="ghost"
            size="md"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  )
}
