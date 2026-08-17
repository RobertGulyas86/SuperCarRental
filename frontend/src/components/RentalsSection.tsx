import { useEffect, useState } from 'react'
import { ApiError, listRentals, type Rental, type RentalStatus } from '../api'

interface RentalsSectionProps {
  token: string
}

const STATUS_LABELS: Record<RentalStatus, string> = {
  reserved: 'Foglalva',
  ongoing: 'Folyamatban',
  completed: 'Lezárva',
  cancelled: 'Lemondva',
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

  return (
    <section className="dashboard-section">
      <h2>Foglalások</h2>

      {error && <p className="form-error">{error}</p>}

      {!error && rentals === null && <p className="lead-small">Betöltés...</p>}

      {rentals && rentals.length === 0 && <p className="lead-small">Jelenleg nincs foglalás</p>}

      {rentals && rentals.length > 0 && (
        <div className="rental-list">
          {rentals.map((rental) => (
            <div className="rental-row" key={rental.id}>
              <div>
                <strong>
                  {rental.car.brand} {rental.car.model}
                </strong>
                <p className="rental-meta">
                  {formatDate(rental.start_date)} – {formatDate(rental.end_date)} ·{' '}
                  {rental.location.city}
                </p>
              </div>
              <div className="rental-row-end">
                <span className={`status-badge status-${rental.status}`}>
                  {STATUS_LABELS[rental.status]}
                </span>
                <strong>{rental.total_price.toLocaleString('hu-HU')} Ft</strong>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export default RentalsSection
