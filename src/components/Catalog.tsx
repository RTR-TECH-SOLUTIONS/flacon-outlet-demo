import { Fragment, useEffect, useMemo, useState } from 'react';
import { branduri, categorii, motive, produse, reducere, type Categorie, type Motiv, type Produs } from '../data/catalog';
import { lei } from '../lib/format';
import CardProdus from './CardProdus';

type Sortare = 'reducere' | 'pret-mic' | 'pret-mare' | 'nota';

interface Filtre {
  q: string;
  cat: Categorie | '';
  gen: string;
  sub: string;
  motiv: Motiv[];
  brand: string[];
  max: number;
  sort: Sortare;
}

const GOL: Filtre = { q: '', cat: '', gen: '', sub: '', motiv: [], brand: [], max: 0, sort: 'reducere' };
const PRAGURI = [50, 100, 200, 400];
const PE_PAGINA = 20;

const faraDiacritice = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

// Bannerul de sus se schimbă după categorie: culoare, text și produsele decupate.
interface Antet {
  clasa: string;
  titlu: string;
  text: string;
  poze: string[];
  /** Paragraful de la finalul paginii. */
  ghid: string;
}
const ANTETE: Record<string, Antet> = {
  toate: {
    clasa: 'cat-foto',
    titlu: 'Toate ofertele',
    text: 'Tot stocul de outlet, într-un singur loc: parfumuri, machiaj și îngrijire, cu motivul reducerii scris pe fiecare produs.',
    poze: [],
    ghid: 'Stocul se schimbă de două ori pe săptămână, marțea și vinerea, când intră loturile noi de la distribuitori. Ce vezi aici este tot ce avem pe raft în acest moment.',
  },
  parfumuri: {
    clasa: 'cat-inchis',
    titlu: 'Parfumuri',
    text: 'Ape de parfum și de toaletă de la casele mari, ca testere sau cu cutia lovită. Același flacon, alt preț.',
    poze: ['yves-saint-laurent-libre', 'chanel-coco-mademoiselle', 'dior-sauvage', 'paco-rabanne-1-million', 'prada-paradoxe'],
    ghid: 'Un tester este flaconul pe care producătorul îl trimite parfumeriilor pentru raft: plin, cu aceeași concentrație, în cutie albă. La cutiile deteriorate, defectul este doar la ambalaj și îți trimitem poza la cerere înainte de plată.',
  },
  machiaj: {
    clasa: 'cat-roz',
    titlu: 'Machiaj',
    text: 'Fond de ten, rimel și buze de la Lancôme, Estée Lauder, Dior sau Maybelline, din ambalajul vechi ori fără celofan.',
    poze: ['lancome-hypnose-mascara', 'estee-lauder-double-wear-stay-in-place-spf-10', 'dior-addict-lip-maximizer', 'yves-saint-laurent-all-hours-foundation-luminous-matte', 'chanel-les-beiges-eau-de-teint'],
    ghid: 'Produsele de machiaj sunt sigilate și nefolosite. La fondul de ten, nuanța exactă este scrisă pe pagina produsului și pe factură.',
  },
  ten: {
    clasa: 'cat-bleu',
    titlu: 'Îngrijire ten',
    text: 'Seruri, creme și produse de curățare din farmacie. Multe au termen scurt, de aceea ajung la jumătate de preț.',
    poze: ['la-roche-posay-effaclar-serum', 'estee-lauder-advanced-night-repair', 'clinique-moisture-surge-100h-auto-replenishing-hydrator', 'the-ordinary-niacinamide-10-zinc-1', 'la-roche-posay-hyalu-b5-serum'],
    ghid: 'La dermato-cosmetice, data de expirare apare pe pagina fiecărui produs. „Termen scurt” înseamnă mai puțin de șase luni până la expirare, cu produsul sigilat.',
  },
  par: {
    clasa: 'cat-maro',
    titlu: 'Păr',
    text: 'Game de salon: Kérastase, Olaplex, Redken, L’Oréal Professionnel. Flacoane cu grafica veche, formula de acum.',
    poze: ['kerastase-genesis-anti-hair-fall-fortifying-serum', 'kerastase-elixir-ultime-l-huile-originale', 'olaplex-no-7-bonding-oil', 'redken-acidic-bonding-concentrate-conditioner', 'l-oreal-professionnel-absolut-repair-protein-mask'],
    ghid: 'Când un producător schimbă designul flaconului, saloanele returnează stocul vechi. Formula rămâne aceeași, iar produsele ajung la noi sigilate.',
  },
  corp: {
    clasa: 'cat-nisip',
    titlu: 'Corp',
    text: 'Uleiuri, loțiuni și deodorante, inclusiv variantele parfumate de la Dior și Hermès.',
    poze: ['weleda-birch-cellulite-oil', 'nuxe-huile-prodigieuse-florale', 'eucerin-urearepair-plus-lotion-10-urea', 'hermes-terre-d-hermes-deodorant', 'dior-sauvage-deodorant'],
    ghid: 'Produsele de corp sunt sigilate. Cele cu termen scurt au data de expirare scrisă pe pagină și pe factură.',
  },
  seturi: {
    clasa: 'cat-visiniu',
    titlu: 'Seturi cadou',
    text: 'Cutii cu parfum și miniaturi, rămase din sezonul trecut. Cutia are un colț lovit, conținutul este neatins.',
    poze: ['giorgio-armani-acqua-di-gio-pour-homme', 'trussardi-uomo', 'armaf-club-de-nuit-discovery-set'],
    ghid: 'La seturi, defectul este la cutia exterioară. Dacă îl iei de cadou, cere-ne poza bucății tale înainte să plătești.',
  },
  arabesc: {
    clasa: 'cat-auriu',
    titlu: 'Parfumuri arabești',
    text: 'Lattafa, Armaf, Afnan și Al Haramain. Flacoane de 100 ml cu arome orientale, la prețuri de outlet.',
    poze: ['lattafa-eclaire', 'lattafa-khamrah-qahwa', 'lattafa-asad', 'afnan-9-pm-rebel', 'al-haramain-amber-oud-gold-edition'],
    ghid: 'Parfumurile arabești vin de la importatori autorizați din Uniunea Europeană și au codul de lot al producătorului pe fundul flaconului.',
  },
  nisa: {
    clasa: 'cat-inchis',
    titlu: 'Parfumuri de nișă',
    text: 'Creed, Maison Francis Kurkdjian, Xerjoff, Tiziana Terenzi. Puține bucăți, verificate una câte una.',
    poze: ['creed-aventus', 'maison-francis-kurkdjian-baccarat-rouge-540'],
    ghid: 'La parfumurile de nișă avem de obicei una până la trei bucăți din fiecare. Codul de lot este pe pagina produsului.',
  },
  tester: {
    clasa: 'cat-inchis',
    titlu: 'Testere de parfum',
    text: 'Flaconul de pe raftul parfumeriei: plin, original, în cutie albă simplă, uneori fără capac decorativ.',
    poze: ['giorgio-armani-si', 'chanel-coco-mademoiselle', 'dior-sauvage', 'versace-dylan-blue-pour-homme', 'yves-saint-laurent-libre'],
    ghid: 'Testerele nu sunt mostre și nu sunt folosite. Sunt flacoane întregi, trimise de producător pentru expunere, pe care parfumeriile nu le-au mai deschis.',
  },
};

