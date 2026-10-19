// Afkast (SPEC.md 2.6): det billigste scenarie i en måned indskyder forskellen på sin konto.

import { interestInPayment } from './loan.ts'
import { runningCostDueInMonth } from './runningCosts.ts'
import type { Inputs, Loan } from './types.ts'

export interface MonthlyOutflows {
  buy: number[]
  lease: number[]
}

export interface InvestmentReturn {
  buy: number
  lease: number
}

/**
 * Udgiften i hver måned m = 0 … t − 1 i begge scenarier.
 * Måned m dækker perioden fra m til m + 1: forudbetalinger falder i starten af måneden og
 * låneydelse nr. m + 1 (bagud) i slutningen, fratrukket rentefradraget for den ydelse.
 * Engangsbeløb ved t (restgæld og egenbetaling ved aflevering) indgår ikke.
 */
export function monthlyOutflows(inputs: Inputs, loan: Loan, months: number): MonthlyOutflows {
  const buy: number[] = []
  const lease: number[] = []
  for (let m = 0; m < months; m++) {
    const shared = runningCostDueInMonth(inputs.insurance, m) + runningCostDueInMonth(inputs.ownershipTax, m)
    buy.push(
      (m === 0 ? inputs.downPayment : 0) +
        (m < loan.termMonths ? loan.monthlyPayment - (interestInPayment(loan, m + 1) * inputs.interestDeductionPct) / 100 : 0) +
        runningCostDueInMonth(inputs.service, m) +
        shared,
    )
    lease.push((m === 0 ? inputs.leaseInitialPayment : 0) + inputs.leaseMonthlyPayment + shared)
  }
  return { buy, lease }
}

/**
 * Afkast efter skat for hvert scenarie. Et indskud i måned m forrentes månedligt til tidspunkt t,
 * dvs. i t − m måneder. Gevinsten (saldo − indskud) beskattes samlet med én sats.
 */
export function investmentReturn(outflows: MonthlyOutflows, annualReturnPct: number, returnTaxPct: number): InvestmentReturn {
  const monthlyRate = annualReturnPct / 100 / 12
  const account = { buy: { balance: 0, deposits: 0 }, lease: { balance: 0, deposits: 0 } }

  for (let m = 0; m < outflows.buy.length; m++) {
    const difference = outflows.buy[m] - outflows.lease[m]
    if (difference < 0) {
      account.buy.balance += -difference
      account.buy.deposits += -difference
    } else if (difference > 0) {
      account.lease.balance += difference
      account.lease.deposits += difference
    }
    account.buy.balance *= 1 + monthlyRate
    account.lease.balance *= 1 + monthlyRate
  }

  const afterTax = (a: { balance: number; deposits: number }) => (a.balance - a.deposits) * (1 - returnTaxPct / 100)
  return { buy: afterTax(account.buy), lease: afterTax(account.lease) }
}
