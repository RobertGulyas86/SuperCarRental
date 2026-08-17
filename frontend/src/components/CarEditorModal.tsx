import { useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import {
  ApiError,
  createCar,
  deleteCarImage,
  imageUrl,
  updateCar,
  updateCarImage,
  uploadCarImage,
  type Car,
  type CarImage,
  type CarPayload,
  type FuelType,
  type InsuranceType,
  type Transmission,
} from '../api'

interface CarEditorModalProps {
  token: string
  car: Car | null
  onClose: () => void
  onSaved: (car: Car) => void
}

const TRANSMISSION_OPTIONS: { value: Transmission; label: string }[] = [
  { value: 'manual', label: 'Manuális' },
  { value: 'automatic', label: 'Automata' },
]

const FUEL_OPTIONS: { value: FuelType; label: string }[] = [
  { value: 'petrol', label: 'Benzin' },
  { value: 'diesel', label: 'Dízel' },
  { value: 'electric', label: 'Elektromos' },
  { value: 'hybrid', label: 'Hibrid' },
  { value: 'lpg', label: 'LPG' },
]

const INSURANCE_OPTIONS: { value: InsuranceType; label: string }[] = [
  { value: 'basic', label: 'Alap' },
  { value: 'full', label: 'Teljes körű' },
]

const STATUS_OPTIONS: { value: Car['status']; label: string }[] = [
  { value: 'available', label: 'Elérhető' },
  { value: 'rented', label: 'Bérelve' },
  { value: 'maintenance', label: 'Karbantartás alatt' },
]

function emptyPayload(): CarPayload {
  return {
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    transmission: 'manual',
    fuel_type: 'petrol',
    fuel_consumption: null,
    seats: 5,
    color: '',
    license_plate: '',
    daily_price: 0,
    insurance_type: 'basic',
    has_highway_vignette: false,
    status: 'available',
  }
}

function payloadFromCar(car: Car): CarPayload {
  return {
    brand: car.brand,
    model: car.model,
    year: car.year,
    transmission: car.transmission,
    fuel_type: car.fuel_type,
    fuel_consumption: car.fuel_consumption,
    seats: car.seats,
    color: car.color ?? '',
    license_plate: car.license_plate,
    daily_price: car.daily_price,
    insurance_type: car.insurance_type,
    has_highway_vignette: car.has_highway_vignette,
    status: car.status,
  }
}

function CarEditorModal({ token, car, onClose, onSaved }: CarEditorModalProps) {
  const [savedCar, setSavedCar] = useState<Car | null>(car)
  const [images, setImages] = useState<CarImage[]>(car?.images ?? [])
  const [form, setForm] = useState<CarPayload>(car ? payloadFromCar(car) : emptyPayload())
  const [error, setError] = useState<string | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function updateField<K extends keyof CarPayload>(key: K, value: CarPayload[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const payload: CarPayload = {
        ...form,
        color: form.color ? form.color : null,
      }
      const result = savedCar
        ? await updateCar(token, savedCar.id, payload)
        : await createCar(token, payload)
      setSavedCar(result)
      setImages(result.images)
      onSaved(result)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Váratlan hiba történt.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleFileSelected(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !savedCar) return

    setUploading(true)
    setImageError(null)
    try {
      const newImage = await uploadCarImage(token, savedCar.id, file, images.length === 0)
      setImages((prev) =>
        newImage.is_primary
          ? [...prev.map((img) => ({ ...img, is_primary: false })), newImage]
          : [...prev, newImage],
      )
    } catch (err) {
      setImageError(err instanceof ApiError ? err.message : 'Váratlan hiba történt.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleDeleteImage(image: CarImage) {
    if (!savedCar) return
    setImageError(null)
    try {
      await deleteCarImage(token, savedCar.id, image.id)
      setImages((prev) => prev.filter((img) => img.id !== image.id))
    } catch (err) {
      setImageError(err instanceof ApiError ? err.message : 'Váratlan hiba történt.')
    }
  }

  async function handleSetPrimary(image: CarImage) {
    if (!savedCar || image.is_primary) return
    setImageError(null)
    try {
      await updateCarImage(token, savedCar.id, image.id, { is_primary: true })
      setImages((prev) => prev.map((img) => ({ ...img, is_primary: img.id === image.id })))
    } catch (err) {
      setImageError(err instanceof ApiError ? err.message : 'Váratlan hiba történt.')
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{savedCar ? 'Autó szerkesztése' : 'Új autó hozzáadása'}</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Bezárás">
            ×
          </button>
        </div>

        <form className="auth-form car-form" onSubmit={handleSubmit}>
          <div className="car-form-grid">
            <div className="field">
              <label htmlFor="brand">Márka</label>
              <input
                id="brand"
                required
                value={form.brand}
                onChange={(e) => updateField('brand', e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="model">Modell</label>
              <input
                id="model"
                required
                value={form.model}
                onChange={(e) => updateField('model', e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="year">Évjárat</label>
              <input
                id="year"
                type="number"
                required
                min={1900}
                max={2100}
                value={form.year}
                onChange={(e) => updateField('year', Number(e.target.value))}
              />
            </div>
            <div className="field">
              <label htmlFor="license-plate">Rendszám</label>
              <input
                id="license-plate"
                required
                value={form.license_plate}
                onChange={(e) => updateField('license_plate', e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="transmission">Váltó</label>
              <select
                id="transmission"
                value={form.transmission}
                onChange={(e) => updateField('transmission', e.target.value as Transmission)}
              >
                {TRANSMISSION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="fuel-type">Üzemanyag</label>
              <select
                id="fuel-type"
                value={form.fuel_type}
                onChange={(e) => updateField('fuel_type', e.target.value as FuelType)}
              >
                {FUEL_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="fuel-consumption">Fogyasztás (l/100km)</label>
              <input
                id="fuel-consumption"
                type="number"
                step="0.1"
                min={0}
                value={form.fuel_consumption ?? ''}
                onChange={(e) =>
                  updateField(
                    'fuel_consumption',
                    e.target.value === '' ? null : Number(e.target.value),
                  )
                }
              />
            </div>
            <div className="field">
              <label htmlFor="seats">Ülések száma</label>
              <input
                id="seats"
                type="number"
                min={1}
                max={255}
                required
                value={form.seats}
                onChange={(e) => updateField('seats', Number(e.target.value))}
              />
            </div>
            <div className="field">
              <label htmlFor="color">Szín</label>
              <input
                id="color"
                value={form.color ?? ''}
                onChange={(e) => updateField('color', e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="daily-price">Napi díj (Ft)</label>
              <input
                id="daily-price"
                type="number"
                min={0}
                required
                value={form.daily_price}
                onChange={(e) => updateField('daily_price', Number(e.target.value))}
              />
            </div>
            <div className="field">
              <label htmlFor="insurance-type">Biztosítás</label>
              <select
                id="insurance-type"
                value={form.insurance_type}
                onChange={(e) => updateField('insurance_type', e.target.value as InsuranceType)}
              >
                {INSURANCE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="status">Állapot</label>
              <select
                id="status"
                value={form.status}
                onChange={(e) => updateField('status', e.target.value as Car['status'])}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label className="checkbox-field">
            <input
              type="checkbox"
              checked={form.has_highway_vignette}
              onChange={(e) => updateField('has_highway_vignette', e.target.checked)}
            />
            Autópálya-matrica érvényes
          </label>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="search-button" disabled={submitting}>
            {submitting ? 'Mentés...' : savedCar ? 'Módosítások mentése' : 'Autó létrehozása'}
          </button>
        </form>

        {savedCar && (
          <div className="image-manager">
            <h3>Képek</h3>

            <div className="image-grid">
              {images.map((image) => (
                <div className="image-thumb" key={image.id}>
                  <img src={imageUrl(image.image_path)} alt="" />
                  {image.is_primary && <span className="image-primary-badge">Elsődleges</span>}
                  <div className="image-thumb-actions">
                    {!image.is_primary && (
                      <button type="button" onClick={() => handleSetPrimary(image)}>
                        Elsődlegessé
                      </button>
                    )}
                    <button
                      type="button"
                      className="image-delete"
                      onClick={() => handleDeleteImage(image)}
                    >
                      Törlés
                    </button>
                  </div>
                </div>
              ))}

              <label className={`image-upload-tile${uploading ? ' uploading' : ''}`}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="image-upload-input"
                  onChange={handleFileSelected}
                  disabled={uploading}
                />
                <span className="image-upload-plus">+</span>
                <span>{uploading ? 'Feltöltés...' : 'Kép hozzáadása'}</span>
              </label>
            </div>

            {imageError && <p className="form-error">{imageError}</p>}
          </div>
        )}
      </div>
    </div>
  )
}

export default CarEditorModal
