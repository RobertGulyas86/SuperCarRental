import { useEffect, useState } from 'react'
import { ApiError, imageUrl, listCars, listMyCars, type Car } from '../api'
import CarEditorModal from './CarEditorModal'

interface CarsSectionProps {
  token: string | null
  canManage: boolean
}

const STATUS_LABELS: Record<Car['status'], string> = {
  available: 'Elérhető',
  rented: 'Bérelve',
  maintenance: 'Karbantartás alatt',
}

const FUEL_LABELS: Record<Car['fuel_type'], string> = {
  petrol: 'Benzin',
  diesel: 'Dízel',
  electric: 'Elektromos',
  hybrid: 'Hibrid',
  lpg: 'LPG',
}

function CarsSection({ token, canManage }: CarsSectionProps) {
  const [cars, setCars] = useState<Car[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [editorCar, setEditorCar] = useState<Car | null | undefined>(undefined)

  function reload() {
    const fetchCars = canManage && token ? listMyCars(token) : listCars()
    fetchCars.then(setCars).catch((err) => {
      setError(err instanceof ApiError ? err.message : 'Váratlan hiba történt.')
    })
  }

  useEffect(reload, [canManage, token])

  function handleSaved(car: Car) {
    setCars((prev) => {
      if (!prev) return prev
      const exists = prev.some((c) => c.id === car.id)
      return exists ? prev.map((c) => (c.id === car.id ? car : c)) : [...prev, car]
    })
  }

  return (
    <section className="dashboard-section">
      <div className="section-header">
        <h2>{canManage ? 'Kocsijaim' : 'Kocsik'}</h2>
        {canManage && token && (
          <button
            type="button"
            className="login-button ghost"
            onClick={() => setEditorCar(null)}
          >
            + Új kocsi hozzáadása
          </button>
        )}
      </div>

      {error && <p className="form-error">{error}</p>}

      {!error && cars === null && <p className="lead-small">Betöltés...</p>}

      {cars && cars.length === 0 && <p className="lead-small">Még nincs felvett kocsi.</p>}

      {cars && cars.length > 0 && (
        <div className="car-ticket-grid">
          {cars.map((car) => {
            const primaryImage = car.images.find((img) => img.is_primary) ?? car.images[0]
            return (
              <div className="car-ticket" key={car.id}>
                <div className="car-ticket-image">
                  {primaryImage ? (
                    <img src={imageUrl(primaryImage.image_path)} alt={`${car.brand} ${car.model}`} />
                  ) : (
                    <div className="car-ticket-image-placeholder">Nincs kép</div>
                  )}
                  <span className={`status-badge status-${car.status}`}>
                    {STATUS_LABELS[car.status]}
                  </span>
                </div>
                <div className="car-ticket-body">
                  <h3>
                    {car.brand} {car.model}
                  </h3>
                  <p className="car-ticket-meta">
                    {car.year} · {FUEL_LABELS[car.fuel_type]} ·{' '}
                    {car.transmission === 'automatic' ? 'Automata' : 'Manuális'} · {car.seats} fő
                  </p>
                  <p className="car-ticket-price">
                    {car.daily_price.toLocaleString('hu-HU')} Ft / nap
                  </p>
                  {canManage && token && (
                    <button
                      type="button"
                      className="link-button"
                      onClick={() => setEditorCar(car)}
                    >
                      Szerkesztés
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {editorCar !== undefined && token && (
        <CarEditorModal
          token={token}
          car={editorCar}
          onClose={() => {
            setEditorCar(undefined)
            reload()
          }}
          onSaved={handleSaved}
        />
      )}
    </section>
  )
}

export default CarsSection
