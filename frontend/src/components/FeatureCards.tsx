const features = [
  {
    title: 'Széles választék',
    text: 'Kompakt városi autóktól a prémium terepjárókig mindenre találsz megfelelőt.',
    image: '/images/feature-selection.webp',
  },
  {
    title: 'Egyszerű foglalás',
    text: 'Válaszd ki az időpontot és az átvételi helyet, a többit intézzük.',
    image: '/images/feature-booking.webp',
  },
  {
    title: 'Teljes körű biztosítás',
    text: 'Minden bérléshez alap- vagy prémium biztosítási csomagot választhatsz.',
    image: '/images/feature-insurance.webp',
  },
]

function FeatureCards() {
  return (
    <div className="row row-cols-1 row-cols-md-3 g-4">
      {features.map((f) => (
        <div className="col" key={f.title}>
          <div className="card h-100">
            <img className="card-img-top object-fit-cover" src={f.image} alt="" style={{ height: 200 }} />
            <div className="card-body">
              <h3 className="card-title h5">{f.title}</h3>
              <p className="card-text text-body-secondary">{f.text}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default FeatureCards
