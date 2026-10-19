// Samler beregningerne: input ind, O1-O4 ud.

import { breakEven } from './breakEven.ts'
import { COMPARISON_MONTHS } from './defaults.ts'
import { investmentReturn, monthlyOutflows } from './investmentReturn.ts'
import { amortizationSchedule, calculateLoan } from './loan.ts'
import { warnings } from './notes.ts'
import { buyTco, leaseTco } from './tco.ts'
import type { Cheapest, ComparisonRow, Inputs, Result } from './types.ts'

export function calculate(inputs: Inputs): Result {
  const loan = calculateLoan(inputs)
  const comparison: ComparisonRow[] = []

  for (const months of COMPARISON_MONTHS.filter((t) => t <= inputs.leaseTermMonths)) {
    const returns = inputs.investDifference
      ? investmentReturn(monthlyOutflows(inputs, loan, months), inputs.annualReturnPct, inputs.returnTaxPct)
      : { buy: 0, lease: 0 }
    const buy = buyTco(inputs, loan, months, returns.buy)
    const lease = leaseTco(inputs, months, returns.lease)
    const difference = buy.total - lease.total
    const cheapest: Cheapest = difference < 0 ? 'buy' : difference > 0 ? 'lease' : 'equal'
    comparison.push({ months, buy, lease, difference, cheapest })
  }

  return {
    comparison,
    breakEven: comparison.map((row) => breakEven(row.months, inputs.purchasePrice, row.buy, row.lease)),
    amortization: amortizationSchedule(loan, inputs.monthlyLoanFee),
    warnings: warnings(inputs),
  }
}
