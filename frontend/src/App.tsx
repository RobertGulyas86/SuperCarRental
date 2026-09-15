import { useEffect, useState, type FormEvent } from 'react'
import './App.css'
import { listRentals, type Rental } from './api'
import CarDetailPage from './components/CarDetailPage'
import CarsSlider from './components/CarsSlider'
import ContactPage from './components/ContactPage'
import Dashboard from './components/Dashboard'
import FeatureCards from './components/FeatureCards'
import LoginForm from './components/LoginForm'
import RegisterForm from './components/RegisterForm'
import RentalDetailPage from './components/RentalDetailPage'
import SearchResultsPage from './components/SearchResultsPage'
import ServicesPage from './components/ServicesPage'
import { useAuth } from './useAuth'

type View =
  | 'home'
  | 'login'
  | 'register'
  | 'dashboard'
  | 'services'
  | 'contact'
  | 'car-detail'
  | 'rental-detail'
  | 'search'

function App() {
  const [view, setView] = useState<View>('home')
  const [navOpen, setNavOpen] = useState(false)
  const [selectedCarId, setSelectedCarId] = useState<number | null>(null)
  const [selectedRental, setSelectedRental] = useState<Rental | null>(null)
  const [pendingAuthRedirect, setPendingAuthRedirect] = useState(false)
  const [searchLocation, setSearchLocation] = useState('')
  const [searchStartDate, setSearchStartDate] = useState('')
  const [searchEndDate, setSearchEndDate] = useState('')
  const [searchFormError, setSearchFormError] = useState<string | null>(null)
  const { user, token, signIn, signOut } = useAuth()

  function handleAuthSuccess(token: string) {
    signIn(token)
    setPendingAuthRedirect(true)
    setNavOpen(false)
  }

  useEffect(() => {
    if (!pendingAuthRedirect || !user || !token) return
    setPendingAuthRedirect(false)
    if (user.role === 'owner') {
      setView('dashboard')
      return
    }
    listRentals(token)
      .then((rentals) => setView(rentals.length > 0 ? 'dashboard' : 'home'))
      .catch(() => setView('dashboard'))
  }, [pendingAuthRedirect, user, token])

  function goTo(next: View) {
    setView(next)
    setNavOpen(false)
  }

  function openCar(carId: number) {
    setSelectedCarId(carId)
    goTo('car-detail')
  }

  function openRental(rental: Rental) {
    setSelectedRental(rental)
    goTo('rental-detail')
  }

  function handleSearchSubmit(e: FormEvent) {
    e.preventDefault()
    if (Boolean(searchStartDate) !== Boolean(searchEndDate)) {
      setSearchFormError('Add meg mindkét dátumot, vagy hagyd üresen mindkettőt.')
      return
    }
    if (searchStartDate && searchEndDate && searchEndDate <= searchStartDate) {
      setSearchFormError('A visszahozatal dátumának az átvétel dátuma után kell lennie.')
      return
    }
    setSearchFormError(null)
    goTo('search')
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
              <a
                className="nav-link"
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  goTo('home')
                }}
              >
                Home
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
            <Dashboard token={token} user={user} onSelectCar={openCar} onSelectRental={openRental} />
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
                      onSubmit={handleSearchSubmit}
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
                          value={searchLocation}
                          onChange={(e) => setSearchLocation(e.target.value)}
                        />
                      </div>
                      <div className="col">
                        <label className="form-label" htmlFor="start-date">
                          Átvétel
                        </label>
                        <input
                          id="start-date"
                          name="start-date"
                          type="date"
                          className="form-control"
                          value={searchStartDate}
                          onChange={(e) => setSearchStartDate(e.target.value)}
                        />
                      </div>
                      <div className="col">
                        <label className="form-label" htmlFor="end-date">
                          Visszahozatal
                        </label>
                        <input
                          id="end-date"
                          name="end-date"
                          type="date"
                          className="form-control"
                          min={searchStartDate || undefined}
                          value={searchEndDate}
                          onChange={(e) => setSearchEndDate(e.target.value)}
                        />
                      </div>
                      {searchFormError && (
                        <div className="col-12">
                          <p className="text-danger small mb-0">{searchFormError}</p>
                        </div>
                      )}
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

            <section className="py-5 border-top">
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
            onSelectRental={openRental}
          />
        )}

        {view === 'rental-detail' && selectedRental && token && user && (
          <RentalDetailPage
            rental={selectedRental}
            token={token}
            user={user}
            onBack={() => goTo('dashboard')}
            onDeleted={() => goTo('dashboard')}
          />
        )}

        {view === 'search' && (
          <SearchResultsPage
            city={searchLocation}
            startDate={searchStartDate}
            endDate={searchEndDate}
            onSelectCar={openCar}
            onBack={() => goTo('home')}
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
