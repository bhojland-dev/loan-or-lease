# Loan or Lease

Webapp der sammenligner TCO for køb (med billån) og privatleasing af samme bil.
Al forretningslogik er beskrevet i `SPEC.md`. Den er facit: følg den præcist, og spørg Brian, hvis noget er uklart eller mangler, i stedet for at gætte.

## Teknologi

- Vite + React + TypeScript
- Vitest til tests
- Hosting: GitHub Pages via GitHub Actions
- En iOS-version kan komme senere. Beregningsmotoren skal derfor kunne genbruges uden UI.

## Struktur

- `src/core/` – beregningsmotoren. Ren TypeScript uden React, DOM eller browser-API'er. Input (I1-I22) ind, output (O1-O3 + advarsler) ud.
- `src/core/*.test.ts` – tests for hver formel i SPEC.md (B1-B6, restværdi, løbende udgifter, TCO køb, TCO leasing, afkast, break-even). Brug navngivne regneeksempler, så de kan genbruges til en senere iOS-version.
- `src/ui/` – React-komponenter. Ingen beregninger her; UI kalder kun `src/core`.

## Konventioner

- Brugerfladen er på dansk.
- Beløb vises i kr. med dansk formatering (fx 1.234,50 kr.), procenter med komma.
- Alle standardværdier fra SPEC.md samles ét sted (`src/core/defaults.ts`) med kilde og årstal i kommentar.
- Noter og advarsler (O4-O7) vises ved de relevante felter.

## GitHub

- Repo: `bhojland-dev/loan-or-lease` (offentligt, krævet for GitHub Pages på gratis konto).
- Opret med `gh repo create bhojland-dev/loan-or-lease --public --source=. --remote=origin`.
- Vite `base` skal være `/loan-or-lease/`.
- Deploy til GitHub Pages via GitHub Actions ved push til `main`. Kør tests i workflowet før build.

## Arbejdsgang

- Tag ét trin ad gangen, så Brian kan verificere før næste trin.
- Forslag til første trin: projektopsætning, git og GitHub-repo. Derefter beregningsmotoren med tests. Til sidst UI og deploy.
- Spørg før push til GitHub og før ændringer i SPEC.md.
