// Små omregninger, der bruges i flere formler.

export const MONTHS_PER_YEAR = 12

/** Procent til brøk: 6 → 0,06. */
export function fraction(percent: number): number {
  return percent / 100
}

/** Årlig sats i procent til månedlig sats som brøk: 6 → 0,005. */
export function monthlyRate(annualPercent: number): number {
  return fraction(annualPercent) / MONTHS_PER_YEAR
}
