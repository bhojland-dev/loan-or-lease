import { describe, expect, it } from 'vitest'
import type { ValidationCode } from '../core/index.ts'
import { DEFAULT_SETTINGS } from '../core/index.ts'
import {
  comparisonPeriodsText,
  computedDefaultRule,
  listDa,
  noteText,
  validationMessage,
  warningMessage,
} from './messages.ts'

const ALL_CODES: ValidationCode[] = [
  'required',
  'notPositive',
  'negative',
  'notWholeMonths',
  'percentOutOfRange',
  'invalidKm',
  'invalidLeaseTerm',
  'exceedsPurchasePrice',
  'missingFrequency',
  'depreciationIncomplete',
  'depreciationOutOfRange',
]

describe('tekster til motorens koder', () => {
  it.each(ALL_CODES)('%s har en dansk tekst', (code) => {
    expect(validationMessage({ field: 'downPayment', code })).toMatch(/\.$/)
  })

  it('samme kode kan have feltspecifik ordlyd', () => {
    expect(validationMessage({ field: 'purchasePrice', code: 'notPositive' })).toBe(
      'Købsprisen skal være større end 0.',
    )
    expect(validationMessage({ field: 'insurance', code: 'negative' })).toBe('Beløbet må ikke være negativt.')
    expect(validationMessage({ field: 'interestRatePct', code: 'negative' })).toBe('Renten må ikke være negativ.')
  })

  it('tekster om tilladte valg bygges ud fra motorens regler', () => {
    expect(validationMessage({ field: 'annualKm', code: 'invalidKm' })).toBe(
      'Vælg mellem 10.000 og 45.000 km i trin af 5.000.',
    )
    expect(validationMessage({ field: 'leaseTermMonths', code: 'invalidLeaseTerm' })).toBe(
      'Løbetiden skal være 12, 24, 36 eller 48 måneder.',
    )
  })

  it('advarslen nævner grænsen med dansk formatering', () => {
    expect(warningMessage({ code: 'highMileage', field: 'annualKm', limitKmPerYear: 20000 })).toContain(
      'over 20.000 km',
    )
  })

  it('noterne har tekst', () => {
    expect(noteText('depreciationSource')).toContain('Bilbasen')
    expect(noteText('returnInsurance')).toContain('afleveringsforsikring')
  })
})

describe('tekster bygget ud fra motorens satser', () => {
  it('reglerne for I5 og I6 følger indstillingerne', () => {
    expect(computedDefaultRule('registrationFee')).toBe('1.850 kr. + 1,5 % af lånebehovet.')
    expect(computedDefaultRule('establishmentFee')).toBe('1,25 % af lånebehovet, min. 2.000, maks. 10.000 kr.')
    const custom = { ...DEFAULT_SETTINGS, registrationFee: { fixed: 2000, rate: 0.01, rounding: 100 } }
    expect(computedDefaultRule('registrationFee', custom)).toBe('2.000 kr. + 1 % af lånebehovet.')
  })

  it('tidspunkterne som tekst', () => {
    expect(comparisonPeriodsText()).toBe('1, 2, 3 og 4 år')
    expect(listDa(['a'])).toBe('a')
    expect(listDa(['a', 'b'])).toBe('a og b')
  })
})
