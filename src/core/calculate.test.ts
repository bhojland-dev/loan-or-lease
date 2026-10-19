import { describe, expect, it } from 'vitest'
import { calculate } from './calculate.ts'
import { LAEREBOGSLAAN, MED_AFKAST, RENTEFRIT_LAAN } from './examples.ts'
import { investmentReturn, monthlyOutflows } from './investmentReturn.ts'
import { calculateLoan } from './loan.ts'

describe('samlet beregning', () => {
  it('RENTEFRIT_LAAN: O1 for t ≤ I13 = 36', () => {
    const { comparison } = calculate(RENTEFRIT_LAAN)
    expect(comparison.map((row) => row.months)).toEqual([12, 24, 36])
    expect(comparison.map((row) => row.buy.total)).toEqual([41400, 67320, expect.closeTo(91221.6, 6)])
    expect(comparison.map((row) => row.lease.total)).toEqual([69000, 119000, 165000])
    expect(comparison[0].difference).toBe(-27600)
    expect(comparison.every((row) => row.cheapest === 'buy')).toBe(true)
  })

  it('billigst er leasing, når leasing har lavest TCO', () => {
    const { comparison } = calculate({ ...RENTEFRIT_LAAN, leaseMonthlyPayment: 500, leaseInitialPayment: 0 })
    expect(comparison[0].lease.total).toBe(29000) // 12 × 500 + 6.000 + 3.000 + km 5.000 + 5.000 + exit 4.000
    expect(comparison[0].cheapest).toBe('lease')
  })

  it('MED_AFKAST: afkastet beregnes pr. tidspunkt og trækkes fra begge scenarier', () => {
    const { comparison } = calculate(MED_AFKAST)
    const loan = calculateLoan(MED_AFKAST)
    for (const row of comparison) {
      const expected = investmentReturn(monthlyOutflows(MED_AFKAST, loan, row.months), 12, 37)
      expect(row.buy.investmentReturn).toBe(expected.buy)
      expect(row.lease.investmentReturn).toBe(expected.lease)
    }
    expect(comparison[0].lease.total).toBeCloseTo(69000 - comparison[0].lease.investmentReturn, 6)
  })

  it('afkast "fra" giver 0 kr. i afkast', () => {
    const { comparison } = calculate(RENTEFRIT_LAAN)
    expect(comparison.every((row) => row.buy.investmentReturn === 0 && row.lease.investmentReturn === 0)).toBe(true)
  })

  it('O3 dækker hele lånets løbetid, uafhængigt af leasingaftalen', () => {
    expect(calculate(RENTEFRIT_LAAN).amortization).toHaveLength(40)
    expect(calculate(LAEREBOGSLAAN).amortization).toHaveLength(60)
  })

  it('O4: advarsel ved over 20.000 km/år', () => {
    expect(calculate(RENTEFRIT_LAAN).warnings).toEqual([])
    expect(calculate({ ...RENTEFRIT_LAAN, annualKm: 20001 }).warnings).toEqual([
      expect.objectContaining({ code: 'highMileage', field: 'annualKm' }),
    ])
  })
})
