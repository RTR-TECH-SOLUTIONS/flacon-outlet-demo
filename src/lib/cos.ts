// Coș ținut în localStorage, ca demo-ul să meargă fără server.
// TODO(real): coșul și comanda trec prin backend (stoc verificat în BaseLinker la adăugare).

export interface Linie {
  id: string;
  cantitate: number;
}

const CHEIE = 'flacon-cos';
const EVENIMENT = 'cos:schimbat';

export function citesteCos(): Linie[] {
  try {
    const brut = localStorage.getItem(CHEIE);
    return brut ? (JSON.parse(brut) as Linie[]) : [];
  } catch {
    return [];
  }
}

function scrieCos(linii: Linie[]) {
  try {
    localStorage.setItem(CHEIE, JSON.stringify(linii));
  } catch {
    // modul privat: coșul trăiește doar cât pagina
  }
  window.dispatchEvent(new CustomEvent(EVENIMENT, { detail: linii }));
}

export function adauga(id: string, maxim: number, cantitate = 1) {
  const linii = citesteCos();
  const linie = linii.find((l) => l.id === id);
  if (linie) linie.cantitate = Math.min(maxim, linie.cantitate + cantitate);
  else linii.push({ id, cantitate: Math.min(maxim, cantitate) });
  scrieCos(linii);
}

export function seteaza(id: string, cantitate: number) {
  const linii = citesteCos()
    .map((l) => (l.id === id ? { ...l, cantitate } : l))
    .filter((l) => l.cantitate > 0);
  scrieCos(linii);
}

export function golesteCos() {
  scrieCos([]);
}

export function ascultaCos(fn: (linii: Linie[]) => void) {
  const laSchimbare = () => fn(citesteCos());
  window.addEventListener(EVENIMENT, laSchimbare);
  window.addEventListener('storage', laSchimbare);
  return () => {
    window.removeEventListener(EVENIMENT, laSchimbare);
    window.removeEventListener('storage', laSchimbare);
  };
}

export const DESCHIDE_COS = 'cos:deschide';
