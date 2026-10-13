import { motive, reducere, type Produs } from '../data/catalog';
import { lei } from '../lib/format';

interface Props {
  produs: Produs;
  /** Primele carduri de pe pagină se încarcă imediat, restul leneș. */
  prioritar?: boolean;
}

const STEA = 'M10 1.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.6 7.7l5.8-.8z';
const stele = [0, 1, 2, 3, 4].map((i) => <path key={i} d={STEA} transform={`translate(${i * 20} 0)`} />);

/** „100 ml (3,02 lei / 1 ml)", ca pe eticheta de raft. */
export const pretPeMl = (p: Produs) =>
  p.ml ? `${p.ml} ml (${(p.pret / p.ml).toFixed(2).replace('.', ',')} lei / 1 ml)` : null;

// Randat și pe server (rail-uri), și în insula de catalog. Butoanele nu au handler
// propriu: le prinde ascultătorul delegat din layout (`data-adauga`, `data-favorit`).
export default function CardProdus({ produs: p, prioritar = false }: Props) {
  const putine = p.stoc <= 3;
  return (
    <article className="card">
      <div className="card-foto">
        <a href={`/produs/${p.id}`} tabIndex={-1} aria-hidden="true">
          <img
            src={`/produse/${p.id}.webp`}
            alt=""
            width={640}
            height={640}
            loading={prioritar ? 'eager' : 'lazy'}
            decoding="async"
          />
        </a>
        <span className="card-steaguri">
          <b className="steag steag-rosu">-{reducere(p)}%</b>
          {p.nou && <b className="steag">Nou</b>}
        </span>
        <button type="button" className="card-inima" data-favorit aria-pressed="false" aria-label={`Adaugă la favorite ${p.brand} ${p.nume}`}>
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <path d="M12 20s-7-4.4-7-9.6A3.9 3.9 0 0 1 12 8a3.9 3.9 0 0 1 7 2.4C19 15.6 12 20 12 20z" />
          </svg>
        </button>
        <span className="card-motiv">{motive[p.motiv].nume}</span>
        <button type="button" className="card-adauga" data-adauga={p.id} data-stoc={p.stoc} aria-label={`Adaugă în coș ${p.brand} ${p.nume}`}>
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path d="M5 8h14l-1.2 11.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8L5 8zm4 0V6.5a3 3 0 0 1 6 0V8" />
          </svg>
          <span>Adaugă în coș</span>
        </button>
      </div>
      <div className="card-corp">
        <a className="card-titlu" href={`/produs/${p.id}`}>
          <span className="card-brand">{p.brand}</span>
          <span className="card-nume">{p.nume}</span>
        </a>
        <p className="card-tip">{p.tip}</p>
        <p className="card-nota" aria-label={`Nota ${p.nota.toFixed(1).replace('.', ',')} din 5, ${p.recenzii} păreri`}>
          <span className="stele" aria-hidden="true">
            <svg viewBox="0 0 100 20" width="60" height="12">
              {stele}
            </svg>
            <svg viewBox="0 0 100 20" width="60" height="12" style={{ clipPath: `inset(0 ${100 - (p.nota / 5) * 100}% 0 0)` }}>
              {stele}
            </svg>
          </span>
          <span aria-hidden="true">({p.recenzii})</span>
        </p>
        <p className="card-pret">
          <span className="pret-outlet">{lei(p.pret)}</span>
          <span className="pret-raft">
            <span className="sr-only">Preț de raft: </span>
            {lei(p.pretRaft)}
          </span>
        </p>
        {pretPeMl(p) && <p className="card-mic">{pretPeMl(p)}</p>}
        {p.termen && <p className="card-mic">Expiră în {p.termen}</p>}
        {putine && <p className="card-mic stoc-putin">{p.stoc === 1 ? 'Ultima bucată' : `Ultimele ${p.stoc} bucăți`}</p>}
      </div>
    </article>
  );
}
