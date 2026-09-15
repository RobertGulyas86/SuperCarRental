import { useState, type FormEvent } from 'react'
import { ApiError, deleteRental, updateRental, type Rental, type User } from '../api'
import CarImageGallery from './CarImageGallery'
import DateRangePicker from './DateRangePicker'

interface RentalDetailPageProps {
  rental: Rental
  token: string
  user: User
  onBack: () => void
  onDeleted: () => void
}

const FUEL_LABELS: Record<Rental['car']['fuel_type'], string> = {
  petrol: 'Benzin',
  diesel: 'Dízel',
  electric: 'Elektromos',
  hybrid: 'Hibrid',
  lpg: 'LPG',
}

const INSURANCE_LABELS: Record<Rental['car']['insurance_type'], string> = {
  basic: 'Alap',
  full: 'Teljes körű',
}

const STATUS_LABELS: Record<Rental['status'], string> = {
  reserved: 'Foglalva',
  ongoing: 'Folyamatban',
  completed: 'Lezárva',
  cancelled: 'Lemondva',
}

const STATUS_BADGE: Record<Rental['status'], string> = {
  reserved: 'text-bg-success',
  ongoing: 'text-bg-primary',
  completed: 'text-bg-secondary',
  cancelled: 'text-bg-danger',
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('hu-HU')
}

function nightsBetween(start: string, end: string): number {
  const ms = new Date(end).getTime() - new Date(start).getTime()
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)))
}

function RentalDetailPage({ rental: initialRental, token, user, onBack, onDeleted }: RentalDetailPageProps) {
  const [rental, setRental] = useState(initialRental)
  const [editing, setEditing] = useState(false)
  const [startDate, setStartDate] = useState(rental.start_date)
  const [endDate, setEndDate] = useState(rental.end_date)
  const [editError, setEditError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const { car } = rental
  const contact = user.role === 'owner' ? rental.customer : car.owner
  const contactTitle = user.role === 'owner' ? 'Bérlő elérhetősége' : 'Bérbeadó elérhetősége'
  const nights = nightsBetween(rental.start_date, rental.end_date)
  const editNights = nightsBetween(startDate, endDate)
  const canModify = rental.status === 'reserved'

  function startEditing() {
    setStartDate(rental.start_date)
    setEndDate(rental.end_date)
    setEditError(null)
    setEditing(true)
  }

  async function handleSaveEdit(e: FormEvent) {
    e.preventDefault()
    setEditError(null)
    setSubmitting(true)
    try {
      const updated = await updateRental(token, rental.id, { start_date: startDate, end_date: endDate })
      setRental(updated)
      setEditing(false)
    } catch (err) {
      setEditError(err instanceof ApiError ? err.message : 'Váratlan hiba történt.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Biztosan törlöd ezt a foglalást: ${car.brand} ${car.model}?`)) {
      return
    }
    setDeleting(true)
    try {
      await deleteRental(token, rental.id)
      onDeleted()
    } catch (err) {
      setEditError(err instanceof ApiError ? err.message : 'Váratlan hiba történt.')
      setDeleting(false)
    }
  }

  return (
    <div className="container py-5">
      <button type="button" className="btn btn-link p-0 mb-4" onClick={onBack}>
        &larr; Vissza
      </button>

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
              <h2 className="h6 mb-2">{contactTitle}</h2>
              <p className="mb-1">
                {contact.first_name} {contact.last_name}
              </p>
              <p className="mb-1">
                <a href={`tel:${contact.phone_number}`}>{contact.phone_number}</a>
              </p>
              <p className="mb-0">
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
              </p>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h2 className="h5 mb-0">Foglalás adatai</h2>
                <span className={`badge rounded-pill ${STATUS_BADGE[rental.status]}`}>
                  {STATUS_LABELS[rental.status]}
                </span>
              </div>

              {editing ? (
                <form className="d-flex flex-column gap-3" onSubmit={handleSaveEdit}>
                  <DateRangePicker
                    carId={car.id}
                    startDate={startDate}
                    endDate={endDate}
                    excludeRentalId={rental.id}
                    onChange={(start, end) => {
                      setStartDate(start)
                      setEndDate(end)
                    }}
                  />

                  {editNights > 0 && (
                    <p className="mb-0 text-body-secondary">
                      {editNights} nap × {car.daily_price.toLocaleString('hu-HU')} Ft ={' '}
                      <strong className="text-body">
                        {(editNights * car.daily_price).toLocaleString('hu-HU')} Ft
                      </strong>
                    </p>
                  )}

                  {editError && <p className="text-danger small mb-0">{editError}</p>}

                  <div className="d-flex gap-2">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={submitting || editNights <= 0}
                    >
                      {submitting ? 'Mentés...' : 'Mentés'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setEditing(false)}
                      disabled={submitting}
                    >
                      Mégse
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <ul className="list-unstyled d-flex flex-column gap-1 mb-0">
                    <li>
                      Átvétel: <strong>{formatDate(rental.start_date)}</strong>
                    </li>
                    <li>
                      Visszahozatal: <strong>{formatDate(rental.end_date)}</strong>
                    </li>
                    <li>Időtartam: {nights} éjszaka</li>
                    <li>
                      Végösszeg: <strong>{rental.total_price.toLocaleString('hu-HU')} Ft</strong>
                    </li>
                    <li className="text-body-secondary small mt-2">
                      Foglalás létrehozva: {formatDate(rental.created_at)}
                    </li>
                  </ul>

                  {editError && <p className="text-danger small mt-3 mb-0">{editError}</p>}

                  <div className="d-flex gap-2 mt-3">
                    {canModify && (
                      <button type="button" className="btn btn-outline-primary" onClick={startEditing}>
                        Módosítás
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-outline-danger"
                      onClick={handleDelete}
                      disabled={deleting}
                    >
                      {deleting ? 'Törlés...' : 'Törlés'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RentalDetailPage
