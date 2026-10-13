import brut from './produse.json';

export type Motiv = 'tester' | 'cutie' | 'celofan' | 'ambalaj' | 'termen' | 'ultimele';
export type Categorie = 'parfumuri' | 'machiaj' | 'ten' | 'par' | 'corp' | 'seturi';

export interface Produs {
  id: string;
  brand: string;
  nume: string;
  tip: string;
  categorie: Categorie;
  sub: 'arabesc' | 'nisa' | null;
  gen: 'dama' | 'barbati' | 'unisex' | null;
  ml: number | null;
  pretRaft: number;
  pret: number;
  motiv: Motiv;
  stoc: number;
  nota: number;
  recenzii: number;
  nou: boolean;
  termen: string | null;
}

// TODO(real): catalogul vine din BaseLinker (stocuri + prețuri), nu din fișier.
export const produse = brut as Produs[];

export const categorii: { id: Categorie; nume: string; scurt: string }[] = [
  { id: 'parfumuri', nume: 'Parfumuri', scurt: 'Apă de parfum, apă de toaletă, testere' },
  { id: 'machiaj', nume: 'Machiaj', scurt: 'Fond de ten, rimel, buze' },
  { id: 'ten', nume: 'Îngrijire ten', scurt: 'Seruri, creme, curățare' },
  { id: 'par', nume: 'Păr', scurt: 'Șampon, măști, uleiuri' },
  { id: 'corp', nume: 'Corp', scurt: 'Deodorante, loțiuni, duș' },
  { id: 'seturi', nume: 'Seturi cadou', scurt: 'Cutii și miniaturi' },
];

// Motivul reducerii e scris pe fiecare produs: clientul vede de ce e mai ieftin.
export const motive: Record<Motiv, { nume: string; scurt: string; detaliu: string }> = {
  tester: {
    nume: 'Tester',
    scurt: 'Flacon de raft, plin, în cutie albă',
    detaliu:
      'Flaconul trimis de producător pentru rafturile parfumeriilor. Este plin și are același conținut ca varianta de vânzare. Vine în cutie albă simplă, uneori fără capac decorativ.',
  },
  cutie: {
    nume: 'Cutie deteriorată',
    scurt: 'Colț lovit sau cutie zgâriată la transport',
    detaliu:
      'Cutia are un colț lovit, o zgârietură sau o urmă de etichetă. Produsul din interior este nou, sigilat și nefolosit. Fotografiem defectul la cerere înainte de comandă.',
  },
  celofan: {
    nume: 'Fără celofan',
    scurt: 'Folia exterioară lipsește, produsul e nefolosit',
    detaliu:
      'Folia de celofan a fost ruptă sau scoasă în depozit. Cutia și produsul sunt intacte, iar flaconul nu a fost pulverizat.',
  },
  ambalaj: {
    nume: 'Ambalaj vechi',
    scurt: 'Design de cutie înlocuit de producător',
    detaliu:
      'Producătorul a schimbat grafica ambalajului, iar magazinele au scos de pe raft varianta anterioară. Formula este aceeași.',
  },
  termen: {
    nume: 'Termen scurt',
    scurt: 'Expiră în mai puțin de 6 luni',
    detaliu:
      'Produsul este sigilat și în termen, dar data de expirare este aproape. Data exactă este scrisă pe pagina produsului și pe factură.',
  },
  ultimele: {
    nume: 'Ultimele bucăți',
    scurt: 'Rest de lot, nu se mai aduce',
    detaliu:
      'Au rămas câteva bucăți dintr-un lot pe care nu îl mai reaprovizionăm. Produsul este nou și sigilat.',
  },
};

export const reducere = (p: Produs) => Math.round((1 - p.pret / p.pretRaft) * 100);
export const economie = (p: Produs) => Math.round(p.pretRaft - p.pret);
export const titlu = (p: Produs) => `${p.brand} ${p.nume}`;
export const subtitlu = (p: Produs) => (p.ml ? `${p.tip}, ${p.ml} ml` : p.tip);
export const genNume = { dama: 'Damă', barbati: 'Bărbați', unisex: 'Unisex' } as const;

export const dupaReducere = [...produse].sort((a, b) => reducere(b) - reducere(a));
export const branduri = [...new Set(produse.map((p) => p.brand))].sort((a, b) => a.localeCompare(b, 'ro'));

// Logouri oficiale (SVG de pe Wikimedia Commons), doar pentru brandurile care au unul verificat.
const cuLogo = ['Chanel', 'Dior', 'Yves Saint Laurent', 'Versace', 'Lancôme', 'Paco Rabanne', 'Giorgio Armani', 'Prada', 'Givenchy', 'Valentino', 'Hugo Boss', 'Hermès', 'Carolina Herrera', 'La Roche-Posay', 'Clinique'];
const slugBrand = (b: string) =>
  b
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');
export const branduriCuLogo = cuLogo.filter((b) => produse.some((p) => p.brand === b));
export const logoBrand = (b: string) => (cuLogo.includes(b) ? `/logo/${slugBrand(b)}.svg` : null);
