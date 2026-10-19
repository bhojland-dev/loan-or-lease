import { describe, expect, it } from 'vitest'
import { breakEven, buyIsCheaperAtBreakEven } from './breakEven.ts'
import { calculate } from './calculate.ts'
import { MED_AFKAST, RENTEFRIT_LAAN } from './examples.ts'
import { calculateLoan } from './loan.ts'
import { buyTco, leaseTco } from './tco.ts'

describe('break-even', () => {
  it('RENTEFRIT_LAAN efter 12 mdr.: break-even-værditab 43 % mod forventet 20 %', () => {
    const buy = buyTco(RENTEFRIT_LAAN, calculateLoan(RENTEFRIT_LAAN), 12, 0)
    const lease = leaseTco(RENTEFRIT_LAAN, 12, 0)
    const row = breakEven(12, 120000, buy, lease)
    expect(row.breakEvenResidualValue).toBe(68400) // TCO køb uden restværdi 137.400 − TCO leasing 69.000
    expect(row.breakEvenDepreciation).toBeCloseTo(0.43, 12) // 1 − 68.400 / 120.000
    expect(row.expectedDepreciation).toBeCloseTo(0.2, 12)
    expect(buyIsCheaperAtBreakEven(row)).toBe(true)
  })

  it.each([
    ['RENTEFRIT_LAAN', RENTEFRIT_LAAN],
    ['MED_AFKAST', MED_AFKAST],
    ['dyr bil og billig leasing', { ...RENTEFRIT_LAAN, leaseMonthlyPayment: 500, leaseInitialPayment: 0 }],
  ])('%s: break-even peger på samme scenarie som TCO-sammenligningen', (_, inputs) => {
    const result = calculate(inputs)
    result.comparison.forEach((row, i) => {
      expect(buyIsCheaperAtBreakEven(result.breakEven[i])).toBe(row.cheapest === 'buy')
    })
  })
})
