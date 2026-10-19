// Regler for hvert talfelt (SPEC.md afsnit 1), samlet ét sted. Nye talfelter tilføjes her,
// i InputDraft og Inputs (types.ts) og evt. i DEFAULT_SETTINGS. Valideringen følger med af sig selv.

import { KM_STOPS, LEASE_TERMS } from './defaults.ts'
import type { LeaseTerm, NumberField } from './types.ts'

export interface NumberFieldSpec {
  /** Id i SPEC.md. */
  id: string
  /** 'loan': bruges og valideres kun ved lån (B1 > 0). */
  scope: 'always' | 'loan'
  /** Har feltet en beregnet standardværdi, må det stå tomt (I5 og I6). */
  computedDefault?: boolean
  isValid: (value: number) => boolean
  message: string
}

const nonNegative = (v: number) => v >= 0
const percent = (v: number) => v >= 0 && v <= 100
const NON_NEGATIVE = 'Værdien må ikke være negativ.'
const PERCENT = 'Procenten skal være mellem 0 og 100.'

export const NUMBER_FIELDS: Record<NumberField, NumberFieldSpec> = {
  purchasePrice: { id: 'I1', scope: 'always', isValid: (v) => v > 0, message: 'Købsprisen skal være større end 0.' },
  downPayment: { id: 'I2', scope: 'always', isValid: nonNegative, message: NON_NEGATIVE },
  interestRatePct: { id: 'I3', scope: 'loan', isValid: nonNegative, message: 'Renten må ikke være negativ.' },
  loanTermMonths: {
    id: 'I4',
    scope: 'loan',
    isValid: (v) => v > 0 && Number.isInteger(v),
    message: 'Løbetiden skal være et helt antal måneder større end 0.',
  },
  registrationFee: { id: 'I5', scope: 'loan', computedDefault: true, isValid: nonNegative, message: NON_NEGATIVE },
  establishmentFee: { id: 'I6', scope: 'loan', computedDefault: true, isValid: nonNegative, message: NON_NEGATIVE },
  monthlyLoanFee: { id: 'I7', scope: 'loan', isValid: nonNegative, message: NON_NEGATIVE },
  annualKm: {
    id: 'I12',
    scope: 'always',
    isValid: (v) => KM_STOPS.includes(v),
    message: 'Vælg mellem 10.000 og 45.000 km i trin af 5.000.',
  },
  leaseTermMonths: {
    id: 'I13',
    scope: 'always',
    isValid: (v) => LEASE_TERMS.includes(v as LeaseTerm),
    message: 'Løbetiden skal være 12, 24, 36 eller 48 måneder.',
  },
  leaseInitialPayment: { id: 'I14', scope: 'always', isValid: nonNegative, message: NON_NEGATIVE },
  leaseMonthlyPayment: { id: 'I15', scope: 'always', isValid: (v) => v > 0, message: 'Ydelsen skal være større end 0.' },
  returnCost: { id: 'I19', scope: 'always', isValid: nonNegative, message: NON_NEGATIVE },
  annualReturnPct: { id: 'I21', scope: 'always', isValid: nonNegative, message: 'Renten må ikke være negativ.' },
  returnTaxPct: { id: 'I22', scope: 'always', isValid: percent, message: PERCENT },
  interestDeductionPct: { id: 'I23', scope: 'loan', isValid: percent, message: PERCENT },
}

/** Talfelternes navne i samme rækkefølge som i SPEC.md. */
export const NUMBER_FIELD_NAMES = Object.keys(NUMBER_FIELDS) as NumberField[]
