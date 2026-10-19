// Regler for hvert talfelt (SPEC.md afsnit 1), samlet ét sted. Fejl gives som koder, ikke tekst. Nye talfelter tilføjes her,
// i InputDraft og Inputs (types.ts) og evt. i DEFAULT_SETTINGS. Valideringen følger med af sig selv.

import { KM_STOPS, LEASE_TERMS } from './defaults.ts'
import type { LeaseTerm, NumberField, ValidationCode } from './types.ts'

export interface NumberFieldSpec {
  /** Id i SPEC.md. */
  id: string
  /** 'loan': bruges og valideres kun ved lån (B1 > 0). */
  scope: 'always' | 'loan'
  /** Har feltet en beregnet standardværdi, må det stå tomt (I5 og I6). */
  computedDefault?: boolean
  isValid: (value: number) => boolean
  /** Koden, der gives, når værdien ikke er gyldig. */
  code: ValidationCode
}

const nonNegative = (v: number) => v >= 0
const percent = (v: number) => v >= 0 && v <= 100

export const NUMBER_FIELDS: Record<NumberField, NumberFieldSpec> = {
  purchasePrice: { id: 'I1', scope: 'always', isValid: (v) => v > 0, code: 'notPositive' },
  downPayment: { id: 'I2', scope: 'always', isValid: nonNegative, code: 'negative' },
  interestRatePct: { id: 'I3', scope: 'loan', isValid: nonNegative, code: 'negative' },
  loanTermMonths: {
    id: 'I4',
    scope: 'loan',
    isValid: (v) => v > 0 && Number.isInteger(v),
    code: 'notWholeMonths',
  },
  registrationFee: { id: 'I5', scope: 'loan', computedDefault: true, isValid: nonNegative, code: 'negative' },
  establishmentFee: { id: 'I6', scope: 'loan', computedDefault: true, isValid: nonNegative, code: 'negative' },
  monthlyLoanFee: { id: 'I7', scope: 'loan', isValid: nonNegative, code: 'negative' },
  annualKm: {
    id: 'I12',
    scope: 'always',
    isValid: (v) => KM_STOPS.includes(v),
    code: 'invalidKm',
  },
  leaseTermMonths: {
    id: 'I13',
    scope: 'always',
    isValid: (v) => LEASE_TERMS.includes(v as LeaseTerm),
    code: 'invalidLeaseTerm',
  },
  leaseInitialPayment: { id: 'I14', scope: 'always', isValid: nonNegative, code: 'negative' },
  leaseMonthlyPayment: { id: 'I15', scope: 'always', isValid: (v) => v > 0, code: 'notPositive' },
  returnCost: { id: 'I19', scope: 'always', isValid: nonNegative, code: 'negative' },
  annualReturnPct: { id: 'I21', scope: 'always', isValid: nonNegative, code: 'negative' },
  returnTaxPct: { id: 'I22', scope: 'always', isValid: percent, code: 'percentOutOfRange' },
  interestDeductionPct: { id: 'I23', scope: 'loan', isValid: percent, code: 'percentOutOfRange' },
}

/** Talfelternes navne i samme rækkefølge som i SPEC.md. */
export const NUMBER_FIELD_NAMES = Object.keys(NUMBER_FIELDS) as NumberField[]
