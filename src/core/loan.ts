// Lån (SPEC.md 2.1): annuitetslån med ydelser bagud.

import type { AmortizationRow, Inputs, Loan } from './types.ts'

type LoanInputs = Pick<
  Inputs,
  'purchasePrice' | 'downPayment' | 'interestRatePct' | 'loanTermMonths' | 'registrationFee' | 'establishmentFee' | 'monthlyLoanFee'
>

/** B1: lånebehov L = I1 − I2. */
export function calculateLoanNeed(purchasePrice: number, downPayment: number): number {
  return Math.max(0, purchasePrice - downPayment)
}

export function calculateLoan(inputs: LoanInputs): Loan {
  const loanNeed = calculateLoanNeed(inputs.purchasePrice, inputs.downPayment)
  if (loanNeed === 0) {
    return { loanNeed: 0, principal: 0, monthlyRate: 0, installment: 0, monthlyPayment: 0, termMonths: 0 }
  }

  // B2: omkostningerne lægges til, men er beregnet af L, ikke af H.
  const principal = loanNeed + inputs.registrationFee + inputs.establishmentFee
  // B3
  const monthlyRate = inputs.interestRatePct / 100 / 12
  const termMonths = inputs.loanTermMonths
  // B4
  const installment =
    monthlyRate === 0 ? principal / termMonths : (principal * monthlyRate) / (1 - (1 + monthlyRate) ** -termMonths)
  // B5
  const monthlyPayment = installment + inputs.monthlyLoanFee

  return { loanNeed, principal, monthlyRate, installment, monthlyPayment, termMonths }
}

/** Antal betalte ydelser ved tidspunkt t (mdr.). */
export function paymentsMade(loan: Loan, months: number): number {
  return Math.min(months, loan.termMonths)
}

/** B6: restgæld efter k ydelser. */
export function remainingDebt(loan: Loan, payments: number): number {
  if (payments >= loan.termMonths) return 0
  const { principal: h, monthlyRate: r, installment: a } = loan
  // Ved r = 0 er formlen grænseværdien H − A × k.
  if (r === 0) return h - a * payments
  const growth = (1 + r) ** payments
  return h * growth - (a * (growth - 1)) / r
}

/** O3: afviklingsprofil, én række pr. måned i hele lånets løbetid. */
export function amortizationSchedule(loan: Loan, monthlyLoanFee: number): AmortizationRow[] {
  const rows: AmortizationRow[] = []
  let previousBalance = loan.principal
  for (let month = 1; month <= loan.termMonths; month++) {
    const interest = previousBalance * loan.monthlyRate
    const balance = remainingDebt(loan, month)
    rows.push({
      month,
      installment: loan.installment,
      interest,
      principalPaid: loan.installment - interest,
      fee: monthlyLoanFee,
      balance,
    })
    previousBalance = balance
  }
  return rows
}
