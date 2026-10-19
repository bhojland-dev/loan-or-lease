import { describe, expect, it } from 'vitest'
import { KONTANT_KOEB, KORT_LAAN, LAEREBOGSLAAN, RENTEFRIT_LAAN } from './examples.ts'
import { amortizationSchedule, calculateLoan, paymentsMade, remainingDebt } from './loan.ts'

describe('B1-B5 lån', () => {
  it('RENTEFRIT_LAAN: lånebehov, hovedstol, rente, ydelse og månedlig betaling', () => {
    const loan = calculateLoan(RENTEFRIT_LAAN)
    expect(loan.loanNeed).toBe(100000) // B1: 120.000 − 20.000
    expect(loan.principal).toBe(105400) // B2: 100.000 + 3.400 + 2.000
    expect(loan.monthlyRate).toBe(0) // B3
    expect(loan.installment).toBe(2635) // B4 ved r = 0: 105.400 / 40
    expect(loan.monthlyPayment).toBe(2635) // B5: + 0 kr. gebyr
  })

  it('LAEREBOGSLAAN: 100.000 kr. til 6 % over 60 mdr. giver ydelse 1.933,28 kr.', () => {
    const loan = calculateLoan(LAEREBOGSLAAN)
    expect(loan.monthlyRate).toBeCloseTo(0.005, 12) // B3: 6 % / 12
    expect(loan.installment).toBeCloseTo(1933.28, 2)
  })

  it('B5 lægger det løbende lånegebyr til ydelsen', () => {
    const loan = calculateLoan({ ...RENTEFRIT_LAAN, monthlyLoanFee: 50 })
    expect(loan.monthlyPayment).toBe(2685)
  })

  it('KONTANT_KOEB: L = 0 giver intet lån, og B2-B6 er 0', () => {
    const loan = calculateLoan({ ...KONTANT_KOEB, registrationFee: 3400, establishmentFee: 2000 })
    expect(loan).toEqual({ loanNeed: 0, principal: 0, monthlyRate: 0, installment: 0, monthlyPayment: 0, termMonths: 0 })
    expect(remainingDebt(loan, 12)).toBe(0)
    expect(paymentsMade(loan, 12)).toBe(0)
  })
})

describe('B6 restgæld', () => {
  it('RENTEFRIT_LAAN: restgæld er hovedstol minus betalte ydelser', () => {
    const loan = calculateLoan(RENTEFRIT_LAAN)
    expect(remainingDebt(loan, 0)).toBe(105400)
    expect(remainingDebt(loan, 12)).toBe(73780) // 105.400 − 12 × 2.635
    expect(remainingDebt(loan, 36)).toBe(10540)
  })

  it('LAEREBOGSLAAN: formlen svarer til at trække afdrag fra måned for måned', () => {
    const loan = calculateLoan(LAEREBOGSLAAN)
    let balance = loan.principal
    for (let k = 1; k <= 59; k++) {
      balance = balance * (1 + loan.monthlyRate) - loan.installment
      expect(remainingDebt(loan, k)).toBeCloseTo(balance, 6)
    }
  })

  it('er 0, når k ≥ I4', () => {
    const loan = calculateLoan(KORT_LAAN)
    expect(paymentsMade(loan, 24)).toBe(12)
    expect(remainingDebt(loan, 12)).toBe(0)
    expect(remainingDebt(loan, 24)).toBe(0)
  })
})

describe('O3 afviklingsprofil', () => {
  it('LAEREBOGSLAAN: én række pr. måned, rente + afdrag = ydelse, og restgælden ender på 0', () => {
    const loan = calculateLoan(LAEREBOGSLAAN)
    const rows = amortizationSchedule(loan, 25)
    expect(rows).toHaveLength(60)
    expect(rows[0].month).toBe(1)
    expect(rows[0].interest).toBeCloseTo(500, 10) // 100.000 × 0,5 %
    expect(rows[0].principalPaid).toBeCloseTo(1433.28, 2)
    expect(rows[0].fee).toBe(25)
    for (const row of rows) expect(row.interest + row.principalPaid).toBeCloseTo(row.installment, 10)
    expect(rows.reduce((sum, row) => sum + row.principalPaid, 0)).toBeCloseTo(100000, 6)
    expect(rows[59].balance).toBe(0)
  })

  it('er tom uden lån', () => {
    expect(amortizationSchedule(calculateLoan(KONTANT_KOEB), 0)).toEqual([])
  })
})
