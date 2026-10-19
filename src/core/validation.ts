// Validering af input (SPEC.md afsnit 1 og O8). Beregningen gennemføres kun, når alt er gyldigt.

import { DEFAULT_SETTINGS, defaultEstablishmentFee, defaultRegistrationFee } from './defaults.ts'
import type { Settings } from './defaults.ts'
import { NUMBER_FIELD_NAMES, NUMBER_FIELDS } from './fields.ts'
import { calculateLoanNeed } from './loan.ts'
import { isFrequency } from './runningCosts.ts'
import type {
  DepreciationPct,
  InputDraft,
  InputField,
  LeaseTerm,
  NumberField,
  PeriodicAmount,
  PeriodicField,
  ValidationCode,
  ValidationError,
  ValidationResult,
} from './types.ts'

function isNumber(value: number | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

export function validate(draft: InputDraft, settings: Settings = DEFAULT_SETTINGS): ValidationResult {
  const errors: ValidationError[] = []
  const add = (field: InputField, code: ValidationCode) => errors.push({ field, code })

  // Lånefelterne bruges kun ved lån (B1 > 0). Mangler købspris eller udbetaling, regnes der ikke med lån.
  const loanNeed =
    isNumber(draft.purchasePrice) && isNumber(draft.downPayment)
      ? calculateLoanNeed(draft.purchasePrice, draft.downPayment)
      : 0
  const hasLoan = loanNeed > 0
  const computedDefaults: Partial<Record<NumberField, number>> = {
    registrationFee: defaultRegistrationFee(loanNeed, settings),
    establishmentFee: defaultEstablishmentFee(loanNeed, settings),
  }

  // Talfelter. Et ugyldigt felt giver 0, så resten af valideringen kan fortsætte.
  const numbers = {} as Record<NumberField, number>
  for (const field of NUMBER_FIELD_NAMES) {
    const spec = NUMBER_FIELDS[field]
    const value = draft[field]
    if (spec.scope === 'loan' && !hasLoan) {
      numbers[field] = 0
    } else if (spec.computedDefault && value === undefined) {
      numbers[field] = computedDefaults[field] ?? 0
    } else if (!isNumber(value)) {
      add(field, 'required')
      numbers[field] = 0
    } else {
      if (!spec.isValid(value)) add(field, spec.code)
      numbers[field] = value
    }
  }

  if (isNumber(draft.purchasePrice) && isNumber(draft.downPayment) && draft.downPayment > draft.purchasePrice) {
    add('downPayment', 'exceedsPurchasePrice')
  }

  // Beløb med frekvens. Kun én fejl pr. felt: mangler beløbet, er 'required' nok.
  function periodic(field: PeriodicField): PeriodicAmount {
    const { amount, frequency } = draft[field] ?? {}
    if (!isNumber(amount)) {
      add(field, 'required')
      return { amount: 0, frequency: 'month' }
    }
    if (amount < 0) add(field, 'negative')
    if (!isFrequency(frequency)) {
      add(field, 'missingFrequency')
      return { amount, frequency: 'month' }
    }
    return { amount, frequency }
  }
  const service = periodic('service')
  const insurance = periodic('insurance')
  const ownershipTax = periodic('ownershipTax')

  const depreciation = draft.depreciationPct
  let depreciationPct: DepreciationPct = [0, 0, 0, 0]
  if (depreciation === undefined || depreciation.length !== 4 || !depreciation.every(isNumber)) {
    add('depreciationPct', 'depreciationIncomplete')
  } else {
    if (!depreciation.every((v) => v >= 0 && v <= 100)) add('depreciationPct', 'depreciationOutOfRange')
    depreciationPct = depreciation
  }

  if (errors.length > 0) return { ok: false, errors }

  return {
    ok: true,
    inputs: {
      ...numbers,
      leaseTermMonths: numbers.leaseTermMonths as LeaseTerm,
      service,
      insurance,
      ownershipTax,
      depreciationPct,
    },
  }
}
