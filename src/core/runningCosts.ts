// Løbende udgifter (SPEC.md 2.3): beløb med frekvens betales forud.

import type { Frequency, PeriodicAmount } from './types.ts'

const FREQUENCY_MONTHS: Record<Frequency, number> = {
  month: 1,
  quarter: 3,
  halfYear: 6,
  year: 12,
}

/** De mulige frekvenser for I8, I10 og I11. */
export const FREQUENCIES = Object.keys(FREQUENCY_MONTHS) as Frequency[]

export function isFrequency(value: unknown): value is Frequency {
  return typeof value === 'string' && (FREQUENCIES as string[]).includes(value)
}

/** Antal betalinger ved tidspunkt t = t / frekvens i måneder. */
export function paymentCount(frequency: Frequency, months: number): number {
  return months / FREQUENCY_MONTHS[frequency]
}

/** Samlet udgift ved tidspunkt t. */
export function runningCost(cost: PeriodicAmount, months: number): number {
  return cost.amount * paymentCount(cost.frequency, months)
}

/** Beløbet, der forfalder i måned m (0-baseret), da der betales forud. */
export function runningCostDueInMonth(cost: PeriodicAmount, month: number): number {
  return month % FREQUENCY_MONTHS[cost.frequency] === 0 ? cost.amount : 0
}
