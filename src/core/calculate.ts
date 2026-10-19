// Samler beregningerne: input ind, O1-O4 og O10 ud.

import { breakEven } from './breakEven.ts'
import { COMPARISON_MONTHS, DEFAULT_SETTINGS } from './defaults.ts'
import type { Settings } from './defaults.ts'
import { investmentReturn, monthlyOutflows } from './investmentReturn.ts'
import { amortizationSchedule, calculateLoan } from './loan.ts'
import { buyMonthlyCosts, leaseMonthlyCosts } from './monthlyCosts.ts'
import { warnings } from './notes.ts'
import { buyTco, leaseTco } from './tco.ts'
import type { Cheapest, ComparisonRow, Inputs, Result } from './types.ts'

/** Inputs skal komme fra validate(). Settings bruges kun til advarsler; satserne ligger allerede i inputs. */
export function calculate(inputs: Inputs, settings: Settings = DEFAULT_SETTINGS): Result {
  const loan = calculateLoan(inputs)
  const comparison: ComparisonRow[] = []

  for (const months of COMPARISON_MONTHS.filter((t) => t <= inputs.leaseTermMonths)) {
    const returns = investmentReturn(monthlyOutflows(inputs, loan, months), inputs.annualReturnPct, inputs.returnTaxPct)
    const buy = buyTco(inputs, loan, months, returns.buy)
    const lease = leaseTco(inputs, months, returns.lease)
    const difference = buy.total - lease.total
    const cheapest: Cheapest = difference < 0 ? 'buy' : difference > 0 ? 'lease' : 'equal'
    const monthly = { buy: buyMonthlyCosts(inputs, loan, months), lease: leaseMonthlyCosts(inputs, months) }
    comparison.push({ months, buy, lease, difference, cheapest, monthly })
  }

  return {
    comparison,
    breakEven: comparison.map((row) => breakEven(row.months, inputs.purchasePrice, row.buy, row.lease)),
    amortization: amortizationSchedule(loan, inputs.monthlyLoanFee),
    warnings: warnings(inputs, settings),
  }
}
