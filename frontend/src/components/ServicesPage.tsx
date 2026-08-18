import FeatureCards from './FeatureCards'

function ServicesPage() {
  return (
    <div className="container py-5">
      <h1 className="mb-4">Szolgáltatások</h1>

      <div className="row g-4 mb-5">
        <div className="col-12 col-lg-8">
          <p>
            A Super Car Rental egy <strong>platform</strong>, amely összeköti egymással a jármű
            tulajdonosokat (bérbeadókat) és a bérelni vágyókat (bérlőket). Nem vagyunk hagyományos
            autókölcsönző, nincs saját flottánk, és nem vagyunk szerződő fél a bérbeadó és a bérlő
            között létrejövő megállapodásban — kizárólag azt a technikai felületet biztosítjuk,
            amelyen keresztül a felek egymásra találnak, a hirdetéseket közzéteszik, és a
            foglalásokat lebonyolítják.
          </p>
          <p>
            Ennek megfelelően a Super Car Rental <strong>semmilyen felelősséget nem vállal</strong>{' '}
            a platformon közzétett hirdetések valóságtartalmáért, a járművek műszaki állapotáért, a
            felek közötti megállapodás teljesítéséért, sem pedig a bérlés során esetlegesen
            felmerülő károkért, balesetekért, késedelmekért vagy egyéb vitás kérdésekért. A platform
            használata minden esetben a felhasználók saját felelősségére és belátása szerint
            történik.
          </p>
          <p>
            Javasoljuk, hogy bérlés előtt minden esetben egyeztessen a bérbeadóval a pontos
            átvételi feltételekről, a biztosítás típusáról és az esetleges plusz költségekről. A
            bérbeadó felelőssége, hogy a hirdetésben szereplő adatok (műszaki állapot,
            felszereltség, ár) a valóságnak megfelelőek legyenek; a bérlő felelőssége pedig, hogy a
            bérelt járművet rendeltetésszerűen, a megállapodásban foglaltak szerint használja. A
            regisztrációval és a platform használatával mindkét fél elfogadja, hogy a Super Car
            Rental kizárólag közvetítői szerepet tölt be, a létrejött bérleti jogviszonyból eredő
            jogok és kötelezettségek pedig kizárólag a bérlőt és a bérbeadót terhelik.
          </p>
          <p className="mb-0">
            Csapatunk ugyanakkor folyamatosan dolgozik azon, hogy a platform használata minél
            egyszerűbb és átláthatóbb legyen: gyors regisztráció, könnyen kezelhető hirdetéskezelés
            bérbeadóknak, valamint áttekinthető, néhány kattintásos foglalási folyamat áll a
            felhasználók rendelkezésére — a részletekért lásd az alábbi pontokat.
          </p>
        </div>
      </div>

      <h2 className="h4 mb-4">Miért minket válassz?</h2>
      <FeatureCards />
    </div>
  )
}

export default ServicesPage
