# Lån eller leasing

Webapp der sammenligner de samlede omkostninger (TCO) ved køb af en bil med billån og ved privatleasing af samme bil. Forretningsreglerne står i [`SPEC.md`](SPEC.md), som er facit.

Online: https://bhojland-dev.github.io/loan-or-lease/

## Struktur

- `src/core/` – beregningsmotoren. Ren TypeScript uden React eller browser-API'er, så den kan genbruges, fx i en iOS-app.
  - `createDefaultDraft()` giver startværdier, `validate()` gør input klar, og `calculate()` giver resultatet.
  - `defaults.ts` – alle standardværdier og satser i ét `Settings`-objekt. Skal satserne komme fra en API, hentes de uden for motoren og sendes ind.
  - `fields.ts` – reglerne for hvert talfelt (id i SPEC.md, gælder ved lån, gyldighed, fejlbesked).
  - Én fil pr. formel: `loan.ts`, `residualValue.ts`, `runningCosts.ts`, `tco.ts`, `investmentReturn.ts`, `breakEven.ts`, `monthlyCosts.ts`.
  - `examples.ts` – navngivne regneeksempler, som testene bruger som facit.
- `src/ui/` – React-brugerfladen. Den regner ikke selv, men kalder `src/core`.
  - `useFormState.ts` – formularens tilstand; `form.ts` – rene overgange og gemning i browseren.
  - `fieldText.ts` – etiketter, enheder og hjælpetekster for hvert felt.
  - `cards/` – ét kort pr. del af formularen; `results/` – én fil pr. del af resultatet.
  - `styles/` – CSS delt efter emne; `tokens.css` har farver og fonte.

Et nyt talfelt tilføjes i `types.ts` (`InputDraft` og `Inputs`), `fields.ts`, `fieldText.ts`, evt. `DEFAULT_SETTINGS` og det kort, det skal stå på.

## Kom i gang

```bash
npm install
npm run dev     # udviklingsserver på http://localhost:5173/loan-or-lease/
npm test        # tests (Vitest)
npm run lint    # oxlint
npm run build   # typecheck og produktionsbuild til dist/
```

Deployes automatisk til GitHub Pages via GitHub Actions ved push til `main`. Workflowet kører testene før build.
