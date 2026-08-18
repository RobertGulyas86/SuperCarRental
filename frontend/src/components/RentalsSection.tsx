import { useEffect, useState } from 'react'
import { ApiError, deleteRental, listRentals, type Rental, type RentalStatus } from '../api'

interface RentalsSectionProps {
  token: string
}

const STATUS_LABELS: Record<RentalStatus, string> = {
  reserved: 'Foglalva',
  ongoing: 'Folyamatban',
  completed: 'Lezárva',
  cancelled: 'Lemondva',
}

const STATUS_BADGE: Record<RentalStatus, string> = {
  reserved: 'text-bg-success',
  ongoing: 'text-bg-primary',
  completed: 'text-bg-secondary',
  cancelled: 'text-bg-danger',
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('hu-HU')
}

function RentalsSection({ token }: RentalsSectionProps) {
  const [rentals, setRentals] = useState<Rental[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    listRentals(token)
      .then((data) => {
        if (!cancelled) setRentals(data)
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Váratlan hiba történt.')
        }
      })
    return () => {
      cancelled = true
    }
  }, [token])

  async function handleDelete(rental: Rental) {
    if (!window.confirm(`Biztosan törlöd ezt a foglalást: ${rental.car.brand} ${rental.car.model}?`)) {
      return
    }
    setError(null)
    try {
      await deleteRental(token, rental.id)
      setRentals((prev) => prev?.filter((r) => r.id !== rental.id) ?? prev)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Váratlan hiba történt.')
    }
  }

  return (
    <section>
      <h2 className="h4 mb-3">Foglalások</h2>

      {error && <p className="text-danger small">{error}</p>}

      {!error && rentals === null && <p className="text-body-secondary small">Betöltés...</p>}

      {rentals && rentals.length === 0 && (
        <p className="text-body-secondary small">Jelenleg nincs foglalás</p>
      )}

      {rentals && rentals.length > 0 && (
        <div className="list-group">
          {rentals.map((rental) => (
            <div
              className="list-group-item d-flex justify-content-between align-items-center flex-wrap gap-2"
              key={rental.id}
            >
              <div>
                <strong>
                  {rental.car.brand} {rental.car.model}
                </strong>
                <p className="small text-body-secondary mb-0 mt-1">
                  {formatDate(rental.start_date)} – {formatDate(rental.end_date)}
                  {rental.car.city && <> · {rental.car.city}</>}
                </p>
              </div>
              <div className="d-flex align-items-center gap-3">
                <span className={`badge rounded-pill ${STATUS_BADGE[rental.status]}`}>
                  {STATUS_LABELS[rental.status]}
                </span>
                <strong className="text-nowrap">{rental.total_price.toLocaleString('hu-HU')} Ft</strong>
                <button
                  type="button"
                  className="btn btn-link p-0 text-danger"
                  onClick={() => handleDelete(rental)}
                >
                  Törlés
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export default RentalsSection
