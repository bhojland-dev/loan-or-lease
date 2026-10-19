import { describe, expect, it } from 'vitest'
import { validate } from '../core/index.ts'
import { formatFraction, formatInput, formatKr, formatMonths, parseDanishNumber } from './format.ts'
import { initialFormState, toDraft, unreadableFields } from './form.ts'

describe('dansk formatering', () => {
  it('beløb i kr.', () => {
    expect(formatKr(1234.5)).toBe('1.234,50 kr.')
    expect(formatKr(-27600)).toBe('-27.600,00 kr.')
    expect(formatKr(-0.001)).toBe('0,00 kr.')
  })

  it('procent med komma', () => {
    expect(formatFraction(0.43)).toBe('43,0 %')
    expect(formatFraction(0.20498)).toBe('20,5 %')
  })

  it('inputfelter og måneder', () => {
    expect(formatInput(200000)).toBe('200.000')
    expect(formatInput(14.5)).toBe('14,5')
    expect(formatInput(undefined)).toBe('')
    expect(formatMonths(24)).toBe('2 år')
  })
})

describe('indtastning af danske tal', () => {
  it.each([
    ['1.234,50', 1234.5],
    ['200000', 200000],
    ['200.000', 200000],
    ['14,5', 14.5],
    ['  3.000 kr. ', 3000],
    ['0,25 %', 0.25],
    ['-1', -1],
  ])('"%s" → %f', (text, expected) => {
    expect(parseDanishNumber(text)).toBe(expected)
  })

  it('tomt felt er ikke udfyldt', () => {
    expect(parseDanishNumber('')).toBeUndefined()
    expect(parseDanishNumber('  ')).toBeUndefined()
  })

  it.each(['abc', '1,2,3', ',', '12a'])('"%s" er ugyldigt', (text) => {
    expect(parseDanishNumber(text)).toBeNaN()
  })
})

describe('formular', () => {
  it('startværdierne kommer fra standardværdierne i core', () => {
    const form = initialFormState()
    expect(form.depreciation).toEqual(['20', '14,5', '14,5', '14,5'])
    expect(form.numbers.leaseTermMonths).toBe('48')
    expect(form.numbers.annualReturnPct).toBe('0,25')
    expect(form.numbers.registrationFee).toBe('')
    expect(form.periodic.ownershipTax.frequency).toBe('halfYear')
  })

  it('et udfyldt skema giver gyldigt input', () => {
    const form = initialFormState()
    Object.assign(form.numbers, {
      purchasePrice: '120.000',
      downPayment: '20.000',
      interestRatePct: '0',
      loanTermMonths: '40',
      annualKm: '20.000',
      leaseInitialPayment: '10.000',
      leaseMonthlyPayment: '3.000',
      excessKmPrice: '1',
    })
    form.periodic.service = { amount: '3.000', frequency: 'year' }
    form.periodic.insurance = { amount: '6.000', frequency: 'year' }
    form.periodic.ownershipTax.amount = '1.500'
    const result = validate(toDraft(form))
    expect(result.ok).toBe(true)
    expect(result.ok && result.inputs.registrationFee).toBe(3400)
  })

  it('ulæselige tal markeres', () => {
    const form = initialFormState()
    form.numbers.purchasePrice = 'abc'
    form.depreciation[2] = 'x'
    expect([...unreadableFields(form)]).toEqual(['purchasePrice', 'depreciationPct'])
  })
})
