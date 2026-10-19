import { describe, expect, it } from 'vitest'
import { defaultEstablishmentFee, defaultRegistrationFee } from './defaults.ts'

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
