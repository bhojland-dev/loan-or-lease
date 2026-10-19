import { describe, expect, it } from 'vitest'
import { KONTANT_KOEB, KORT_LAAN, RENTEFRIT_LAAN } from './examples.ts'
import { calculateLoan } from './loan.ts'
import { buyTco, exitCost, excessKmCost, leaseTco } from './tco.ts'

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
  it('RENTEFRIT_LAAN efter 12 mdr. er 69.000 kr.', () => {
    expect(leaseTco(RENTEFRIT_LAAN, 12, 0)).toEqual({
      initialPayment: 10000,
      monthlyPayments: 36000,
      insurance: 6000,
      ownershipTax: 3000,
      excessKm: 5000, // 5.000 km × 1 kr.
      returnCost: 5000,
      exitCost: 4000, // førtidig ophør
      investmentReturn: 0,
      total: 69000,
    })
  })

  it('RENTEFRIT_LAAN efter 24 og 36 mdr.', () => {
    expect(leaseTco(RENTEFRIT_LAAN, 24, 0).total).toBe(119000)
    expect(leaseTco(RENTEFRIT_LAAN, 36, 0).total).toBe(165000) // ingen exit ved aftalens udløb
  })

  it('afkastet trækkes fra', () => {
    expect(leaseTco(RENTEFRIT_LAAN, 12, 400).total).toBe(68600)
  })

  it('Km: underkørte km giver ingen godtgørelse', () => {
    expect(excessKmCost({ annualKm: 10000, includedKmPerYear: 15000, excessKmPrice: 2 }, 24)).toBe(0)
    expect(excessKmCost({ annualKm: 18000, includedKmPerYear: 15000, excessKmPrice: 0.5 }, 24)).toBe(3000)
  })

  it('Exit: kun når t < I13', () => {
    expect(exitCost({ earlyExitCost: 4000, leaseTermMonths: 36 }, 24)).toBe(4000)
    expect(exitCost({ earlyExitCost: 4000, leaseTermMonths: 36 }, 36)).toBe(0)
  })
})