function dinUrl(): Filtre {
  const p = new URLSearchParams(window.location.search);
  return {
    q: p.get('q') ?? '',
    cat: (p.get('cat') as Categorie) ?? '',
    gen: p.get('gen') ?? '',
    sub: p.get('sub') ?? '',
    motiv: (p.get('motiv')?.split(',').filter(Boolean) as Motiv[]) ?? [],
    brand: p.get('brand')?.split(',').filter(Boolean) ?? [],
    max: Number(p.get('max')) || 0,
    sort: (p.get('sort') as Sortare) ?? 'reducere',
  };
}

function inUrl(f: Filtre) {
  const p = new URLSearchParams();
  if (f.q) p.set('q', f.q);
  if (f.cat) p.set('cat', f.cat);
  if (f.gen) p.set('gen', f.gen);
  if (f.sub) p.set('sub', f.sub);
  if (f.motiv.length) p.set('motiv', f.motiv.join(','));
  if (f.brand.length) p.set('brand', f.brand.join(','));
  if (f.max) p.set('max', String(f.max));
  if (f.sort !== 'reducere') p.set('sort', f.sort);
  const sir = p.toString();
  window.history.replaceState(null, '', sir ? `?${sir}` : window.location.pathname);
}

const comuta = <T,>(lista: T[], v: T) => (lista.includes(v) ? lista.filter((x) => x !== v) : [...lista, v]);
const bucati = (n: number, unu: string, multe: string) => `${n} ${n === 1 ? unu : n % 100 >= 20 || n % 100 === 0 ? `de ${multe}` : multe}`;

