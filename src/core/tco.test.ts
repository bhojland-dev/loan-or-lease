import { describe, expect, it } from 'vitest'
import { KONTANT_KOEB, KORT_LAAN, LAEREBOGSLAAN, RENTEFRIT_LAAN } from './examples.ts'
import { calculateLoan, remainingDebt } from './loan.ts'
import { buyTco, leaseTco } from './tco.ts'

describe('TCO køb', () => {
  const loan = calculateLoan(RENTEFRIT_LAAN)

  it('RENTEFRIT_LAAN efter 12 mdr. er 41.400 kr.', () => {
    expect(buyTco(RENTEFRIT_LAAN, loan, 12, 0)).toEqual({
      downPayment: 20000,
      loanPayments: 31620, // 12 × 2.635
      remainingDebt: 73780,
      insurance: 6000,
      ownershipTax: 3000,
      service: 3000,
      residualValue: 96000,
      interestDeduction: 0, // ingen rente, intet fradrag
      investmentReturn: 0,
      total: 41400,
    })
  })

  it('RENTEFRIT_LAAN efter 24 og 36 mdr.', () => {
    expect(buyTco(RENTEFRIT_LAAN, loan, 24, 0).total).toBeCloseTo(67320, 6) // 125.400 + 24.000 − 82.080
    expect(buyTco(RENTEFRIT_LAAN, loan, 36, 0).total).toBeCloseTo(91221.6, 6) // 125.400 + 36.000 − 70.178,4
  })

  it('afkastet trækkes fra', () => {
    expect(buyTco(RENTEFRIT_LAAN, loan, 12, 400).total).toBe(41000)
  })

  it('KORT_LAAN: ydelsen stopper, når lånet er betalt ud', () => {
    const shortLoan = calculateLoan(KORT_LAAN)
    const tco = buyTco(KORT_LAAN, shortLoan, 24, 0)
    expect(tco.loanPayments).toBeCloseTo(105400, 6) // 12 ydelser, ikke 24
    expect(tco.remainingDebt).toBe(0)
  })

  it('KONTANT_KOEB: kun udbetaling og løbende udgifter minus restværdi', () => {
    const tco = buyTco(KONTANT_KOEB, calculateLoan(KONTANT_KOEB), 12, 0)
    expect(tco.loanPayments).toBe(0)
    expect(tco.remainingDebt).toBe(0)
    expect(tco.total).toBe(36000) // 120.000 + 12.000 − 96.000
  })
})

describe('TCO leasing', () => {
  it('RENTEFRIT_LAAN efter 12 mdr. er 60.000 kr.', () => {
    expect(leaseTco(RENTEFRIT_LAAN, 12, 0)).toEqual({
      initialPayment: 10000,
      monthlyPayments: 36000,
      insurance: 6000,
      ownershipTax: 3000,
      returnCost: 5000,
      investmentReturn: 0,
      total: 60000,
    })
  })

  it('RENTEFRIT_LAAN efter 24 og 36 mdr.', () => {
    expect(leaseTco(RENTEFRIT_LAAN, 24, 0).total).toBe(105000)
    expect(leaseTco(RENTEFRIT_LAAN, 36, 0).total).toBe(150000)
  })

  it('afkastet trækkes fra', () => {
    expect(leaseTco(RENTEFRIT_LAAN, 12, 400).total).toBe(59600)
  })
})

describe('TCO køb med rentefradrag', () => {
  it('LAEREBOGSLAAN: B7 = renterne i de betalte ydelser × 33 %, og det trækkes fra TCO', () => {
    const loan = calculateLoan(LAEREBOGSLAAN)
    // Renter i år 1 = 12 ydelser − afdrag (100.000 − restgæld efter 12).
    const interest = 12 * loan.installment - (100000 - remainingDebt(loan, 12))
    const tco = buyTco(LAEREBOGSLAAN, loan, 12, 0)
    expect(tco.interestDeduction).toBeCloseTo(interest * 0.33, 6)
    expect(tco.interestDeduction).toBeCloseTo(1821.28, 2) // ca. 5.519 kr. i renter × 33 %
    const withoutDeduction = buyTco({ ...LAEREBOGSLAAN, interestDeductionPct: 0 }, loan, 12, 0)
    expect(withoutDeduction.total - tco.total).toBeCloseTo(tco.interestDeduction, 6)
  })
})
