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
      <div className="auth-card">
        <h1>Regisztráció</h1>
        <p className="lead-small">Először válaszd ki, mire szeretnéd használni a fiókod.</p>

        <div className="role-grid">
          {ROLE_OPTIONS.map((option) => (
            <button
              type="button"
              key={option.role}
              className="role-card"
              onClick={() => selectRole(option.role)}
            >
              <h3>{option.title}</h3>
              <p>{option.text}</p>
            </button>
          ))}
        </div>

        <p className="auth-switch">
          Van már fiókod?{' '}
          <button type="button" className="link-button" onClick={onSwitchToLogin}>
            Jelentkezz be
          </button>
        </p>
      </div>
    )
  }

  return (
    <div className="auth-card">
      <h1>Regisztráció</h1>
      <p className="lead-small">
        {role === 'customer' ? 'Bérlőként regisztrálsz.' : 'Bérbeadóként regisztrálsz.'}{' '}
        <button type="button" className="link-button" onClick={() => setStep('role')}>
          Módosítom
        </button>
      </p>

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="first-name">Keresztnév</label>
          <input
            id="first-name"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="last-name">Vezetéknév</label>
          <input
            id="last-name"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="email">E-mail cím</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="phone-number">Telefonszám</label>
          <input
            id="phone-number"
            type="tel"
            required
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="password">Jelszó</label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="confirm-password">Jelszó megerősítése</label>
          <input
            id="confirm-password"
            type="password"
            required
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="search-button" disabled={submitting}>
          {submitting ? 'Regisztráció...' : 'Regisztráció'}
        </button>
      </form>

      <p className="auth-switch">
        Van már fiókod?{' '}
        <button type="button" className="link-button" onClick={onSwitchToLogin}>
          Jelentkezz be
        </button>
      </p>
    </div>
  )
}

export default RegisterForm
