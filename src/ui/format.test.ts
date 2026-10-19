import { afterEach, describe, expect, it, vi } from 'vitest'
import { validate } from '../core/index.ts'
import { formatFraction, formatInput, formatKr, formatMonths, parseDanishNumber } from './format.ts'
import { clearFormState, initialFormState, loadFormState, saveFormState, toDraft, unreadableFields } from './form.ts'

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
    expect(form.periodic.ownershipTax).toEqual({ amount: '460', frequency: 'halfYear' })
    expect(form.numbers.annualKm).toBe('15.000')
    expect(form.numbers.interestDeductionPct).toBe('33')
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

describe('gemte felter', () => {
  afterEach(() => vi.unstubAllGlobals())

  function stubStorage(initial: Record<string, string> = {}) {
    const data = { ...initial }
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => data[k] ?? null,
      setItem: (k: string, v: string) => {
        data[k] = v
      },
      removeItem: (k: string) => {
        delete data[k]
      },
    })
    return data
  }

  it('gemmer og indlæser formularen', () => {
    stubStorage()
    const form = initialFormState()
    form.numbers.purchasePrice = '200.000'
    form.periodic.insurance = { amount: '8.900', frequency: 'year' }
    saveFormState(form)
    expect(loadFormState()).toEqual(form)
  })

  it('nulstil glemmer det gemte', () => {
    stubStorage()
    saveFormState(initialFormState())
    clearFormState()
    expect(loadFormState()).toBeNull()
  })

  it('intet gemt eller ødelagt indhold giver null', () => {
    stubStorage()
    expect(loadFormState()).toBeNull()
    stubStorage({ 'loan-or-lease:form:v1': '{ikke json' })
    expect(loadFormState()).toBeNull()
  })

  it('manglende felter i det gemte får standardværdien', () => {
    stubStorage({ 'loan-or-lease:form:v1': JSON.stringify({ numbers: { purchasePrice: '150.000' } }) })
    const loaded = loadFormState()
    expect(loaded?.numbers.purchasePrice).toBe('150.000')
    expect(loaded?.periodic.ownershipTax).toEqual({ amount: '460', frequency: 'halfYear' })
  })

  it('uden lager (fx privat vindue) sker der ingen fejl', () => {
    vi.stubGlobal('localStorage', undefined)
    expect(() => saveFormState(initialFormState())).not.toThrow()
    expect(loadFormState()).toBeNull()
  })
})
