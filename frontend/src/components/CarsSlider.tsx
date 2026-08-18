import { useEffect, useState } from 'react'
import { imageUrl, listCars, type Car } from '../api'

interface CarsSliderProps {
  onSelectCar: (carId: number) => void
}

function CarsSlider({ onSelectCar }: CarsSliderProps) {
  const [cars, setCars] = useState<Car[]>([])

  useEffect(() => {
    listCars()
      .then((all) => {
        const available = all.filter((car) => car.status === 'available')
        setCars(available.length > 0 ? available : all)
      })
      .catch(() => setCars([]))
  }, [])

  if (cars.length === 0) return null

  const track = [...cars, ...cars]

  return (
    <div className="car-slider">
      <div className="car-slider-track">
        {track.map((car, index) => {
          const primaryImage = car.images.find((img) => img.is_primary) ?? car.images[0]
          return (
            <div
              className="car-slider-item"
              key={`${car.id}-${index}`}
              role="button"
              tabIndex={0}
              onClick={() => onSelectCar(car.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onSelectCar(car.id)
              }}
            >
              <div className="ratio ratio-16x9 bg-body-secondary rounded-3 overflow-hidden">
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
              <p className="small fw-semibold mt-2 mb-0">
                {car.brand} {car.model}
              </p>
              <p className="small text-body-secondary mb-0">
                {car.daily_price.toLocaleString('hu-HU')} Ft / nap
                {car.city && <> · {car.city}</>}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default CarsSlider
