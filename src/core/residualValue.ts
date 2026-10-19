// Restværdi (SPEC.md 2.2).

import type { DepreciationPct } from './types.ts'
import { fraction, MONTHS_PER_YEAR } from './units.ts'

/** Restværdi efter t mdr. Hvert års procent regnes af restværdien ved årets start. */
export function residualValue(purchasePrice: number, depreciationPct: DepreciationPct, months: number): number {
  const years = months / MONTHS_PER_YEAR
  let value = purchasePrice
  for (let year = 0; year < years; year++) {
    value *= 1 - fraction(depreciationPct[year])
  }
  return value
}
