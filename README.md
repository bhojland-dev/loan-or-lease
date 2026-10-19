# Lån eller leasing

Webapp der sammenligner de samlede omkostninger (TCO) ved køb af en bil med billån og ved privatleasing af samme bil. Forretningsreglerne står i [`SPEC.md`](SPEC.md), som er facit.

Online: https://bhojland-dev.github.io/loan-or-lease/

## Struktur

- `src/core/` – beregningsmotoren. Ren TypeScript uden React eller browser-API'er, så den kan genbruges, fx i en iOS-app. `validate()` gør input klar, og `calculate()` giver resultatet.
- `src/core/examples.ts` – navngivne regneeksempler, som testene bruger som facit.
- `src/ui/` – React-brugerfladen. Den regner ikke selv, men kalder `src/core`.

## Kom i gang

```bash
npm install
npm run dev     # udviklingsserver på http://localhost:5173/loan-or-lease/
npm test        # tests (Vitest)
npm run lint    # oxlint
npm run build   # typecheck og produktionsbuild til dist/
```

Deployes automatisk til GitHub Pages via GitHub Actions ved push til `main`. Workflowet kører testene før build.
