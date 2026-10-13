# Flacon Outlet — demo de prezentare

Magazin outlet de parfumuri și cosmetice. Astro 7 + insule React + Tailwind 4, un singur font (Manrope).

```
npm install
npm run dev      # http://localhost:4321
npm run build    # 91 de pagini statice în dist/
```

## Direcția

Structura urmează numitorul comun al Notino, Makeup.ro, Parfimo și Brasty: bară de sus, căutare lată,
meniu închis pe categorii, vitrină, branduri, rail-uri de produse, categorii, panouri, servicii, subsol.
Diferența față de ei: fiecare reducere are un **motiv scris pe produs** (Tester, Cutie deteriorată, Fără
celofan, Ambalaj vechi, Termen scurt, Ultimele bucăți). Negru + alb + un singur roșu, folosit doar pe preț,
procent și logo.

Imaginea din primul slide (`public/hero-outlet.webp`) e generată cu Higgsfield, o singură dată. Celelalte slide-uri
și reclamele folosesc pozele de produs decupate (`.research/decupaj.mjs` scoate fundalul alb).

## Ce merge în demo

- Căutare cu sugestii live (fără diacritice, după brand, nume, tip, motiv).
- Catalog cu filtre: categorie, motivul reducerii, gen, preț, brand, sortare. Filtrele stau în URL.
- Coș lateral: cantități, prag de livrare gratuită, cât economisești. Se păstrează în `localStorage`.
- Pagină de produs cu fișa lotului și explicația motivului.
- Finalizare cu alegerea curierului și a plății, apoi ecran de confirmare.

## Ce e doar mock (`TODO(real)` în cod)

| Unde | Acum | La proiectul real |
| --- | --- | --- |
| `src/data/catalog.ts` | 88 de produse din `produse.json` | catalog, stocuri și prețuri din BaseLinker |
| `src/lib/cos.ts` | coș în `localStorage` | coș pe server, stoc verificat la adăugare |
| `src/components/Finalizare.tsx` | nu se plătește nimic | Netopia / Stripe, AWB la curier, factură prin BaseLinker |
| `src/components/Cauta.tsx` | filtrare în browser | căutare pe server, tolerantă la greșeli |
| `src/pages/index.astro` | abonarea afișează doar mesajul | Resend / Brevo |

## De înlocuit înainte de lansare

- **Pozele și prețurile de produs** sunt preluate de pe makeup.ro ca placeholder de prezentare. Nu se
  publică așa: clientul trimite pozele și lista lui, sau vin din feed-ul distribuitorului.
- Numele „Flacon Outlet”, telefonul, e-mailul, recenziile, codurile de lot și pragul de 250 lei sunt exemple.
- Lipsesc intenționat (nu se fac la preview): SEO, GA4 / Search Console / feed Merchant Center, banner de
  cookie-uri, paginile legale, ANPC + SOL, creditul RTR.

## Pași la implementarea reală

1. Trecere pe Astro hybrid/SSR pe VPS + Coolify (catalog și produs randate la cerere).
2. Integrare BaseLinker: produse, stocuri, comenzi, facturi.
3. Procesator de plăți (Netopia; vezi skill-ul `netopia`) și curieri (Sameday, FAN, Cargus) cu AWB automat.
4. Cont de client, e-mailuri tranzacționale (Resend).
5. Research de cuvinte-cheie RO, on-page, schema `Product`, feed Google Merchant, GA4.
6. Pachet legal, cookie banner, ANPC/SOL.
