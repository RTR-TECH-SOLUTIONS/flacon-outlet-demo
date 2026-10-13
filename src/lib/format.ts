const cuZecimale = new Intl.NumberFormat('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const intreg = new Intl.NumberFormat('ro-RO', { maximumFractionDigits: 0 });

/** 342 → „342 lei", 29.99 → „29,99 lei". */
export const lei = (v: number) => `${Number.isInteger(v) ? intreg.format(v) : cuZecimale.format(v)} lei`;

export const PRAG_LIVRARE_GRATUITA = 250;
export const COST_LIVRARE = 19.99;
