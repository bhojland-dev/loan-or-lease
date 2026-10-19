import { describe, expect, it } from 'vitest'
import { paymentCount, runningCost, runningCostDueInMonth } from './runningCosts.ts'

describe('løbende udgifter', () => {
  it('antal betalinger = t / frekvens i måneder (halvår ved 24 mdr. = 4)', () => {
    expect(paymentCount('halfYear', 24)).toBe(4)
    expect(paymentCount('month', 24)).toBe(24)
    expect(paymentCount('quarter', 24)).toBe(8)
    expect(paymentCount('year', 24)).toBe(2)
  })

  it('samlet udgift = beløb × antal betalinger', () => {
    expect(runningCost({ amount: 1500, frequency: 'halfYear' }, 36)).toBe(9000)
    expect(runningCost({ amount: 500, frequency: 'month' }, 12)).toBe(6000)
  })

  it('betales forud: forfalder i måned 0 og derefter hver periode', () => {
    const halfYear = { amount: 1500, frequency: 'halfYear' } as const
    const due = Array.from({ length: 12 }, (_, m) => runningCostDueInMonth(halfYear, m))
    expect(due).toEqual([1500, 0, 0, 0, 0, 0, 1500, 0, 0, 0, 0, 0])
    expect(due.reduce((a, b) => a + b, 0)).toBe(runningCost(halfYear, 12))
  })
})
