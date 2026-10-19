// TCO køb (SPEC.md 2.4) og TCO leasing (SPEC.md 2.5).

import { paymentsMade, remainingDebt } from './loan.ts'
import { residualValue } from './residualValue.ts'
import { runningCost } from './runningCosts.ts'
import type { BuyBreakdown, Inputs, LeaseBreakdown, Loan } from './types.ts'

/** TCO køb(t) = I2 + min(t, I4) × B5 + B6(t) + forsikring + ejerafgift + service − restværdi − afkast. */
export function buyTco(inputs: Inputs, loan: Loan, months: number, investmentReturn: number): BuyBreakdown {
  const payments = paymentsMade(loan, months)
  const parts = {
    downPayment: inputs.downPayment,
    loanPayments: payments * loan.monthlyPayment,
    remainingDebt: remainingDebt(loan, payments),
    insurance: runningCost(inputs.insurance, months),
    ownershipTax: runningCost(inputs.ownershipTax, months),
    service: runningCost(inputs.service, months),
    residualValue: residualValue(inputs.purchasePrice, inputs.depreciationPct, months),
    investmentReturn,
  }
  const total =
    parts.downPayment +
    parts.loanPayments +
    parts.remainingDebt +
    parts.insurance +
    parts.ownershipTax +
    parts.service -
    parts.residualValue -
    parts.investmentReturn
  return { ...parts, total }
}

/** Km(t) = max(0, I12 − I16) × I17 × t / 12. Underkørte km giver ingen godtgørelse. */
export function excessKmCost(inputs: Pick<Inputs, 'annualKm' | 'includedKmPerYear' | 'excessKmPrice'>, months: number): number {
  return (Math.max(0, inputs.annualKm - inputs.includedKmPerYear) * inputs.excessKmPrice * months) / 12
}

/** Exit(t) = I18, hvis t < I13, ellers 0. */
export function exitCost(inputs: Pick<Inputs, 'earlyExitCost' | 'leaseTermMonths'>, months: number): number {
  return months < inputs.leaseTermMonths ? inputs.earlyExitCost : 0
}

/** TCO leasing(t) = I14 + t × I15 + forsikring + ejerafgift + Km + I19 + Exit − afkast. Service er inkluderet. */
export function leaseTco(inputs: Inputs, months: number, investmentReturn: number): LeaseBreakdown {
  const parts = {
    initialPayment: inputs.leaseInitialPayment,
    monthlyPayments: months * inputs.leaseMonthlyPayment,
    insurance: runningCost(inputs.insurance, months),
    ownershipTax: runningCost(inputs.ownershipTax, months),
    excessKm: excessKmCost(inputs, months),
    returnCost: inputs.returnCost,
    exitCost: exitCost(inputs, months),
    investmentReturn,
  }
  const total =
    parts.initialPayment +
    parts.monthlyPayments +
    parts.insurance +
    parts.ownershipTax +
    parts.excessKm +
    parts.returnCost +
    parts.exitCost -
    parts.investmentReturn
  return { ...parts, total }
}
