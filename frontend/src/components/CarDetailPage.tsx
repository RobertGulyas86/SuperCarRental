import { useEffect, useState, type FormEvent } from 'react'
import { ApiError, createRental, getCar, listRentals, type Car, type Rental, type User } from '../api'
import CarImageGallery from './CarImageGallery'
import DateRangePicker from './DateRangePicker'

interface CarDetailPageProps {
  carId: number
  user: User | null
  token: string | null
  onBack: () => void
  onRequireLogin: () => void
  onSelectRental: (rental: Rental) => void
}

const FUEL_LABELS: Record<Car['fuel_type'], string> = {
  petrol: 'Benzin',
  diesel: 'Dízel',
  electric: 'Elektromos',
  hybrid: 'Hibrid',
  lpg: 'LPG',
}

const INSURANCE_LABELS: Record<Car['insurance_type'], string> = {
  basic: 'Alap',
  full: 'Teljes körű',
}

const RENTAL_STATUS_LABELS: Record<Rental['status'], string> = {
  reserved: 'Foglalva',
  ongoing: 'Folyamatban',
  completed: 'Lezárva',
  cancelled: 'Lemondva',
}

const RENTAL_STATUS_BADGE: Record<Rental['status'], string> = {
  reserved: 'text-bg-success',
  ongoing: 'text-bg-primary',
  completed: 'text-bg-secondary',
  cancelled: 'text-bg-danger',
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('hu-HU')
}

function nightsBetween(start: string, end: string): number {
  if (!start || !end) return 0
  const ms = new Date(end).getTime() - new Date(start).getTime()
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)))
}

