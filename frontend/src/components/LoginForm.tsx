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
    <div className="card mx-auto" style={{ maxWidth: 440 }}>
      <div className="card-body p-4">
        <h1 className="h3 mb-4">Bejelentkezés</h1>

        <form className="d-flex flex-column gap-3" onSubmit={handleSubmit}>
          <div>
            <label className="form-label" htmlFor="login-email">
              E-mail cím
            </label>
            <input
              id="login-email"
              type="email"
              className="form-control"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="form-label" htmlFor="login-password">
              Jelszó
            </label>
            <input
              id="login-password"
              type="password"
              className="form-control"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-danger small mb-0">{error}</p>}

          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Bejelentkezés...' : 'Bejelentkezés'}
          </button>
        </form>

        <p className="text-center small mt-4 mb-0">
          Nincs még fiókod?{' '}
          <button type="button" className="btn btn-link p-0 align-baseline" onClick={onSwitchToRegister}>
            Regisztrálj
          </button>
        </p>
      </div>
    </div>
  )
}

export default LoginForm
