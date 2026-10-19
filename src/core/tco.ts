// TCO køb (SPEC.md 2.4) og TCO leasing (SPEC.md 2.5).

import { interestDeduction, paymentsMade, remainingDebt } from './loan.ts'
import { residualValue } from './residualValue.ts'
import { runningCost } from './runningCosts.ts'
import type { BuyBreakdown, Inputs, LeaseBreakdown, Loan } from './types.ts'

/** TCO køb(t) = I2 + min(t, I4) × B5 + B6(t) + forsikring + ejerafgift + service − restværdi − B7(t) − afkast. */
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
    interestDeduction: interestDeduction(loan, months, inputs.interestDeductionPct),
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
    parts.interestDeduction -
    parts.investmentReturn
  return { ...parts, total }
}

/** TCO leasing(t) = I14 + t × I15 + forsikring + ejerafgift + I19 − afkast. Service er inkluderet. */
export function leaseTco(inputs: Inputs, months: number, investmentReturn: number): LeaseBreakdown {
  const parts = {
    initialPayment: inputs.leaseInitialPayment,
    monthlyPayments: months * inputs.leaseMonthlyPayment,
    insurance: runningCost(inputs.insurance, months),
    ownershipTax: runningCost(inputs.ownershipTax, months),
    returnCost: inputs.returnCost,
    investmentReturn,
  }
  const total =
    parts.initialPayment +
    parts.monthlyPayments +
    parts.insurance +
    parts.ownershipTax +
    parts.returnCost -
    parts.investmentReturn
  return { ...parts, total }
}
