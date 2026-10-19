// Månedlige faste udgifter (SPEC.md 2.8, O10): gennemsnit pr. måned frem til t, uden engangsbeløb.

import { interestDeduction, paymentsMade } from './loan.ts'
import { runningCost } from './runningCosts.ts'
import type { Inputs, Loan, MonthlyCosts } from './types.ts'

export function buyMonthlyCosts(inputs: Inputs, loan: Loan, months: number): MonthlyCosts {
  const payment = (paymentsMade(loan, months) * loan.monthlyPayment) / months
  const insurance = runningCost(inputs.insurance, months) / months
  const ownershipTax = runningCost(inputs.ownershipTax, months) / months
  const service = runningCost(inputs.service, months) / months
  const beforeTax = payment + insurance + ownershipTax + service
  const deduction = interestDeduction(loan, months, inputs.interestDeductionPct) / months
  return {
    payment,
    insurance,
    ownershipTax,
    service,
    beforeTax,
    interestDeduction: deduction,
    afterTax: beforeTax - deduction,
  }
}

export function leaseMonthlyCosts(inputs: Inputs, months: number): MonthlyCosts {
  const payment = inputs.leaseMonthlyPayment
  const insurance = runningCost(inputs.insurance, months) / months
  const ownershipTax = runningCost(inputs.ownershipTax, months) / months
  const beforeTax = payment + insurance + ownershipTax
  return { payment, insurance, ownershipTax, service: 0, beforeTax, interestDeduction: 0, afterTax: beforeTax }
}
