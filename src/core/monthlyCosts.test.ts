import { describe, expect, it } from 'vitest'
import { KORT_LAAN, LAEREBOGSLAAN, RENTEFRIT_LAAN } from './examples.ts'
import { calculateLoan, interestDeduction } from './loan.ts'
import { buyMonthlyCosts, leaseMonthlyCosts } from './monthlyCosts.ts'

describe('O10 månedlige faste udgifter', () => {
  it('RENTEFRIT_LAAN efter 12 mdr.: køb 3.635 kr. og leasing 3.750 kr. pr. måned', () => {
    expect(buyMonthlyCosts(RENTEFRIT_LAAN, calculateLoan(RENTEFRIT_LAAN), 12)).toEqual({
      payment: 2635,
      insurance: 500, // 6.000 / 12
      ownershipTax: 250, // 1.500 halvårligt
      service: 250, // 3.000 / 12
      beforeTax: 3635,
      interestDeduction: 0,
      afterTax: 3635,
    })
    expect(leaseMonthlyCosts(RENTEFRIT_LAAN, 12)).toEqual({
      payment: 3000,
      insurance: 500,
      ownershipTax: 250,
      service: 0, // inkluderet i leasing
      beforeTax: 3750,
      interestDeduction: 0,
      afterTax: 3750,
    })
  })

  it('KORT_LAAN efter 24 mdr.: låneydelsen fordeles over hele perioden, da lånet er betalt ud efter 12', () => {
    const costs = buyMonthlyCosts(KORT_LAAN, calculateLoan(KORT_LAAN), 24)
    expect(costs.payment).toBeCloseTo(105400 / 24, 6) // 12 ydelser à 8.783,33
  })

  it('LAEREBOGSLAAN: efter skat = før skat − rentefradraget fordelt pr. måned', () => {
    const loan = calculateLoan(LAEREBOGSLAAN)
    const costs = buyMonthlyCosts(LAEREBOGSLAAN, loan, 12)
    expect(costs.interestDeduction).toBeCloseTo(interestDeduction(loan, 12, 33) / 12, 10)
    expect(costs.interestDeduction).toBeCloseTo(151.77, 2) // 1.821,28 / 12
    expect(costs.afterTax).toBeCloseTo(costs.beforeTax - costs.interestDeduction, 10)
  })

  it('leasing har intet rentefradrag', () => {
    const costs = leaseMonthlyCosts(LAEREBOGSLAAN, 12)
    expect(costs.afterTax).toBe(costs.beforeTax)
  })
})
