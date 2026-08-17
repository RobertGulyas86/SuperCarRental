import { useState } from 'react'
import './App.css'
import Dashboard from './components/Dashboard'
import LoginForm from './components/LoginForm'
import RegisterForm from './components/RegisterForm'
import { useAuth } from './useAuth'

type View = 'home' | 'login' | 'register' | 'dashboard'

const features = [
  {
    title: 'Széles választék',
    text: 'Kompakt városi autóktól a prémium terepjárókig mindenre találsz megfelelőt.',
    image: '/images/feature-selection.webp',
  },
  {
    title: 'Egyszerű foglalás',
    text: 'Válaszd ki az időpontot és az átvételi helyet, a többit intézzük.',
    image: '/images/feature-booking.webp',
  },
  {
    title: 'Teljes körű biztosítás',
    text: 'Minden bérléshez alap- vagy prémium biztosítási csomagot választhatsz.',
    image: '/images/feature-insurance.webp',
  },
]

function App() {
  const [view, setView] = useState<View>('home')
  const { user, token, signIn, signOut } = useAuth()

  function handleAuthSuccess(token: string) {
    signIn(token)
    setView('dashboard')
  }

  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <span className="logo" onClick={() => setView('home')} role="button" tabIndex={0}>
            Super Car Rental
          </span>
          <nav>
            <a href="#autok">Autók</a>
            <a href="#szolgaltatasok">Szolgáltatások</a>
            <a href="#kapcsolat">Kapcsolat</a>
            {user ? (
              <>
                <button
                  type="button"
                  className="login-button ghost"
                  onClick={() => setView('dashboard')}
                >
                  Dashboard
                </button>
                <span className="user-greeting">Szia, {user.first_name}!</span>
                <button
                  type="button"
                  className="login-button"
                  onClick={() => {
                    signOut()
                    setView('home')
                  }}
                >
                  Kijelentkezés
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="login-button ghost"
                  onClick={() => setView('register')}
                >
                  Regisztráció
                </button>
                <button type="button" className="login-button" onClick={() => setView('login')}>
                  Bejelentkezés
                </button>
              </>
            )}
          </nav>
        </div>
      </header>

      <main>
        {view === 'login' && (
          <section className="auth-section">
            <div className="container">
              <LoginForm
                onSuccess={handleAuthSuccess}
                onSwitchToRegister={() => setView('register')}
              />
            </div>
          </section>
        )}

        {view === 'register' && (
          <section className="auth-section">
            <div className="container">
              <RegisterForm
                onSuccess={handleAuthSuccess}
                onSwitchToLogin={() => setView('login')}
              />
            </div>
          </section>
        )}

        {view === 'dashboard' && user && token && (
          <section className="dashboard-page">
            <Dashboard token={token} user={user} />
          </section>
        )}

        {view === 'home' && (
          <>
            <section className="hero">
              <div className="container hero-inner">
                <div className="hero-content">
                  <h1>Bérelj autót, ahogy Neked kényelmes</h1>
                  <p className="lead">
                    Foglalj online percek alatt, vedd át a kiválasztott helyszínen.
                  </p>

                  <form className="search-card" onSubmit={(e) => e.preventDefault()}>
                    <div className="field">
                      <label htmlFor="location">Átvételi hely</label>
                      <input id="location" name="location" placeholder="pl. Budapest" />
                    </div>
                    <div className="field">
                      <label htmlFor="start-date">Átvétel</label>
                      <input id="start-date" name="start-date" type="date" />
                    </div>
                    <div className="field">
                      <label htmlFor="end-date">Visszahozatal</label>
                      <input id="end-date" name="end-date" type="date" />
                    </div>
                    <button type="submit" className="search-button">
                      Autók keresése
                    </button>
                  </form>
                </div>
                <div className="hero-media">
                  <img src="/images/hero-car.webp" alt="Bérelhető autó" width={520} height={400} />
                </div>
              </div>
            </section>

            <section id="szolgaltatasok" className="features">
              <div className="container">
                <h2>Miért minket válassz?</h2>
                <div className="feature-grid">
                  {features.map((f) => (
                    <div className="feature-card" key={f.title}>
                      <img className="feature-card-image" src={f.image} alt="" width={330} height={200} />
                      <div className="feature-card-body">
                        <h3>{f.title}</h3>
                        <p>{f.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      <footer id="kapcsolat" className="site-footer">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} Super Car Rental</p>
        </div>
      </footer>
    </>
  )
}

export default App
