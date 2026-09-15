import { useCallback, useEffect, useRef, useState, type WheelEvent } from 'react'
import { imageUrl, type CarImage } from '../api'

interface CarImageGalleryProps {
  images: CarImage[]
  altPrefix: string
}

function CarImageGallery({ images, altPrefix }: CarImageGalleryProps) {
  const orderedImages = [...images].sort((a, b) => Number(b.is_primary) - Number(a.is_primary))
  const imageCount = orderedImages.length
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const wheelLockRef = useRef(false)

  const showNext = useCallback(() => {
    setLightboxIndex((i) => (i === null ? i : (i + 1) % imageCount))
  }, [imageCount])

  const showPrev = useCallback(() => {
    setLightboxIndex((i) => (i === null ? i : (i - 1 + imageCount) % imageCount))
  }, [imageCount])

  function handleWheel(e: WheelEvent<HTMLDivElement>) {
    if (imageCount < 2 || wheelLockRef.current) return
    wheelLockRef.current = true
    if (e.deltaY > 0) showNext()
    else if (e.deltaY < 0) showPrev()
    setTimeout(() => {
      wheelLockRef.current = false
    }, 250)
  }

  useEffect(() => {
    if (lightboxIndex === null) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setLightboxIndex(null)
      else if (e.key === 'ArrowRight') showNext()
      else if (e.key === 'ArrowLeft') showPrev()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightboxIndex, showNext, showPrev])

  return (
    <>
      <div className="position-relative mb-3">
        <div
          className={`ratio ratio-16x9 bg-body-secondary rounded-3 overflow-hidden${imageCount > 0 ? ' car-image-clickable' : ''}`}
          role={imageCount > 0 ? 'button' : undefined}
          tabIndex={imageCount > 0 ? 0 : undefined}
          onClick={() => imageCount > 0 && setLightboxIndex(0)}
          onKeyDown={(e) => {
            if (imageCount > 0 && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault()
              setLightboxIndex(0)
            }
          }}
        >
          {imageCount > 0 ? (
            <img
              src={imageUrl(orderedImages[0].image_path)}
              alt={altPrefix}
              className="object-fit-cover w-100 h-100"
            />
          ) : (
            <div className="d-flex align-items-center justify-content-center small text-body-secondary">
              Nincs kép
            </div>
          )}
        </div>
        {imageCount > 0 && (
          <span className="badge text-bg-dark position-absolute bottom-0 end-0 m-2 d-inline-flex align-items-center gap-1">
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="6.5" cy="6.5" r="4.5" />
              <line x1="6.5" y1="4.5" x2="6.5" y2="8.5" />
              <line x1="4.5" y1="6.5" x2="8.5" y2="6.5" />
              <line x1="10" y1="10" x2="13.5" y2="13.5" />
            </svg>
            {imageCount} kép
          </span>
        )}
      </div>

      {lightboxIndex !== null && (
        <>
          <div
            className="modal d-flex align-items-center justify-content-center lightbox-modal"
            tabIndex={-1}
            onClick={() => setLightboxIndex(null)}
          >
            <div className="lightbox-content" onClick={(e) => e.stopPropagation()} onWheel={handleWheel}>
              <img
                src={imageUrl(orderedImages[lightboxIndex].image_path)}
                alt={`${altPrefix} - ${lightboxIndex + 1}. kép`}
                className="lightbox-image"
              />

              <button
                type="button"
                className="lightbox-close"
                onClick={() => setLightboxIndex(null)}
                aria-label="Bezárás"
              >
                &times;
              </button>

              {imageCount > 1 && (
                <>
                  <button
                    type="button"
                    className="lightbox-nav lightbox-nav-prev"
                    onClick={(e) => {
                      e.stopPropagation()
                      showPrev()
                    }}
                    aria-label="Előző kép"
                  >
                    &lsaquo;
                  </button>
                  <button
                    type="button"
                    className="lightbox-nav lightbox-nav-next"
                    onClick={(e) => {
                      e.stopPropagation()
                      showNext()
                    }}
                    aria-label="Következő kép"
                  >
                    &rsaquo;
                  </button>
                  <span className="lightbox-counter">
                    {lightboxIndex + 1} / {imageCount}
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="modal-backdrop show" />
        </>
      )}
    </>
  )
}

export default CarImageGallery
