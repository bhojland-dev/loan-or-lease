// Validering af input (SPEC.md afsnit 1 og O8). Beregningen gennemføres kun, når alt er gyldigt.

import {
  defaultEstablishmentFee,
  defaultRegistrationFee,
  INCLUDED_KM_MAX,
  INCLUDED_KM_MIN,
  INCLUDED_KM_STEP,
  LEASE_TERMS,
} from './defaults.ts'
import { calculateLoanNeed } from './loan.ts'
import type {
  DepreciationPct,
  Frequency,
  InputDraft,
  InputField,
  LeaseTerm,
  PeriodicAmount,
  ValidationError,
  ValidationResult,
} from './types.ts'

const FREQUENCIES: readonly Frequency[] = ['month', 'quarter', 'halfYear', 'year']

const REQUIRED = 'Feltet skal udfyldes.'

function isNumber(value: number | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

export function validate(draft: InputDraft): ValidationResult {
  const errors: ValidationError[] = []

  function add(field: InputField, message: string): void {
    errors.push({ field, message })
  }

  /** Tjekker et påkrævet tal. Returnerer 0 ved fejl, så resten af valideringen kan fortsætte. */
  function required(field: InputField, value: number | undefined, check: (v: number) => boolean, message: string): number {
    if (!isNumber(value)) {
      add(field, REQUIRED)
      return 0
    }
    if (!check(value)) add(field, message)
    return value
  }

  function optional(field: InputField, value: number | undefined, fallback: number, check: (v: number) => boolean, message: string): number {
    if (value === undefined) return fallback
    return required(field, value, check, message)
  }

  function periodic(field: InputField, value: Partial<PeriodicAmount> | undefined): PeriodicAmount {
    const amount = required(field, value?.amount, (v) => v >= 0, 'Beløbet må ikke være negativt.')
    const frequency = value?.frequency
    if (frequency === undefined || !FREQUENCIES.includes(frequency)) {
      // Kun én fejl pr. felt: mangler beløbet, er "Feltet skal udfyldes" nok.
      if (isNumber(value?.amount)) add(field, 'Vælg en frekvens.')
      return { amount, frequency: 'month' }
    }
    return { amount, frequency }
  }

  const nonNegative = (v: number) => v >= 0
  const NON_NEGATIVE = 'Værdien må ikke være negativ.'

  // Køb
  const purchasePrice = required('purchasePrice', draft.purchasePrice, (v) => v > 0, 'Købsprisen skal være større end 0.')
  const downPayment = required('downPayment', draft.downPayment, nonNegative, NON_NEGATIVE)
  if (isNumber(draft.purchasePrice) && isNumber(draft.downPayment) && downPayment > purchasePrice) {
    add('downPayment', 'Udbetalingen må ikke være større end købsprisen.')
  }

  // Lånefelterne I3-I7 bruges kun, når der er et lån (L > 0). Uden lån ignoreres de helt.
  const loanNeed = calculateLoanNeed(purchasePrice, downPayment)
  const hasLoan = loanNeed > 0
  let interestRatePct = 0
  let loanTermMonths = 0
  let registrationFee = 0
  let establishmentFee = 0
  let monthlyLoanFee = 0
  if (hasLoan) {
    interestRatePct = required('interestRatePct', draft.interestRatePct, nonNegative, 'Renten må ikke være negativ.')
    loanTermMonths = required(
      'loanTermMonths',
      draft.loanTermMonths,
      (v) => v > 0 && Number.isInteger(v),
      'Løbetiden skal være et helt antal måneder større end 0.',
    )
    registrationFee = optional('registrationFee', draft.registrationFee, defaultRegistrationFee(loanNeed), nonNegative, NON_NEGATIVE)
    establishmentFee = optional('establishmentFee', draft.establishmentFee, defaultEstablishmentFee(loanNeed), nonNegative, NON_NEGATIVE)
    monthlyLoanFee = required('monthlyLoanFee', draft.monthlyLoanFee, nonNegative, NON_NEGATIVE)
  }

  const service = periodic('service', draft.service)

  const depreciation = draft.depreciationPct
  let depreciationPct: DepreciationPct = [0, 0, 0, 0]
  if (depreciation === undefined || depreciation.length !== 4 || !depreciation.every(isNumber)) {
    add('depreciationPct', 'Udfyld afskrivning for alle fire år.')
  } else {
    if (!depreciation.every((v) => v >= 0 && v <= 100)) add('depreciationPct', 'Afskrivningen skal være mellem 0 og 100 %.')
    depreciationPct = depreciation
  }

  // Begge
  const insurance = periodic('insurance', draft.insurance)
  const ownershipTax = periodic('ownershipTax', draft.ownershipTax)
  const annualKm = required('annualKm', draft.annualKm, nonNegative, NON_NEGATIVE)

  // Leasing
  const leaseTermMonths = required(
    'leaseTermMonths',
    draft.leaseTermMonths,
    (v) => LEASE_TERMS.includes(v as LeaseTerm),
    'Løbetiden skal være 12, 24, 36 eller 48 måneder.',
  ) as LeaseTerm
  const leaseInitialPayment = required('leaseInitialPayment', draft.leaseInitialPayment, nonNegative, NON_NEGATIVE)
  const leaseMonthlyPayment = required('leaseMonthlyPayment', draft.leaseMonthlyPayment, (v) => v > 0, 'Ydelsen skal være større end 0.')
  const includedKmPerYear = required(
    'includedKmPerYear',
    draft.includedKmPerYear,
    (v) => v >= INCLUDED_KM_MIN && v <= INCLUDED_KM_MAX && v % INCLUDED_KM_STEP === 0,
    'Vælg mellem 10.000 og 45.000 km i trin af 5.000.',
  )
  const excessKmPrice = required('excessKmPrice', draft.excessKmPrice, nonNegative, NON_NEGATIVE)
  const earlyExitCost = required('earlyExitCost', draft.earlyExitCost, nonNegative, NON_NEGATIVE)
  const returnCost = required('returnCost', draft.returnCost, nonNegative, NON_NEGATIVE)

  // Afkast. I21 og I22 er kun påkrævede ved "til".
  const investDifference = draft.investDifference
  let annualReturnPct = 0
  let returnTaxPct = 0
  if (investDifference === undefined) {
    add('investDifference', 'Vælg til eller fra.')
  } else if (investDifference) {
    annualReturnPct = required('annualReturnPct', draft.annualReturnPct, nonNegative, 'Renten må ikke være negativ.')
    returnTaxPct = required('returnTaxPct', draft.returnTaxPct, (v) => v >= 0 && v <= 100, 'Skattesatsen skal være mellem 0 og 100 %.')
  }

  if (errors.length > 0) return { ok: false, errors }

  return {
    ok: true,
    inputs: {
      purchasePrice,
      downPayment,
      interestRatePct,
      loanTermMonths,
      registrationFee,
      establishmentFee,
      monthlyLoanFee,
      service,
      depreciationPct,
      insurance,
      ownershipTax,
      annualKm,
      leaseTermMonths,
      leaseInitialPayment,
      leaseMonthlyPayment,
      includedKmPerYear,
      excessKmPrice,
      earlyExitCost,
      returnCost,
      investDifference: investDifference ?? false,
      annualReturnPct,
      returnTaxPct,
    },
  }
}
