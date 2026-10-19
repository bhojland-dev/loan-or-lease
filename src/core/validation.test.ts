import { describe, expect, it } from 'vitest'
import { createDefaultDraft } from './defaults.ts'
import type { InputDraft } from './types.ts'
import { validate } from './validation.ts'

/** Standardværdier plus de påkrævede felter: svarer til regneeksemplet RENTEFRIT_LAAN uden faste I5 og I6. */
const UDFYLDT: InputDraft = {
  ...createDefaultDraft(),
  purchasePrice: 120000,
  downPayment: 20000,
  interestRatePct: 0,
  loanTermMonths: 40,
  service: { amount: 3000, frequency: 'year' },
  insurance: { amount: 6000, frequency: 'year' },
  ownershipTax: { amount: 1500, frequency: 'halfYear' },
  annualKm: 20000,
  leaseInitialPayment: 10000,
  leaseMonthlyPayment: 3000,
}

function errorFields(draft: InputDraft): string[] {
  const result = validate(draft)
  return result.ok ? [] : result.errors.map((e) => e.field)
}

describe('validering', () => {
  it('et udfyldt skema er gyldigt og får standardværdier for I5 og I6', () => {
    const result = validate(UDFYLDT)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.inputs.registrationFee).toBe(3400) // L = 100.000
    expect(result.inputs.establishmentFee).toBe(2000)
    expect(result.inputs.leaseTermMonths).toBe(48)
    expect(result.inputs.returnCost).toBe(5000)
  })

  it('standard: ejerafgift 460 kr. halvårligt og 15.000 km/år', () => {
    const draft = createDefaultDraft()
    expect(draft.ownershipTax).toEqual({ amount: 460, frequency: 'halfYear' })
    expect(draft.annualKm).toBe(15000)
  })

  it('egne værdier for I5 og I6 bruges i stedet for standardværdien', () => {
    const result = validate({ ...UDFYLDT, registrationFee: 0, establishmentFee: 1000 })
    expect(result.ok && [result.inputs.registrationFee, result.inputs.establishmentFee]).toEqual([0, 1000])
  })

  it('O8: beregning gennemføres ikke, før alle påkrævede felter er udfyldt', () => {
    expect(errorFields(createDefaultDraft()).sort()).toEqual(
      ['purchasePrice', 'downPayment', 'service', 'insurance', 'leaseInitialPayment', 'leaseMonthlyPayment'].sort(),
    )
  })

  it('uden lån ignoreres lånefelterne I3-I7 og I23, også ugyldige værdier', () => {
    const result = validate({
      ...UDFYLDT,
      downPayment: 120000,
      interestRatePct: undefined,
      loanTermMonths: Number.NaN,
      registrationFee: -1,
      establishmentFee: undefined,
      monthlyLoanFee: undefined,
      interestDeductionPct: undefined,
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect([
      result.inputs.interestRatePct,
      result.inputs.loanTermMonths,
      result.inputs.registrationFee,
      result.inputs.establishmentFee,
      result.inputs.monthlyLoanFee,
      result.inputs.interestDeductionPct,
    ]).toEqual([0, 0, 0, 0, 0, 0])
  })

  it('med lån er I3 og I4 påkrævede', () => {
    expect(errorFields({ ...UDFYLDT, interestRatePct: undefined, loanTermMonths: undefined })).toEqual([
      'interestRatePct',
      'loanTermMonths',
    ])
  })

  it.each([
    ['purchasePrice', 'notPositive', { purchasePrice: 0, downPayment: 0 }],
    ['downPayment', 'negative', { downPayment: -1 }],
    ['downPayment', 'exceedsPurchasePrice', { downPayment: 120001 }],
    ['interestRatePct', 'negative', { interestRatePct: -0.1 }],
    ['loanTermMonths', 'notWholeMonths', { loanTermMonths: 0 }],
    ['loanTermMonths', 'notWholeMonths', { loanTermMonths: 12.5 }],
    ['registrationFee', 'negative', { registrationFee: -1 }],
    ['monthlyLoanFee', 'negative', { monthlyLoanFee: -1 }],
    ['service', 'negative', { service: { amount: -1, frequency: 'year' } }],
    ['service', 'missingFrequency', { service: { amount: 3000 } }],
    ['service', 'required', { service: { frequency: 'year' } }],
    ['depreciationPct', 'depreciationOutOfRange', { depreciationPct: [20, 14.5, 101, 14.5] }],
    ['depreciationPct', 'depreciationIncomplete', { depreciationPct: [20, 14.5, Number.NaN, 14.5] }],
    ['leaseTermMonths', 'invalidLeaseTerm', { leaseTermMonths: 30 }],
    ['leaseMonthlyPayment', 'notPositive', { leaseMonthlyPayment: 0 }],
    ['interestDeductionPct', 'percentOutOfRange', { interestDeductionPct: 101 }],
    ['annualKm', 'invalidKm', { annualKm: 5000 }],
    ['annualKm', 'invalidKm', { annualKm: 17500 }],
    ['returnTaxPct', 'percentOutOfRange', { returnTaxPct: 101 }],
    ['purchasePrice', 'required', { purchasePrice: Number.NaN }],
  ] as const)('%s: %s', (field, code, change) => {
    const result = validate({ ...UDFYLDT, ...change })
    expect(result.ok ? [] : result.errors).toEqual([{ field, code }])
  })

  it('afkast regnes altid med: I21 og I22 er påkrævede', () => {
    expect(errorFields({ ...UDFYLDT, annualReturnPct: undefined, returnTaxPct: undefined })).toEqual([
      'annualReturnPct',
      'returnTaxPct',
    ])
  })
})
