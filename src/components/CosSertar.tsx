import { useEffect, useRef, useState } from 'react';
import { motive, produse, subtitlu } from '../data/catalog';
import { ascultaCos, citesteCos, DESCHIDE_COS, seteaza, type Linie } from '../lib/cos';
import { COST_LIVRARE, lei, PRAG_LIVRARE_GRATUITA } from '../lib/format';

const dupaId = new Map(produse.map((p) => [p.id, p]));

export default function CosSertar() {
  const [linii, setLinii] = useState<Linie[]>([]);
  const [deschis, setDeschis] = useState(false);
  const inchide = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setLinii(citesteCos());
    const opreste = ascultaCos(setLinii);
    const deschide = () => setDeschis(true);
    window.addEventListener(DESCHIDE_COS, deschide);
    return () => {
      opreste();
      window.removeEventListener(DESCHIDE_COS, deschide);
    };
  }, []);

  useEffect(() => {
    if (!deschis) return;
    inchide.current?.focus();
    const laTasta = (e: KeyboardEvent) => e.key === 'Escape' && setDeschis(false);
    document.addEventListener('keydown', laTasta);
    document.documentElement.classList.add('fara-scroll');
    return () => {
      document.removeEventListener('keydown', laTasta);
      document.documentElement.classList.remove('fara-scroll');
    };
  }, [deschis]);

  const randuri = linii.flatMap((l) => {
    const p = dupaId.get(l.id);
    return p ? [{ p, cantitate: l.cantitate }] : [];
  });
  const subtotal = randuri.reduce((s, r) => s + r.p.pret * r.cantitate, 0);
  const economisit = randuri.reduce((s, r) => s + (r.p.pretRaft - r.p.pret) * r.cantitate, 0);
  const ramas = Math.max(0, PRAG_LIVRARE_GRATUITA - subtotal);
  const livrare = ramas > 0 ? COST_LIVRARE : 0;

  return (
    <div className={deschis ? 'sertar sertar-deschis' : 'sertar'} aria-hidden={!deschis}>
      <div className="sertar-fundal" onClick={() => setDeschis(false)} />
      <aside className="sertar-panou" role="dialog" aria-modal="true" aria-label="Coșul de cumpărături" inert={!deschis}>
        <header className="sertar-cap">
          <h2>Coșul tău{randuri.length > 0 && <span> · {randuri.reduce((s, r) => s + r.cantitate, 0)} produse</span>}</h2>
          <button ref={inchide} type="button" className="buton-icon" onClick={() => setDeschis(false)} aria-label="Închide coșul">
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        {randuri.length === 0 ? (
          <div className="sertar-gol">
            <p>Coșul este gol.</p>
            <a className="buton buton-plin" href="/produse">
              Vezi toate ofertele
            </a>
          </div>
        ) : (
          <>
            <div className="sertar-prag">
              {ramas > 0 ? (
                <p>
                  Mai adaugă <strong>{lei(Math.ceil(ramas))}</strong> pentru livrare gratuită.
                </p>
              ) : (
                <p>
                  <strong>Ai livrare gratuită</strong> la această comandă.
                </p>
              )}
              <div className="prag-bara">
                <span style={{ width: `${Math.min(100, (subtotal / PRAG_LIVRARE_GRATUITA) * 100)}%` }} />
              </div>
            </div>

            <ul className="sertar-linii">
              {randuri.map(({ p, cantitate }) => (
                <li key={p.id}>
                  <a className="linie-foto" href={`/produs/${p.id}`}>
                    <img src={`/produse/${p.id}.webp`} alt="" width={160} height={160} loading="lazy" />
                  </a>
                  <div className="linie-info">
                    <a href={`/produs/${p.id}`}>
                      <strong>{p.brand}</strong> {p.nume}
                    </a>
                    <span className="linie-tip">{subtitlu(p)}</span>
                    <span className={`motiv motiv-${p.motiv}`}>{motive[p.motiv].nume}</span>
                    <div className="linie-jos">
                      <div className="cantitate">
                        <button type="button" onClick={() => seteaza(p.id, cantitate - 1)} aria-label="Scade cantitatea">
                          −
                        </button>
                        <span aria-live="polite">{cantitate}</span>
                        <button
                          type="button"
                          onClick={() => seteaza(p.id, cantitate + 1)}
                          disabled={cantitate >= p.stoc}
                          aria-label="Crește cantitatea"
                        >
                          +
                        </button>
                      </div>
                      <span className="linie-pret">{lei(+(p.pret * cantitate).toFixed(2))}</span>
                    </div>
                  </div>
                  <button type="button" className="linie-sterge" onClick={() => seteaza(p.id, 0)} aria-label={`Scoate ${p.brand} ${p.nume}`}>
                    Șterge
                  </button>
                </li>
              ))}
            </ul>

            <footer className="sertar-total">
              <dl>
                <div>
                  <dt>Subtotal</dt>
                  <dd>{lei(+subtotal.toFixed(2))}</dd>
                </div>
                <div>
                  <dt>Livrare prin curier</dt>
                  <dd>{livrare === 0 ? 'Gratuită' : lei(livrare)}</dd>
                </div>
                <div className="total-economie">
                  <dt>Economisești față de prețul de raft</dt>
                  <dd>{lei(Math.round(economisit))}</dd>
                </div>
                <div className="total-final">
                  <dt>Total</dt>
                  <dd>{lei(+(subtotal + livrare).toFixed(2))}</dd>
                </div>
              </dl>
              <a className="buton buton-plin buton-lat" href="/finalizare">
                Finalizează comanda
              </a>
              <p className="sertar-nota">Plată cu cardul sau ramburs la curier. Retur în 14 zile.</p>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
