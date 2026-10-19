// Break-even (SPEC.md 2.7).

import type { BreakEvenRow, BuyBreakdown, LeaseBreakdown } from './types.ts'

export function breakEven(
  months: number,
  purchasePrice: number,
  buy: BuyBreakdown,
  lease: LeaseBreakdown,
): BreakEvenRow {
  // TCO køb uden restværdi − TCO leasing
  const breakEvenResidualValue = buy.total + buy.residualValue - lease.total
  return {
    months,
    breakEvenResidualValue,
    breakEvenDepreciation: 1 - breakEvenResidualValue / purchasePrice,
    expectedDepreciation: 1 - buy.residualValue / purchasePrice,
  }
}

/** Køb er billigst, når det forventede værditab er mindre end break-even. */
export function buyIsCheaperAtBreakEven(row: BreakEvenRow): boolean {
  return row.expectedDepreciation < row.breakEvenDepreciation
}
