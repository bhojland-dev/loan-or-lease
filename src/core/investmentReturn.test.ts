import { describe, expect, it } from 'vitest'
import { MED_AFKAST, RENTEFRIT_LAAN } from './examples.ts'
import { investmentReturn, monthlyOutflows } from './investmentReturn.ts'
import { calculateLoan } from './loan.ts'

describe('afkast: månedlige udgifter', () => {
  const { buy, lease } = monthlyOutflows(RENTEFRIT_LAAN, calculateLoan(RENTEFRIT_LAAN), 12)

  it('måned 0 indeholder udbetaling, førstegangsydelse og forudbetalte udgifter', () => {
    expect(buy[0]).toBe(33135) // 20.000 + 2.635 + service 3.000 + forsikring 6.000 + ejerafgift 1.500
    expect(lease[0]).toBe(20500) // 10.000 + 3.000 + 6.000 + 1.500
  })

  it('låneydelse nr. m + 1 falder i måned m, og ejerafgiften igen i måned 6', () => {
    expect(buy[1]).toBe(2635)
    expect(lease[1]).toBe(3000)
    expect(buy[6]).toBe(4135)
    expect(lease[6]).toBe(4500)
  })

  it('udgifterne summer til TCO uden restgæld, restværdi og engangsbeløb ved t', () => {
    expect(buy).toHaveLength(12)
    expect(buy.reduce((a, b) => a + b, 0)).toBe(63620) // 20.000 + 12 × 2.635 + 12.000
    expect(lease.reduce((a, b) => a + b, 0)).toBe(55000) // 10.000 + 12 × 3.000 + 9.000
  })
})

describe('afkast: konto', () => {
  it('det billigste scenarie indskyder forskellen, og indskuddet forrentes til t', () => {
    // Leasing er 100 kr. billigere i måned 0. 100 × 1,01² = 102,01. Gevinst 2,01 × (1 − 37 %).
    const result = investmentReturn({ buy: [100, 0], lease: [0, 0] }, 12, 37)
    expect(result.buy).toBe(0)
    expect(result.lease).toBeCloseTo(1.2663, 10)
  })

  it('begge scenarier kan have en konto', () => {
    // Køb indskyder 50 i måned 0 (2 mdr. rente), leasing 50 i måned 1 (1 md. rente).
    const result = investmentReturn({ buy: [0, 50], lease: [50, 0] }, 12, 0)
    expect(result.buy).toBeCloseTo(1.005, 10)
    expect(result.lease).toBeCloseTo(0.5, 10)
  })

  it('ingen forskel giver intet afkast', () => {
    expect(investmentReturn({ buy: [100, 100], lease: [100, 100] }, 12, 37)).toEqual({ buy: 0, lease: 0 })
  })

  it('0 % rente giver intet afkast', () => {
    expect(investmentReturn({ buy: [100, 0], lease: [0, 0] }, 0, 37)).toEqual({ buy: 0, lease: 0 })
  })

  it('MED_AFKAST: leasing indskyder i måned 0, køb i måned 1-11', () => {
    const outflows = monthlyOutflows(MED_AFKAST, calculateLoan(MED_AFKAST), 12)
    const result = investmentReturn(outflows, MED_AFKAST.annualReturnPct, MED_AFKAST.returnTaxPct)
    // Måned 0: leasing er 33.135 − 20.500 = 12.635 billigere og forrentes i 12 mdr.
    expect(result.lease).toBeCloseTo(12635 * (1.01 ** 12 - 1) * 0.63, 6)
    // Måned 1-11: køb er 3.000 − 2.635 = 365 billigere (ejerafgiften i måned 6 er ens og går ud).
    let buyGain = 0
    for (let m = 1; m < 12; m++) buyGain += 365 * (1.01 ** (12 - m) - 1)
    expect(result.buy).toBeCloseTo(buyGain * 0.63, 6)
  })
})
