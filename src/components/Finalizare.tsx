import { useEffect, useState, type FormEvent } from 'react';
import { motive, produse, subtitlu } from '../data/catalog';
import { citesteCos, golesteCos, type Linie } from '../lib/cos';
import { lei, PRAG_LIVRARE_GRATUITA } from '../lib/format';

const dupaId = new Map(produse.map((p) => [p.id, p]));

const curieri = [
  { id: 'easybox', nume: 'Sameday easybox', detaliu: 'Ridici coletul din locker, când vrei', pret: 14.99 },
  { id: 'fan', nume: 'FAN Courier', detaliu: 'La adresă, în 24-48 de ore', pret: 19.99 },
  { id: 'cargus', nume: 'Cargus', detaliu: 'La adresă, în 24-48 de ore', pret: 19.99 },
];

const plati = [
  { id: 'card', nume: 'Card online', detaliu: 'Visa sau Mastercard, prin procesator de plăți securizat' },
  { id: 'ramburs', nume: 'Ramburs', detaliu: 'Numerar sau card la curier, la livrare' },
];

// TODO(real): comanda se creează pe server, plata merge prin Netopia / Stripe, AWB-ul se
// generează la curier, iar stocul și factura se sincronizează cu BaseLinker.
export default function Finalizare() {
  const [linii, setLinii] = useState<Linie[] | null>(null);
  const [curier, setCurier] = useState('easybox');
  const [plata, setPlata] = useState('card');
  const [comanda, setComanda] = useState<string | null>(null);

  useEffect(() => setLinii(citesteCos()), []);

  if (comanda) {
    return (
      <div className="confirmare">
        <h1>Comanda {comanda} a fost înregistrată</h1>
        <p>
          Ți-am trimis confirmarea pe e-mail. Primești numărul de urmărire prin SMS când coletul pleacă din depozit.
        </p>
        <p className="confirmare-nota">Acesta este un site demonstrativ: nu s-a făcut nicio plată și nu se livrează nimic.</p>
        <a className="buton buton-plin" href="/produse">
          Înapoi la oferte
        </a>
      </div>
    );
  }

  if (linii === null) return <div className="finalizare-gol" />;

  const randuri = linii.flatMap((l) => {
    const p = dupaId.get(l.id);
    return p ? [{ p, cantitate: l.cantitate }] : [];
  });

  if (randuri.length === 0) {
    return (
      <div className="confirmare">
        <h1>Coșul este gol</h1>
        <p>Adaugă un produs ca să poți plasa comanda.</p>
        <a className="buton buton-plin" href="/produse">
          Vezi toate ofertele
        </a>
      </div>
    );
  }

  const subtotal = randuri.reduce((s, r) => s + r.p.pret * r.cantitate, 0);
  const gratuit = subtotal >= PRAG_LIVRARE_GRATUITA;
  const livrare = gratuit ? 0 : curieri.find((c) => c.id === curier)!.pret;
  const economisit = randuri.reduce((s, r) => s + (r.p.pretRaft - r.p.pret) * r.cantitate, 0);

  const trimite = (e: FormEvent) => {
    e.preventDefault();
    golesteCos();
    setComanda(`FO-${String(Date.now()).slice(-6)}`);
    window.scrollTo({ top: 0 });
  };

  return (
    <form className="finalizare" onSubmit={trimite}>
      <div className="finalizare-pasi">
        <h1>Finalizează comanda</h1>

        <fieldset>
          <legend>1. Date de contact</legend>
          <div className="campuri">
            <label>
              <span>Nume și prenume</span>
              <input type="text" name="nume" required autoComplete="name" />
            </label>
            <label>
              <span>Telefon</span>
              <input type="tel" name="telefon" required autoComplete="tel" placeholder="07xx xxx xxx" pattern="[0-9 +]{10,15}" />
            </label>
            <label className="camp-lat">
              <span>E-mail</span>
              <input type="email" name="email" required autoComplete="email" />
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend>2. Livrare</legend>
          <div className="alegeri">
            {curieri.map((c) => (
              <label key={c.id} className={curier === c.id ? 'alegere alegere-activa' : 'alegere'}>
                <input type="radio" name="curier" checked={curier === c.id} onChange={() => setCurier(c.id)} />
                <span>
                  <strong>{c.nume}</strong>
                  <small>{c.detaliu}</small>
                </span>
                <em>{gratuit ? 'Gratuit' : lei(c.pret)}</em>
              </label>
            ))}
          </div>
          <div className="campuri">
            <label>
              <span>Județ</span>
              <input type="text" name="judet" required autoComplete="address-level1" />
            </label>
            <label>
              <span>Localitate</span>
              <input type="text" name="localitate" required autoComplete="address-level2" />
            </label>
            <label className="camp-lat">
              <span>{curier === 'easybox' ? 'Easybox preferat (stradă sau reper)' : 'Stradă, număr, bloc, apartament'}</span>
              <input type="text" name="adresa" required autoComplete="street-address" />
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend>3. Plată</legend>
          <div className="alegeri">
            {plati.map((p) => (
              <label key={p.id} className={plata === p.id ? 'alegere alegere-activa' : 'alegere'}>
                <input type="radio" name="plata" checked={plata === p.id} onChange={() => setPlata(p.id)} />
                <span>
                  <strong>{p.nume}</strong>
                  <small>{p.detaliu}</small>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <aside className="sumar" aria-label="Sumarul comenzii">
        <h2>Comanda ta</h2>
        <ul>
          {randuri.map(({ p, cantitate }) => (
            <li key={p.id}>
              <img src={`/produse/${p.id}.webp`} alt="" width={120} height={120} />
              <span>
                <strong>{p.brand}</strong> {p.nume}
                <small>
                  {subtitlu(p)} · {motive[p.motiv].nume} · {cantitate} buc.
                </small>
              </span>
              <em>{lei(+(p.pret * cantitate).toFixed(2))}</em>
            </li>
          ))}
        </ul>
        <dl>
          <div>
            <dt>Subtotal</dt>
            <dd>{lei(+subtotal.toFixed(2))}</dd>
          </div>
          <div>
            <dt>Livrare</dt>
            <dd>{livrare === 0 ? 'Gratuită' : lei(livrare)}</dd>
          </div>
          <div className="total-economie">
            <dt>Economisești</dt>
            <dd>{lei(Math.round(economisit))}</dd>
          </div>
          <div className="total-final">
            <dt>Total de plată</dt>
            <dd>{lei(+(subtotal + livrare).toFixed(2))}</dd>
          </div>
        </dl>
        <button type="submit" className="buton buton-plin buton-lat">
          {plata === 'card' ? 'Plătește cu cardul' : 'Trimite comanda'}
        </button>
        <p className="sertar-nota">Factura vine pe e-mail imediat după confirmare.</p>
      </aside>
    </form>
  );
}
