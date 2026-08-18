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
    city: '',
    license_plate: '',
    daily_price: 0,
    insurance_type: 'basic',
    has_highway_vignette: false,
    has_air_conditioning: false,
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
    city: car.city ?? '',
    license_plate: car.license_plate,
    daily_price: car.daily_price,
    insurance_type: car.insurance_type,
    has_highway_vignette: car.has_highway_vignette,
    has_air_conditioning: car.has_air_conditioning,
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
        city: form.city ? form.city : null,
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
    <>
      <div className="modal d-block" tabIndex={-1} onClick={onClose}>
        <div
          className="modal-dialog modal-dialog-scrollable modal-lg modal-dialog-centered"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title h5 mb-0">
                {savedCar ? 'Autó szerkesztése' : 'Új autó hozzáadása'}
              </h2>
              <button type="button" className="btn-close" onClick={onClose} aria-label="Bezárás" />
            </div>

            <div className="modal-body">
              <form className="d-flex flex-column gap-3" onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-12 col-sm-6">
                    <label className="form-label" htmlFor="brand">
                      Márka
                    </label>
                    <input
                      id="brand"
                      className="form-control"
                      required
                      value={form.brand}
                      onChange={(e) => updateField('brand', e.target.value)}
                    />
                  </div>
                  <div className="col-12 col-sm-6">
                    <label className="form-label" htmlFor="model">
                      Modell
                    </label>
                    <input
                      id="model"
                      className="form-control"
                      required
                      value={form.model}
                      onChange={(e) => updateField('model', e.target.value)}
                    />
                  </div>
                  <div className="col-12 col-sm-6">
                    <label className="form-label" htmlFor="year">
                      Évjárat
                    </label>
                    <input
                      id="year"
                      type="number"
                      className="form-control"
                      required
                      min={1900}
                      max={2100}
                      value={form.year}
                      onChange={(e) => updateField('year', Number(e.target.value))}
                    />
                  </div>
                  <div className="col-12 col-sm-6">
                    <label className="form-label" htmlFor="license-plate">
                      Rendszám
                    </label>
                    <input
                      id="license-plate"
                      className="form-control"
                      required
                      value={form.license_plate}
                      onChange={(e) => updateField('license_plate', e.target.value)}
                    />
                  </div>
                  <div className="col-12 col-sm-6">
                    <label className="form-label" htmlFor="transmission">
                      Váltó
                    </label>
                    <select
                      id="transmission"
                      className="form-select"
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
                  <div className="col-12 col-sm-6">
                    <label className="form-label" htmlFor="fuel-type">
                      Üzemanyag
                    </label>
                    <select
                      id="fuel-type"
                      className="form-select"
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
                  <div className="col-12 col-sm-6">
                    <label className="form-label" htmlFor="fuel-consumption">
                      Fogyasztás (l/100km)
                    </label>
                    <input
                      id="fuel-consumption"
                      type="number"
                      step="0.1"
                      min={0}
                      className="form-control"
                      value={form.fuel_consumption ?? ''}
                      onChange={(e) =>
                        updateField(
                          'fuel_consumption',
                          e.target.value === '' ? null : Number(e.target.value),
                        )
                      }
                    />
                  </div>
                  <div className="col-12 col-sm-6">
                    <label className="form-label" htmlFor="seats">
                      Ülések száma
                    </label>
                    <input
                      id="seats"
                      type="number"
                      min={1}
                      max={255}
                      required
                      className="form-control"
                      value={form.seats}
                      onChange={(e) => updateField('seats', Number(e.target.value))}
                    />
                  </div>
                  <div className="col-12 col-sm-6">
                    <label className="form-label" htmlFor="color">
                      Szín
                    </label>
                    <input
                      id="color"
                      className="form-control"
                      value={form.color ?? ''}
                      onChange={(e) => updateField('color', e.target.value)}
                    />
                  </div>
                  <div className="col-12 col-sm-6">
                    <label className="form-label" htmlFor="city">
                      Város
                    </label>
                    <input
                      id="city"
                      className="form-control"
                      placeholder="pl. Budapest"
                      value={form.city ?? ''}
                      onChange={(e) => updateField('city', e.target.value)}
                    />
                  </div>
                  <div className="col-12 col-sm-6">
                    <label className="form-label" htmlFor="daily-price">
                      Napi díj (Ft)
                    </label>
                    <input
                      id="daily-price"
                      type="number"
                      min={0}
                      required
                      className="form-control"
                      value={form.daily_price}
                      onChange={(e) => updateField('daily_price', Number(e.target.value))}
                    />
                  </div>
                  <div className="col-12 col-sm-6">
                    <label className="form-label" htmlFor="insurance-type">
                      Biztosítás
                    </label>
                    <select
                      id="insurance-type"
                      className="form-select"
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
                  <div className="col-12 col-sm-6">
                    <label className="form-label" htmlFor="status">
                      Állapot
                    </label>
                    <select
                      id="status"
                      className="form-select"
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

                <div className="form-check">
                  <input
                    id="has-highway-vignette"
                    type="checkbox"
                    className="form-check-input"
                    checked={form.has_highway_vignette}
                    onChange={(e) => updateField('has_highway_vignette', e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="has-highway-vignette">
                    Autópálya-matrica érvényes
                  </label>
                </div>

                <div className="form-check">
                  <input
                    id="has-air-conditioning"
                    type="checkbox"
                    className="form-check-input"
                    checked={form.has_air_conditioning}
                    onChange={(e) => updateField('has_air_conditioning', e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="has-air-conditioning">
                    Klímás
                  </label>
                </div>

                {error && <p className="text-danger small mb-0">{error}</p>}

                <button type="submit" className="btn btn-primary align-self-start" disabled={submitting}>
                  {submitting ? 'Mentés...' : savedCar ? 'Módosítások mentése' : 'Autó létrehozása'}
                </button>
              </form>

              {savedCar && (
                <div className="mt-4 pt-4 border-top">
                  <h3 className="h6 mb-3">Képek</h3>

                  <div className="row row-cols-3 row-cols-sm-4 g-2 mb-2">
                    {images.map((image) => (
                      <div className="col" key={image.id}>
                        <div className="position-relative border rounded overflow-hidden">
                          <div className="ratio ratio-1x1 bg-body-secondary">
                            <img src={imageUrl(image.image_path)} alt="" className="object-fit-cover" />
                          </div>
                          {image.is_primary && (
                            <span className="badge text-bg-primary position-absolute top-0 start-0 m-1">
                              Elsődleges
                            </span>
                          )}
                          <div className="d-flex justify-content-between gap-1 p-1">
                            {!image.is_primary && (
                              <button
                                type="button"
                                className="btn btn-outline-secondary btn-sm py-0 px-1"
                                style={{ fontSize: 11 }}
                                onClick={() => handleSetPrimary(image)}
                              >
                                Elsődlegessé
                              </button>
                            )}
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm py-0 px-1 ms-auto"
                              style={{ fontSize: 11 }}
                              onClick={() => handleDeleteImage(image)}
                            >
                              Törlés
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="col">
                      <label
                        className={`image-upload-tile ratio ratio-1x1${uploading ? ' uploading' : ''}`}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="image-upload-input"
                          onChange={handleFileSelected}
                          disabled={uploading}
                        />
                        <span className="d-flex flex-column align-items-center justify-content-center gap-1 small text-center">
                          <span className="image-upload-plus">+</span>
                          {uploading ? 'Feltöltés...' : 'Kép hozzáadása'}
                        </span>
                      </label>
                    </div>
                  </div>

                  {imageError && <p className="text-danger small mb-0">{imageError}</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop show" />
    </>
  )
}

export default CarEditorModal
