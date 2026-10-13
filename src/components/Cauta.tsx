import { useEffect, useMemo, useRef, useState } from 'react';
import { motive, produse, reducere, subtitlu } from '../data/catalog';
import { lei } from '../lib/format';

const faraDiacritice = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

const index = produse.map((p) => ({ p, text: faraDiacritice(`${p.brand} ${p.nume} ${p.tip} ${motive[p.motiv].nume}`) }));

// TODO(real): căutarea rulează pe server (Meilisearch / Postgres full-text), cu toleranță la greșeli.
export default function Cauta() {
  const [termen, setTermen] = useState('');
  const [activ, setActiv] = useState(false);
  const cutie = useRef<HTMLFormElement>(null);

  const gasite = useMemo(() => {
    const cuvinte = faraDiacritice(termen).split(/\s+/).filter(Boolean);
    if (cuvinte.length === 0) return [];
    return index.filter((i) => cuvinte.every((c) => i.text.includes(c))).map((i) => i.p);
  }, [termen]);

  useEffect(() => {
    const afara = (e: MouseEvent) => {
      if (!cutie.current?.contains(e.target as Node)) setActiv(false);
    };
    document.addEventListener('mousedown', afara);
    return () => document.removeEventListener('mousedown', afara);
  }, []);

  const arata = activ && termen.trim().length > 1;

  return (
    <form
      ref={cutie}
      className="cauta"
      role="search"
      action="/produse"
      onKeyDown={(e) => e.key === 'Escape' && setActiv(false)}
    >
      <label className="sr-only" htmlFor="cauta-camp">
        Caută un produs sau un brand
      </label>
      <input
        id="cauta-camp"
        name="q"
        type="search"
        autoComplete="off"
        placeholder="Caută un parfum, un brand, un produs"
        value={termen}
        onChange={(e) => {
          setTermen(e.target.value);
          setActiv(true);
        }}
        onFocus={() => setActiv(true)}
      />
      <button type="submit" aria-label="Caută">
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <path d="M16 16l4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>

      {arata && (
        <div className="cauta-rezultate">
          {gasite.length === 0 ? (
            <p className="cauta-gol">Nu am găsit nimic pentru „{termen.trim()}”. Încearcă numele brandului.</p>
          ) : (
            <>
              <ul>
                {gasite.slice(0, 6).map((p) => (
                  <li key={p.id}>
                    <a href={`/produs/${p.id}`}>
                      <img src={`/produse/${p.id}.webp`} alt="" width={96} height={96} />
                      <span className="cauta-nume">
                        <strong>{p.brand}</strong> {p.nume}
                        <small>
                          {subtitlu(p)} · {motive[p.motiv].nume}
                        </small>
                      </span>
                      <span className="cauta-pret">
                        {lei(p.pret)}
                        <small>-{reducere(p)}%</small>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
              <a className="cauta-toate" href={`/produse?q=${encodeURIComponent(termen.trim())}`}>
                Vezi toate cele {gasite.length} {gasite.length >= 20 ? 'de rezultate' : 'rezultate'}
              </a>
            </>
          )}
        </div>
      )}
    </form>
  );
}
