import './App.css'

const features = [
  {
    title: 'Széles választék',
    text: 'Kompakt városi autóktól a prémium terepjárókig mindenre találsz megfelelőt.',
  },
  {
    title: 'Egyszerű foglalás',
    text: 'Válaszd ki az időpontot és az átvételi helyet, a többit intézzük.',
  },
  {
    title: 'Teljes körű biztosítás',
    text: 'Minden bérléshez alap- vagy prémium biztosítási csomagot választhatsz.',
  },
]

function App() {
  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <span className="logo">Super Car Rental</span>
          <nav>
            <a href="#autok">Autók</a>
            <a href="#szolgaltatasok">Szolgáltatások</a>
            <a href="#kapcsolat">Kapcsolat</a>
            <button type="button" className="login-button">
              Bejelentkezés
            </button>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="container">
            <h1>Bérelj autót, ahogy Neked kényelmes</h1>
            <p className="lead">
              Foglalj online percek alatt, vedd át a kiválasztott helyszínen.
            </p>

            <form className="search-card" onSubmit={(e) => e.preventDefault()}>
              <div className="field">
                <label htmlFor="location">Átvételi hely</label>
                <input id="location" name="location" placeholder="pl. Budapest" />
              </div>
              <div className="field">
                <label htmlFor="start-date">Átvétel</label>
                <input id="start-date" name="start-date" type="date" />
              </div>
              <div className="field">
                <label htmlFor="end-date">Visszahozatal</label>
                <input id="end-date" name="end-date" type="date" />
              </div>
              <button type="submit" className="search-button">
                Autók keresése
              </button>
            </form>
          </div>
        </section>

        <section id="szolgaltatasok" className="features">
          <div className="container">
            <h2>Miért minket válassz?</h2>
            <div className="feature-grid">
              {features.map((f) => (
                <div className="feature-card" key={f.title}>
                  <h3>{f.title}</h3>
                  <p>{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer id="kapcsolat" className="site-footer">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} Super Car Rental</p>
        </div>
      </footer>
    </>
  )
}

export default App
