import { useEffect, useState } from 'react'
import { ApiError, deleteCar, imageUrl, listCars, listMyCars, type Car } from '../api'
import CarEditorModal from './CarEditorModal'

interface CarsSectionProps {
  token: string | null
  canManage: boolean
  onSelectCar: (carId: number) => void
}

const STATUS_LABELS: Record<Car['status'], string> = {
  available: 'Elérhető',
  rented: 'Bérelve',
  maintenance: 'Karbantartás alatt',
}

const STATUS_BADGE: Record<Car['status'], string> = {
  available: 'text-bg-success',
  rented: 'text-bg-primary',
  maintenance: 'text-bg-danger',
}

const FUEL_LABELS: Record<Car['fuel_type'], string> = {
  petrol: 'Benzin',
  diesel: 'Dízel',
  electric: 'Elektromos',
  hybrid: 'Hibrid',
  lpg: 'LPG',
}

function CarsSection({ token, canManage, onSelectCar }: CarsSectionProps) {
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

  async function handleDelete(car: Car) {
    if (!token) return
    if (!window.confirm(`Biztosan törlöd ezt a kocsit: ${car.brand} ${car.model}? A képei is törlődnek.`)) {
      return
    }
    setError(null)
    try {
      await deleteCar(token, car.id)
      setCars((prev) => prev?.filter((c) => c.id !== car.id) ?? prev)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Váratlan hiba történt.')
    }
  }

  return (
    <section>
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
        <h2 className="h4 mb-0">{canManage ? 'Kocsijaim' : 'Kocsik'}</h2>
        {canManage && token && (
          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            onClick={() => setEditorCar(null)}
          >
            + Új kocsi hozzáadása
          </button>
        )}
      </div>

      {error && <p className="text-danger small">{error}</p>}

      {!error && cars === null && <p className="text-body-secondary small">Betöltés...</p>}

      {cars && cars.length === 0 && (
        <p className="text-body-secondary small">Még nincs felvett kocsi.</p>
      )}

      {cars && cars.length > 0 && (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-xl-3 g-4">
          {cars.map((car) => {
            const primaryImage = car.images.find((img) => img.is_primary) ?? car.images[0]
            return (
              <div className="col" key={car.id}>
                <div className="card h-100">
                  <div className="position-relative">
                    <div className="ratio ratio-16x9 bg-body-secondary">
                      {primaryImage ? (
                        <img
                          src={imageUrl(primaryImage.image_path)}
                          alt={`${car.brand} ${car.model}`}
                          className="object-fit-cover w-100 h-100"
                        />
                      ) : (
                        <div className="d-flex align-items-center justify-content-center small text-body-secondary">
                          Nincs kép
                        </div>
                      )}
                    </div>
                    <span
                      className={`badge rounded-pill position-absolute top-0 end-0 m-2 ${STATUS_BADGE[car.status]}`}
                    >
                      {STATUS_LABELS[car.status]}
                    </span>
                  </div>
                  <div className="card-body d-flex flex-column gap-1">
                    <h3 className="h6 mb-0">
                      {car.brand} {car.model}
                    </h3>
                    <p className="small text-body-secondary mb-0">
                      {car.year} · {FUEL_LABELS[car.fuel_type]} ·{' '}
                      {car.transmission === 'automatic' ? 'Automata' : 'Manuális'} · {car.seats} fő
                      {car.city && <> · {car.city}</>}
                    </p>
                    <p className="fw-semibold mb-0 mt-1">
                      {car.daily_price.toLocaleString('hu-HU')} Ft / nap
                    </p>
                    <div className="d-flex gap-3 mt-2">
                      <button
                        type="button"
                        className="btn btn-link p-0"
                        onClick={() => onSelectCar(car.id)}
                      >
                        Részletek
                      </button>
                      {canManage && token && (
                        <>
                          <button
                            type="button"
                            className="btn btn-link p-0"
                            onClick={() => setEditorCar(car)}
                          >
                            Szerkesztés
                          </button>
                          <button
                            type="button"
                            className="btn btn-link p-0 text-danger"
                            onClick={() => handleDelete(car)}
                          >
                            Törlés
                          </button>
                        </>
                      )}
                    </div>
                  </div>
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
