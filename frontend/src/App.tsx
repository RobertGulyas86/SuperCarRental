import { useState } from 'react'
import './App.css'
import CarDetailPage from './components/CarDetailPage'
import CarsSlider from './components/CarsSlider'
import ContactPage from './components/ContactPage'
import Dashboard from './components/Dashboard'
import FeatureCards from './components/FeatureCards'
import LoginForm from './components/LoginForm'
import RegisterForm from './components/RegisterForm'
import ServicesPage from './components/ServicesPage'
import { useAuth } from './useAuth'

type View = 'home' | 'login' | 'register' | 'dashboard' | 'services' | 'contact' | 'car-detail'

function App() {
  const [view, setView] = useState<View>('home')
  const [navOpen, setNavOpen] = useState(false)
  const [selectedCarId, setSelectedCarId] = useState<number | null>(null)
  const { user, token, signIn, signOut } = useAuth()

  function handleAuthSuccess(token: string) {
    signIn(token)
    setView('dashboard')
    setNavOpen(false)
  }

  function goTo(next: View) {
    setView(next)
    setNavOpen(false)
  }

  function openCar(carId: number) {
    setSelectedCarId(carId)
    goTo('car-detail')
  }

  return (
    <>
      <header className="navbar navbar-expand-md border-bottom sticky-top bg-body">
        <div className="container">
          <span
            className="navbar-brand fw-semibold"
            role="button"
            tabIndex={0}
            onClick={() => goTo('home')}
          >
            Super Car Rental
          </span>
          <button
            type="button"
            className="navbar-toggler"
            aria-label="Menü megnyitása"
            aria-expanded={navOpen}
            onClick={() => setNavOpen((open) => !open)}
          >
            <span className="navbar-toggler-icon" />
          </button>

          <div className={`navbar-collapse${navOpen ? '' : ' collapse'}`}>
            <nav className="navbar-nav ms-auto align-items-md-center gap-md-3 py-2 py-md-0">
              <a className="nav-link" href="#autok" onClick={() => setNavOpen(false)}>
                Autók
              </a>
              <a
                className="nav-link"
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  goTo('services')
                }}
              >
                Szolgáltatások
              </a>
              <a
                className="nav-link"
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  goTo('contact')
                }}
              >
                Kapcsolat
              </a>
              {user ? (
                <>
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm mt-2 mt-md-0"
                    onClick={() => goTo('dashboard')}
                  >
                    Dashboard
                  </button>
                  <span className="navbar-text fw-semibold mt-2 mt-md-0">Szia, {user.first_name}!</span>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm mt-2 mt-md-0"
                    onClick={() => {
                      signOut()
                      goTo('home')
                    }}
                  >
                    Kijelentkezés
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm mt-2 mt-md-0"
                    onClick={() => goTo('register')}
                  >
                    Regisztráció
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm mt-2 mt-md-0"
                    onClick={() => goTo('login')}
                  >
                    Bejelentkezés
                  </button>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-grow-1">
        {view === 'login' && (
          <section className="py-5">
            <div className="container">
              <LoginForm
                onSuccess={handleAuthSuccess}
                onSwitchToRegister={() => setView('register')}
              />
            </div>
          </section>
        )}

        {view === 'register' && (
          <section className="py-5">
            <div className="container">
              <RegisterForm
                onSuccess={handleAuthSuccess}
                onSwitchToLogin={() => setView('login')}
              />
            </div>
          </section>
        )}

        {view === 'dashboard' && user && token && (
          <section className="py-4 py-md-5">
            <Dashboard token={token} user={user} onSelectCar={openCar} />
          </section>
        )}

        {view === 'home' && (
          <>
            <section className="py-5">
              <div className="container">
                <div className="row align-items-center g-5">
                  <div className="col-12 col-lg-6 text-center text-lg-start">
                    <h1 className="display-4 fw-medium mb-3">Bérelj autót, ahogy Neked kényelmes</h1>
                    <p className="fs-5 text-body-secondary mb-4">
                      Foglalj online percek alatt, vedd át a kiválasztott helyszínen.
                    </p>

                    <form
                      className="row row-cols-1 row-cols-sm-2 g-3 align-items-end bg-body-secondary border rounded-3 p-3 p-md-4 text-start"
                      onSubmit={(e) => e.preventDefault()}
                    >
                      <div className="col">
                        <label className="form-label" htmlFor="location">
                          Átvételi hely
                        </label>
                        <input
                          id="location"
                          name="location"
                          className="form-control"
                          placeholder="pl. Budapest"
                        />
                      </div>
                      <div className="col">
                        <label className="form-label" htmlFor="start-date">
                          Átvétel
                        </label>
                        <input id="start-date" name="start-date" type="date" className="form-control" />
                      </div>
                      <div className="col">
                        <label className="form-label" htmlFor="end-date">
                          Visszahozatal
                        </label>
                        <input id="end-date" name="end-date" type="date" className="form-control" />
                      </div>
                      <div className="col">
                        <button type="submit" className="btn btn-primary w-100">
                          Autók keresése
                        </button>
                      </div>
                    </form>
                  </div>
                  <div className="col-12 col-lg-6">
                    <img
                      src="/images/hero-car.webp"
                      alt="Bérelhető autó"
                      className="hero-img img-fluid w-100 rounded-4 object-fit-cover"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section id="autok" className="py-5 border-top">
              <div className="container">
                <h2 className="mb-4">Autók</h2>
                <CarsSlider onSelectCar={openCar} />
              </div>
            </section>

            <section className="py-5 border-top">
              <div className="container">
                <h2 className="mb-4">Miért minket válassz?</h2>
                <FeatureCards />
              </div>
            </section>
          </>
        )}

        {view === 'services' && <ServicesPage />}
        {view === 'contact' && <ContactPage />}

        {view === 'car-detail' && selectedCarId !== null && (
          <CarDetailPage
            carId={selectedCarId}
            user={user}
            token={token}
            onBack={() => goTo(user ? 'dashboard' : 'home')}
            onRequireLogin={() => goTo('login')}
          />
        )}
      </main>

      <footer className="border-top py-4">
        <div className="container">
          <p className="small text-body-secondary mb-0">&copy; {new Date().getFullYear()} Super Car Rental</p>
        </div>
      </footer>
    </>
  )
}

export default App
