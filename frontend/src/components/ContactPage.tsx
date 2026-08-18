import { useState, type FormEvent } from 'react'

const ADDRESS = '3526 Miskolc, Eperjesi utca 4/a'
const MAP_SRC = `https://www.google.com/maps?q=${encodeURIComponent(ADDRESS)}&output=embed`

function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSent(true)
  }

  return (
    <div className="container py-5">
      <h1 className="mb-4">Kapcsolat</h1>

      <div className="row g-4 mb-5">
        <div className="col-12 col-lg-5">
          <p className="mb-1 fw-semibold">Super Car Rental</p>
          <p className="mb-1">{ADDRESS}</p>
          <p className="mb-4">
            <a href="mailto:info@supercarrental.hu">info@supercarrental.hu</a>
          </p>

          {sent ? (
            <div className="alert alert-success" role="alert">
              Köszönjük az üzenetet! Hamarosan felvesszük Önnel a kapcsolatot.
            </div>
          ) : (
            <form className="d-flex flex-column gap-3" onSubmit={handleSubmit}>
              <div>
                <label className="form-label" htmlFor="contact-name">
                  Név
                </label>
                <input
                  id="contact-name"
                  className="form-control"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="form-label" htmlFor="contact-email">
                  E-mail cím
                </label>
                <input
                  id="contact-email"
                  type="email"
                  className="form-control"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="form-label" htmlFor="contact-message">
                  Üzenet
                </label>
                <textarea
                  id="contact-message"
                  className="form-control"
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary align-self-start">
                Küldés
              </button>
            </form>
          )}
        </div>

        <div className="col-12 col-lg-7">
          <div className="ratio ratio-4x3 border rounded-3 overflow-hidden">
            <iframe
              title="Telephely térkép"
              src={MAP_SRC}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContactPage
