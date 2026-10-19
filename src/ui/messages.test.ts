import { describe, expect, it } from 'vitest'
import type { ValidationCode } from '../core/index.ts'
import { noteText, validationMessage, warningMessage } from './messages.ts'

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
    expect(validationMessage({ field: 'purchasePrice', code: 'notPositive' })).toBe('Købsprisen skal være større end 0.')
    expect(validationMessage({ field: 'insurance', code: 'negative' })).toBe('Beløbet må ikke være negativt.')
    expect(validationMessage({ field: 'interestRatePct', code: 'negative' })).toBe('Renten må ikke være negativ.')
  })

  it('tekster om tilladte valg bygges ud fra motorens regler', () => {
    expect(validationMessage({ field: 'annualKm', code: 'invalidKm' })).toBe('Vælg mellem 10.000 og 45.000 km i trin af 5.000.')
    expect(validationMessage({ field: 'leaseTermMonths', code: 'invalidLeaseTerm' })).toBe(
      'Løbetiden skal være 12, 24, 36 eller 48 måneder.',
    )
  })

  it('advarslen nævner grænsen med dansk formatering', () => {
    expect(warningMessage({ code: 'highMileage', field: 'annualKm', limitKmPerYear: 20000 })).toContain('over 20.000 km')
  })

  it('noterne har tekst', () => {
    expect(noteText('depreciationSource')).toContain('Bilbasen')
    expect(noteText('returnInsurance')).toContain('afleveringsforsikring')
  })
})
