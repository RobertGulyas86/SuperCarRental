import { useState, type FormEvent } from 'react'
import { ApiError, login, register, type Role } from '../api'

interface RegisterFormProps {
  onSuccess: (token: string) => void
  onSwitchToLogin: () => void
}

const ROLE_OPTIONS: { role: Role; title: string; text: string }[] = [
  {
    role: 'customer',
    title: 'Bérelni szeretnék',
    text: 'Autót keresek, amit kibérelhetek egy utazáshoz vagy a mindennapokra.',
  },
  {
    role: 'owner',
    title: 'Bérbe szeretnék adni',
    text: 'A saját autómat szeretném feltölteni és bérbe adni.',
  },
]

function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const [step, setStep] = useState<'role' | 'details'>('role')
  const [role, setRole] = useState<Role | null>(null)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function selectRole(selected: Role) {
    setRole(selected)
    setError(null)
    setStep('details')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!role) return

    if (password !== confirmPassword) {
      setError('A két jelszó nem egyezik.')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      await register({
        first_name: firstName,
        last_name: lastName,
        email,
        phone_number: phoneNumber,
        password,
        role,
      })
      const { access_token } = await login({ email, password })
      onSuccess(access_token)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Váratlan hiba történt.')
    } finally {
      setSubmitting(false)
    }
  }

  if (step === 'role') {
    return (
      <div className="card mx-auto" style={{ maxWidth: 440 }}>
        <div className="card-body p-4">
          <h1 className="h3 mb-2">Regisztráció</h1>
          <p className="text-body-secondary small mb-4">
            Először válaszd ki, mire szeretnéd használni a fiókod.
          </p>

          <div className="d-flex flex-column gap-3">
            {ROLE_OPTIONS.map((option) => (
              <button
                type="button"
                key={option.role}
                className="btn btn-outline-secondary text-start p-3"
                onClick={() => selectRole(option.role)}
              >
                <span className="d-block fw-semibold mb-1">{option.title}</span>
                <span className="d-block small text-body-secondary">{option.text}</span>
              </button>
            ))}
          </div>

          <p className="text-center small mt-4 mb-0">
            Van már fiókod?{' '}
            <button type="button" className="btn btn-link p-0 align-baseline" onClick={onSwitchToLogin}>
              Jelentkezz be
            </button>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="card mx-auto" style={{ maxWidth: 440 }}>
      <div className="card-body p-4">
        <h1 className="h3 mb-2">Regisztráció</h1>
        <p className="text-body-secondary small mb-4">
          {role === 'customer' ? 'Bérlőként regisztrálsz.' : 'Bérbeadóként regisztrálsz.'}{' '}
          <button type="button" className="btn btn-link p-0 align-baseline" onClick={() => setStep('role')}>
            Módosítom
          </button>
        </p>

        <form className="d-flex flex-column gap-3" onSubmit={handleSubmit}>
          <div>
            <label className="form-label" htmlFor="first-name">
              Keresztnév
            </label>
            <input
              id="first-name"
              className="form-control"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div>
            <label className="form-label" htmlFor="last-name">
              Vezetéknév
            </label>
            <input
              id="last-name"
              className="form-control"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <div>
            <label className="form-label" htmlFor="email">
              E-mail cím
            </label>
            <input
              id="email"
              type="email"
              className="form-control"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="form-label" htmlFor="phone-number">
              Telefonszám
            </label>
            <input
              id="phone-number"
              type="tel"
              className="form-control"
              required
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
          <div>
            <label className="form-label" htmlFor="password">
              Jelszó
            </label>
            <input
              id="password"
              type="password"
              className="form-control"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="form-label" htmlFor="confirm-password">
              Jelszó megerősítése
            </label>
            <input
              id="confirm-password"
              type="password"
              className="form-control"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-danger small mb-0">{error}</p>}

          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Regisztráció...' : 'Regisztráció'}
          </button>
        </form>

        <p className="text-center small mt-4 mb-0">
          Van már fiókod?{' '}
          <button type="button" className="btn btn-link p-0 align-baseline" onClick={onSwitchToLogin}>
            Jelentkezz be
          </button>
        </p>
      </div>
    </div>
  )
}

export default RegisterForm
