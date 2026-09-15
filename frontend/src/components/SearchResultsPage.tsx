import { useEffect, useState } from 'react'
import { ApiError, imageUrl, searchCars, type Car, type CarSearchResult } from '../api'

interface SearchResultsPageProps {
  city: string
  startDate: string
  endDate: string
  onSelectCar: (carId: number) => void
  onBack: () => void
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('hu-HU')
}

function CarGrid({ cars, onSelectCar }: { cars: Car[]; onSelectCar: (carId: number) => void }) {
  return (
    <div className="row row-cols-1 row-cols-sm-2 row-cols-xl-3 g-4">
      {cars.map((car) => {
        const primaryImage = car.images.find((img) => img.is_primary) ?? car.images[0]
        return (
          <div className="col" key={car.id}>
            <div
              className="card h-100 car-image-clickable"
              role="button"
              tabIndex={0}
              onClick={() => onSelectCar(car.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onSelectCar(car.id)
                }
              }}
            >
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
              <div className="card-body">
                <h3 className="h6 mb-1">
                  {car.brand} {car.model}
                </h3>
                <p className="small text-body-secondary mb-1">
                  {car.year} · {car.seats} fő
                  {car.city && <> · {car.city}</>}
                </p>
                <p className="fw-semibold mb-0">{car.daily_price.toLocaleString('hu-HU')} Ft / nap</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function SearchResultsPage({ city, startDate, endDate, onSelectCar, onBack }: SearchResultsPageProps) {
  const [result, setResult] = useState<CarSearchResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setResult(null)
    setError(null)
    searchCars({ city: city || undefined, start_date: startDate || undefined, end_date: endDate || undefined })
      .then((data) => {
        if (!cancelled) setResult(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'Váratlan hiba történt.')
      })
    return () => {
      cancelled = true
    }
  }, [city, startDate, endDate])

  const hasPeriod = Boolean(startDate && endDate)
  const hasCity = Boolean(city)

  return (
    <div className="container py-5">
      <button type="button" className="btn btn-link p-0 mb-4" onClick={onBack}>
        &larr; Vissza
      </button>

      <h1 className="h3 mb-1">Keresési eredmények</h1>
      <p className="text-body-secondary mb-4">
        {hasCity && <>„{city}” </>}
        {hasPeriod && (
          <>
            {hasCity ? '· ' : ''}
            {formatDate(startDate)} – {formatDate(endDate)}
          </>
        )}
        {!hasCity && !hasPeriod && 'Minden elérhető autónk'}
      </p>

      {error && <p className="text-danger">{error}</p>}

      {!error && result === null && <p className="text-body-secondary">Keresés folyamatban...</p>}

      {result && (
        <>
          <section className="mb-5">
            <h2 className="h5 mb-3">
              {hasCity ? `Elérhető autók ebben a városban: „${city}”` : 'Elérhető autók'}
            </h2>
            {result.matching.length > 0 ? (
              <CarGrid cars={result.matching} onSelectCar={onSelectCar} />
            ) : (
              <p className="text-body-secondary mb-0">
                {hasCity
                  ? `Sajnos „${city}” városban jelenleg nincs szabad autónk erre az időszakra${
                      result.other.length > 0 ? ' — de nézd meg az alábbi közeli lehetőségeket!' : '.'
                    }`
                  : 'Sajnos jelenleg nincs foglalható autónk ezekre a dátumokra. Próbálj ki egy másik időszakot, vagy nézz vissza hamarosan — a flottánk folyamatosan bővül!'}
              </p>
            )}
          </section>

          {hasCity && (
            <section>
              <h2 className="h5 mb-3">Más városokban elérhető autók</h2>
              {result.other.length > 0 ? (
                <CarGrid cars={result.other} onSelectCar={onSelectCar} />
              ) : (
                <p className="text-body-secondary mb-0">
                  Jelenleg nincs más szabad autónk más városban erre az időszakra.
                </p>
              )}
            </section>
          )}
        </>
      )}
    </div>
  )
}

export default SearchResultsPage
