import { describe, expect, it } from 'vitest'
import { createDefaultDraft, DEFAULT_SETTINGS, defaultEstablishmentFee, defaultRegistrationFee } from './defaults.ts'
import type { Settings } from './defaults.ts'
import { warnings } from './notes.ts'
import { validate } from './validation.ts'

describe('I5 tinglysningsafgift: 1.850 + 1,5 % af L, hele beløbet oprundet til 100 kr.', () => {
  it.each([
    [160000, 4300], // 1.850 + 2.400 = 4.250 → 4.300
    [100000, 3400], // 1.850 + 1.500 = 3.350 → 3.400
    [10000, 2000], // 1.850 + 150 = 2.000, går op
    [400000, 7900], // 1.850 + 6.000 = 7.850 → 7.900
    [0, 1900], // 1.850 → 1.900
  ])('L = %i giver %i kr.', (loanNeed, expected) => {
    expect(defaultRegistrationFee(loanNeed)).toBe(expected)
  })
})

describe('I6 stiftelsesprovision: 1,25 % af L, min. 2.000, maks. 10.000', () => {
  it.each([
    [100000, 2000], // 1.250 → minimum
    [160000, 2000], // 2.000, præcis minimum
    [400000, 5000],
    [800000, 10000], // præcis maksimum
    [1000000, 10000], // 12.500 → maksimum
  ])('L = %i giver %i kr.', (loanNeed, expected) => {
    expect(defaultEstablishmentFee(loanNeed)).toBeCloseTo(expected, 10)
  })
})

describe('indstillinger udefra (fx fra en API)', () => {
  const custom: Settings = {
    ...DEFAULT_SETTINGS,
    registrationFee: { fixed: 2000, rate: 0.01, rounding: 100 },
    interestDeductionPct: 25,
    highMileageKmPerYear: 30000,
  }

  it('standardværdierne følger de indsendte indstillinger', () => {
    expect(defaultRegistrationFee(100000, custom)).toBe(3000) // 2.000 + 1 % af 100.000
    expect(createDefaultDraft(custom).interestDeductionPct).toBe(25)
  })

  it('validate bruger indstillingerne til beregnede standardværdier', () => {
    const draft = {
      ...createDefaultDraft(custom),
      purchasePrice: 120000,
      downPayment: 20000,
      interestRatePct: 0,
      loanTermMonths: 40,
      service: { amount: 0, frequency: 'year' as const },
      insurance: { amount: 0, frequency: 'year' as const },
      leaseInitialPayment: 0,
      leaseMonthlyPayment: 1,
    }
    const result = validate(draft, custom)
    expect(result.ok && result.inputs.registrationFee).toBe(3000)
  })

  it('advarslen om høj kørsel følger grænsen i indstillingerne', () => {
    expect(warnings({ annualKm: 25000 })).toHaveLength(1)
    expect(warnings({ annualKm: 25000 }, custom)).toHaveLength(0)
    expect(warnings({ annualKm: 35000 }, custom)[0].limitKmPerYear).toBe(30000)
  })
})