export default function Catalog() {
  const [f, setF] = useState<Filtre>(GOL);
  const [gata, setGata] = useState(false);
  const [panou, setPanou] = useState(false);
  const [afisate, setAfisate] = useState(PE_PAGINA);

  useEffect(() => {
    setF(dinUrl());
    setGata(true);
  }, []);
  useEffect(() => {
    if (gata) inUrl(f);
  }, [f, gata]);

  const schimba = (bucata: Partial<Filtre>) => {
    setF((v) => ({ ...v, ...bucata }));
    setAfisate(PE_PAGINA);
  };

  const rezultate = useMemo(() => {
    const cuvinte = faraDiacritice(f.q).split(/\s+/).filter(Boolean);
    const lista = produse.filter((p) => {
      if (f.cat && p.categorie !== f.cat) return false;
      if (f.gen && p.gen !== f.gen && p.gen !== 'unisex') return false;
      if (f.sub && p.sub !== f.sub) return false;
      if (f.motiv.length && !f.motiv.includes(p.motiv)) return false;
      if (f.brand.length && !f.brand.includes(p.brand)) return false;
      if (f.max && p.pret > f.max) return false;
      if (cuvinte.length) {
        const text = faraDiacritice(`${p.brand} ${p.nume} ${p.tip} ${motive[p.motiv].nume}`);
        if (!cuvinte.every((c) => text.includes(c))) return false;
      }
      return true;
    });
    const dupa: Record<Sortare, (a: Produs, b: Produs) => number> = {
      reducere: (a, b) => reducere(b) - reducere(a),
      'pret-mic': (a, b) => a.pret - b.pret,
      'pret-mare': (a, b) => b.pret - a.pret,
      nota: (a, b) => b.nota - a.nota || b.recenzii - a.recenzii,
    };
    return lista.sort(dupa[f.sort]);
  }, [f]);

  const inCat = (p: Produs) => !f.cat || p.categorie === f.cat;
  const numarPe = (test: (p: Produs) => boolean) => produse.filter(test).length;
  const brandVizibile = f.cat ? branduri.filter((b) => produse.some((p) => p.brand === b && p.categorie === f.cat)) : branduri;

  // ce banner arătăm: căutarea și filtrele libere primesc banda simplă
  const cheie = f.q
    ? ''
    : f.sub === 'arabesc' || f.sub === 'nisa'
      ? f.sub
      : f.cat
        ? f.cat
        : f.motiv.length === 1 && f.motiv[0] === 'tester'
          ? 'tester'
          : f.motiv.length || f.max || f.brand.length || f.gen
            ? ''
            : 'toate';
  const antet = cheie ? ANTETE[cheie] : null;
  const titlu = f.q
    ? `Rezultate pentru „${f.q}”`
    : antet
      ? antet.titlu
      : f.brand.length === 1 && !f.motiv.length && !f.max
        ? f.brand[0]
        : f.motiv.length === 1
          ? motive[f.motiv[0]].nume
          : f.max
            ? `Sub ${f.max} lei`
            : 'Oferte filtrate';
  const subtitlu = antet
    ? antet.text
    : f.motiv.length === 1 && !f.q
      ? motive[f.motiv[0]].detaliu
      : 'Toate produsele sunt originale, cu factură și cod de lot verificabil.';

  // scurtături sub banner: depind de unde ești
  const scurtaturi: { nume: string; activ: boolean; numar: number; apasa: () => void }[] =
    f.cat === ''
      ? categorii.map((c) => ({
          nume: c.nume,
          activ: false,
          numar: numarPe((p) => p.categorie === c.id),
          apasa: () => schimba({ cat: c.id, sub: '', brand: [] }),
        }))
      : f.cat === 'parfumuri'
        ? [
            { nume: 'Damă', activ: f.gen === 'dama', numar: numarPe((p) => p.categorie === 'parfumuri' && p.gen !== 'barbati'), apasa: () => schimba({ gen: f.gen === 'dama' ? '' : 'dama' }) },
            { nume: 'Bărbați', activ: f.gen === 'barbati', numar: numarPe((p) => p.categorie === 'parfumuri' && p.gen !== 'dama'), apasa: () => schimba({ gen: f.gen === 'barbati' ? '' : 'barbati' }) },
            { nume: 'Arabești', activ: f.sub === 'arabesc', numar: numarPe((p) => p.sub === 'arabesc'), apasa: () => schimba({ sub: f.sub === 'arabesc' ? '' : 'arabesc' }) },
            { nume: 'De nișă', activ: f.sub === 'nisa', numar: numarPe((p) => p.sub === 'nisa'), apasa: () => schimba({ sub: f.sub === 'nisa' ? '' : 'nisa' }) },
            { nume: 'Testere', activ: f.motiv.includes('tester'), numar: numarPe((p) => p.categorie === 'parfumuri' && p.motiv === 'tester'), apasa: () => schimba({ motiv: comuta(f.motiv, 'tester') }) },
            { nume: 'Sub 200 lei', activ: f.max === 200, numar: numarPe((p) => p.categorie === 'parfumuri' && p.pret <= 200), apasa: () => schimba({ max: f.max === 200 ? 0 : 200 }) },
          ]
        : (Object.keys(motive) as Motiv[])
            .map((m) => ({
              nume: motive[m].nume,
              activ: f.motiv.includes(m),
              numar: numarPe((p) => p.categorie === f.cat && p.motiv === m),
              apasa: () => schimba({ motiv: comuta(f.motiv, m) }),
            }))
            .filter((s) => s.numar > 0);

  // filtrele alese, ca etichete care se pot scoate una câte una
  const alese: { nume: string; scoate: () => void }[] = [
    ...(f.q ? [{ nume: `„${f.q}”`, scoate: () => schimba({ q: '' }) }] : []),
    ...(f.gen ? [{ nume: f.gen === 'dama' ? 'Damă' : 'Bărbați', scoate: () => schimba({ gen: '' }) }] : []),
    ...(f.sub && f.cat ? [{ nume: f.sub === 'arabesc' ? 'Arabești' : 'De nișă', scoate: () => schimba({ sub: '' }) }] : []),
    ...f.motiv.map((m) => ({ nume: motive[m].nume, scoate: () => schimba({ motiv: f.motiv.filter((x) => x !== m) }) })),
    ...f.brand.map((b) => ({ nume: b, scoate: () => schimba({ brand: f.brand.filter((x) => x !== b) }) })),
    ...(f.max ? [{ nume: `Sub ${f.max} lei`, scoate: () => schimba({ max: 0 }) }] : []),
  ];
  const sterge = () => {
    setF({ ...GOL, cat: f.cat, sort: f.sort });
    setAfisate(PE_PAGINA);
  };

  const vizibile = rezultate.slice(0, afisate);
  const testere = produse.filter((p) => p.motiv === 'tester');
  const arabesti = produse.filter((p) => p.sub === 'arabesc');
  // reclama din grilă nu repetă pagina pe care ești deja
  const reclama = f.motiv.includes('tester') || f.sub === 'arabesc' ? null : f.cat === 'parfumuri' || f.cat === '' ? 'testere' : 'arabesti';
  const cuReclama = !f.q && reclama && rezultate.length >= 10;

  return (
    <div className="catalog">
      <header className={antet ? `cat-antet ${antet.clasa}` : 'cat-antet cat-simplu'}>
        {antet?.clasa === 'cat-foto' && <img className="cat-antet-foto" src="/hero-outlet.webp" alt="" />}
        <div className="cat-antet-text">
          <nav className="firimituri" aria-label="Ești aici">
            <a href="/">Acasă</a>
            {f.cat || f.q || alese.length ? <a href="/produse">Toate ofertele</a> : null}
            {f.sub && f.cat ? <a href={`/produse?cat=${f.cat}`}>{categorii.find((c) => c.id === f.cat)!.nume}</a> : null}
            <span aria-current="page">{titlu}</span>
          </nav>
          <h1>{titlu}</h1>
          <p>{subtitlu}</p>
          <p className="cat-antet-numar">
            {bucati(rezultate.length, 'ofertă', 'oferte')}
            {rezultate.length > 0 && <> · de la {lei(Math.min(...rezultate.map((p) => p.pret)))} · până la -{Math.max(...rezultate.map(reducere))}%</>}
          </p>
        </div>
        {antet && antet.poze.length > 0 && (
          <div className="cat-antet-poze" aria-hidden="true">
            {antet.poze.map((id) => (
              <img key={id} src={`/decupaj/${id}.webp`} alt="" />
            ))}
          </div>
        )}
      </header>

      {scurtaturi.length > 0 && (
        <div className="cat-scurtaturi" role="group" aria-label="Scurtături">
          {scurtaturi.map((s) => (
            <button key={s.nume} type="button" className={s.activ ? 'scurtatura scurtatura-activa' : 'scurtatura'} aria-pressed={s.activ} onClick={s.apasa}>
              {s.nume}
              <small>{s.numar}</small>
            </button>
          ))}
        </div>
      )}

      <div className="catalog-corp">
        <aside className={panou ? 'filtre filtre-deschise' : 'filtre'} aria-label="Filtre">
          <details open>
            <summary>Categorie</summary>
            <label className="optiune">
              <input type="radio" name="cat" checked={f.cat === ''} onChange={() => schimba({ cat: '', sub: '' })} />
              <span>Toate</span>
              <small>{produse.length}</small>
            </label>
            {categorii.map((c) => (
              <label className="optiune" key={c.id}>
                <input type="radio" name="cat" checked={f.cat === c.id} onChange={() => schimba({ cat: c.id, sub: '', brand: [] })} />
                <span>{c.nume}</span>
                <small>{numarPe((p) => p.categorie === c.id)}</small>
              </label>
            ))}
          </details>

          <details open>
            <summary>De ce e redus</summary>
            {(Object.keys(motive) as Motiv[]).map((m) => {
              const n = numarPe((p) => p.motiv === m && inCat(p));
              return (
                <label className={n === 0 ? 'optiune optiune-goala' : 'optiune'} key={m}>
                  <input type="checkbox" checked={f.motiv.includes(m)} disabled={n === 0} onChange={() => schimba({ motiv: comuta(f.motiv, m) })} />
                  <span>{motive[m].nume}</span>
                  <small>{n}</small>
                </label>
              );
            })}
          </details>

          {(f.cat === '' || f.cat === 'parfumuri') && (
            <details open>
              <summary>Pentru</summary>
              {[
                ['', 'Oricine'],
                ['dama', 'Damă'],
                ['barbati', 'Bărbați'],
              ].map(([v, eticheta]) => (
                <label className="optiune" key={v}>
                  <input type="radio" name="gen" checked={f.gen === v} onChange={() => schimba({ gen: v })} />
                  <span>{eticheta}</span>
                </label>
              ))}
            </details>
          )}

          <details open>
            <summary>Preț outlet</summary>
            <label className="optiune">
              <input type="radio" name="max" checked={f.max === 0} onChange={() => schimba({ max: 0 })} />
              <span>Orice preț</span>
            </label>
            {PRAGURI.map((v) => (
              <label className="optiune" key={v}>
                <input type="radio" name="max" checked={f.max === v} onChange={() => schimba({ max: v })} />
                <span>Sub {v} lei</span>
                <small>{numarPe((p) => p.pret <= v && inCat(p))}</small>
              </label>
            ))}
          </details>

          <details open>
            <summary>Brand</summary>
            <div className="filtre-lista">
              {brandVizibile.map((b) => (
                <label className="optiune" key={b}>
                  <input type="checkbox" checked={f.brand.includes(b)} onChange={() => schimba({ brand: comuta(f.brand, b) })} />
                  <span>{b}</span>
                  <small>{numarPe((p) => p.brand === b && inCat(p))}</small>
                </label>
              ))}
            </div>
          </details>
        </aside>

        <div className="catalog-lista">
          <div className="catalog-bara">
            <button type="button" className="buton buton-contur doar-mobil" onClick={() => setPanou(!panou)} aria-expanded={panou}>
              Filtre{alese.length > 0 && ` (${alese.length})`}
            </button>
            <div className="alese">
              {alese.map((a) => (
                <button key={a.nume} type="button" className="ales" onClick={a.scoate} aria-label={`Scoate filtrul ${a.nume}`}>
                  {a.nume}
                  <svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true">
                    <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              ))}
              {alese.length > 1 && (
                <button type="button" className="filtre-sterge" onClick={sterge}>
                  Șterge toate
                </button>
              )}
            </div>
            <label className="sortare">
              <span>Ordonează</span>
              <select value={f.sort} onChange={(e) => schimba({ sort: e.target.value as Sortare })}>
                <option value="reducere">Reducerea cea mai mare</option>
                <option value="pret-mic">Preț crescător</option>
                <option value="pret-mare">Preț descrescător</option>
                <option value="nota">Cel mai bine notate</option>
              </select>
            </label>
          </div>

          {rezultate.length === 0 ? (
            <div className="catalog-gol">
              <p>Niciun produs nu se potrivește cu filtrele alese.</p>
              <button type="button" className="buton buton-plin" onClick={sterge}>
                Șterge filtrele
              </button>
            </div>
          ) : (
            <>
              <div className="grila">
                {vizibile.map((p, i) => (
                  <Fragment key={p.id}>
                    {cuReclama && i === 5 && reclama === 'testere' && (
                      <a className="grila-reclama grila-reclama-testere" href="/produse?motiv=tester">
                        <span>
                          <small>Testere de parfum</small>
                          <strong>Flaconul de pe raft, până la -{Math.max(...testere.map(reducere))}%</strong>
                          <em>Vezi cele {testere.length} testere</em>
                        </span>
                        <img src="/decupaj/dior-sauvage.webp" alt="" loading="lazy" />
                        <img src="/decupaj/chanel-coco-mademoiselle.webp" alt="" loading="lazy" />
                      </a>
                    )}
                    {cuReclama && i === 5 && reclama === 'arabesti' && (
                      <a className="grila-reclama grila-reclama-arabesc" href="/produse?cat=parfumuri&sub=arabesc">
                        <span>
                          <small>Parfumuri arabești</small>
                          <strong>100 ml de la {lei(Math.min(...arabesti.map((p) => p.pret)))}</strong>
                          <em>Vezi cele {arabesti.length} oferte</em>
                        </span>
                        <img src="/decupaj/lattafa-asad.webp" alt="" loading="lazy" />
                        <img src="/decupaj/lattafa-khamrah-qahwa.webp" alt="" loading="lazy" />
                      </a>
                    )}
                    <CardProdus produs={p} prioritar={i < 8} />
                  </Fragment>
                ))}
              </div>

              <div className="catalog-mai-mult">
                <p>
                  Ai văzut {vizibile.length} din {bucati(rezultate.length, 'ofertă', 'oferte')}
                </p>
                <div className="prag-bara">
                  <span style={{ width: `${(vizibile.length / rezultate.length) * 100}%` }} />
                </div>
                {vizibile.length < rezultate.length && (
                  <button type="button" className="buton buton-contur" onClick={() => setAfisate(afisate + PE_PAGINA)}>
                    Arată încă {Math.min(PE_PAGINA, rezultate.length - vizibile.length)}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {antet && (
        <section className="cat-ghid">
          <h2>Ce trebuie să știi despre {antet.titlu.toLowerCase()}</h2>
          <p>{antet.ghid}</p>
        </section>
      )}
    </div>
  );
}