function CarDetailPage({ carId, user, token, onBack, onRequireLogin, onSelectRental }: CarDetailPageProps) {
  const [car, setCar] = useState<Car | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [bookingError, setBookingError] = useState<string | null>(null)
  const [booked, setBooked] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [carRentals, setCarRentals] = useState<Rental[] | null>(null)
  const [carRentalsError, setCarRentalsError] = useState<string | null>(null)

  useEffect(() => {
    setCar(null)
    setError(null)
    getCar(carId)
      .then(setCar)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Váratlan hiba történt.'))
  }, [carId])

  const isOwnerOfCar = Boolean(car && user?.role === 'owner' && car.owner_id === user.id)

  useEffect(() => {
    if (!isOwnerOfCar || !token || !car) {
      setCarRentals(null)
      return
    }
    let cancelled = false
    setCarRentalsError(null)
    listRentals(token)
      .then((all) => {
        if (!cancelled) setCarRentals(all.filter((r) => r.car.id === car.id))
      })
      .catch((err) => {
        if (!cancelled) {
          setCarRentalsError(err instanceof ApiError ? err.message : 'Váratlan hiba történt.')
        }
      })
    return () => {
      cancelled = true
    }
  }, [isOwnerOfCar, token, car])

  const nights = nightsBetween(startDate, endDate)
  const total = car ? nights * car.daily_price : 0
  const canBook = user?.role === 'customer'

  async function handleBook(e: FormEvent) {
    e.preventDefault()
    if (!car) return
    if (!token) {
      onRequireLogin()
      return
    }
    setBookingError(null)
    setSubmitting(true)
    try {
      await createRental(token, { car_id: car.id, start_date: startDate, end_date: endDate })
      setBooked(true)
    } catch (err) {
      setBookingError(err instanceof ApiError ? err.message : 'Váratlan hiba történt.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container py-5">
      <button type="button" className="btn btn-link p-0 mb-4" onClick={onBack}>
        &larr; Vissza
      </button>

      {error && <p className="text-danger">{error}</p>}

      {!error && !car && <p className="text-body-secondary">Betöltés...</p>}

      {car && (
        <div className="row g-5">
          <div className="col-12 col-lg-6">
            <CarImageGallery images={car.images} altPrefix={`${car.brand} ${car.model}`} />

            <h1 className="h3 mb-2">
              {car.brand} {car.model}
            </h1>
            <p className="text-body-secondary mb-3">
              {car.year} · {FUEL_LABELS[car.fuel_type]} ·{' '}
              {car.transmission === 'automatic' ? 'Automata' : 'Manuális'} · {car.seats} fő
              {car.color && <> · {car.color}</>}
              {car.city && <> · {car.city}</>}
            </p>

            <ul className="list-unstyled d-flex flex-column gap-1 mb-4">
              <li>
                Napi díj: <strong>{car.daily_price.toLocaleString('hu-HU')} Ft</strong>
              </li>
              <li>Biztosítás: {INSURANCE_LABELS[car.insurance_type]}</li>
              <li>Autópálya-matrica: {car.has_highway_vignette ? 'Igen' : 'Nem'}</li>
              <li>Klíma: {car.has_air_conditioning ? 'Igen' : 'Nem'}</li>
            </ul>

            <div className="card">
              <div className="card-body">
                <h2 className="h6 mb-2">Bérbeadó elérhetősége</h2>
                <p className="mb-1">
                  {car.owner.first_name} {car.owner.last_name}
                </p>
                <p className="mb-1">
                  <a href={`tel:${car.owner.phone_number}`}>{car.owner.phone_number}</a>
                </p>
                <p className="mb-0">
                  <a href={`mailto:${car.owner.email}`}>{car.owner.email}</a>
                </p>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-6">
            {isOwnerOfCar ? (
              <div className="card">
                <div className="card-body">
                  <h2 className="h5 mb-3">Foglalások erre az autóra</h2>

                  {carRentalsError && <p className="text-danger small">{carRentalsError}</p>}

                  {!carRentalsError && carRentals === null && (
                    <p className="text-body-secondary small">Betöltés...</p>
                  )}

                  {carRentals && carRentals.length === 0 && (
                    <p className="text-body-secondary small mb-0">Erre az autóra még nincs foglalás.</p>
                  )}

                  {carRentals && carRentals.length > 0 && (
                    <div className="list-group">
                      {carRentals.map((rental) => (
                        <div
                          className="list-group-item list-group-item-action d-flex justify-content-between align-items-center flex-wrap gap-2"
                          key={rental.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => onSelectRental(rental)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              onSelectRental(rental)
                            }
                          }}
                        >
                          <span className="small">
                            {formatDate(rental.start_date)} – {formatDate(rental.end_date)}
                          </span>
                          <div className="d-flex align-items-center gap-3">
                            <span className={`badge rounded-pill ${RENTAL_STATUS_BADGE[rental.status]}`}>
                              {RENTAL_STATUS_LABELS[rental.status]}
                            </span>
                            <strong className="text-nowrap">
                              {rental.total_price.toLocaleString('hu-HU')} Ft
                            </strong>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="card">
                <div className="card-body">
                  <h2 className="h5 mb-3">Bérlés</h2>

                  {booked ? (
                    <div className="alert alert-success mb-0" role="alert">
                      Sikeres foglalás! A bérbeadó hamarosan felveszi Önnel a kapcsolatot.
                    </div>
                  ) : !token ? (
                    <>
                      <p className="text-body-secondary">A bérléshez be kell jelentkezned.</p>
                      <button type="button" className="btn btn-primary" onClick={onRequireLogin}>
                        Bejelentkezés
                      </button>
                    </>
                  ) : !canBook ? (
                    <p className="text-body-secondary mb-0">
                      Bérbeadóként nem foglalhatsz autót — csak bérlő fiókkal lehet bérlést indítani.
                    </p>
                  ) : (
                    <form className="d-flex flex-column gap-3" onSubmit={handleBook}>
                      <DateRangePicker
                        carId={car.id}
                        startDate={startDate}
                        endDate={endDate}
                        onChange={(start, end) => {
                          setStartDate(start)
                          setEndDate(end)
                        }}
                      />

                      {nights > 0 && (
                        <p className="mb-0 text-body-secondary">
                          {nights} nap × {car.daily_price.toLocaleString('hu-HU')} Ft ={' '}
                          <strong className="text-body">{total.toLocaleString('hu-HU')} Ft</strong>
                        </p>
                      )}

                      {bookingError && <p className="text-danger small mb-0">{bookingError}</p>}

                      <button
                        type="submit"
                        className="btn btn-primary align-self-center px-4"
                        disabled={submitting || nights <= 0}
                      >
                        {submitting ? 'Foglalás...' : 'Bérlés'}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default CarDetailPage
