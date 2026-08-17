import { useState, type FormEvent } from 'react'
import { ApiError, login } from '../api'

interface LoginFormProps {
  onSuccess: (token: string) => void
  onSwitchToRegister: () => void
}

function LoginForm({ onSuccess, onSwitchToRegister }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const { access_token } = await login({ email, password })
      onSuccess(access_token)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Váratlan hiba történt.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-card">
      <h1>Bejelentkezés</h1>

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="login-email">E-mail cím</label>
          <input
            id="login-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="login-password">Jelszó</label>
          <input
            id="login-password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="search-button" disabled={submitting}>
          {submitting ? 'Bejelentkezés...' : 'Bejelentkezés'}
        </button>
      </form>

      <p className="auth-switch">
        Nincs még fiókod?{' '}
        <button type="button" className="link-button" onClick={onSwitchToRegister}>
          Regisztrálj
        </button>
      </p>
    </div>
  )
}

export default LoginForm
