// Formularens tilstand (tekst som brugeren har skrevet) og oversættelse til motorens InputDraft.

import { createDefaultDraft } from '../core/index.ts'
import type { Frequency, InputDraft, InputField } from '../core/index.ts'
import { formatInput, parseDanishNumber } from './format.ts'

export type NumberField = Exclude<
  InputField,
  'service' | 'insurance' | 'ownershipTax' | 'depreciationPct' | 'investDifference'
>
export type PeriodicField = 'service' | 'insurance' | 'ownershipTax'

export interface PeriodicText {
  amount: string
  frequency: Frequency | ''
}

export interface FormState {
  numbers: Record<NumberField, string>
  periodic: Record<PeriodicField, PeriodicText>
  depreciation: [string, string, string, string]
  investDifference: boolean
}

const NUMBER_FIELDS: readonly NumberField[] = [
  'purchasePrice',
  'downPayment',
  'interestRatePct',
  'loanTermMonths',
  'registrationFee',
  'establishmentFee',
  'monthlyLoanFee',
  'annualKm',
  'leaseTermMonths',
  'leaseInitialPayment',
  'leaseMonthlyPayment',
  'includedKmPerYear',
  'excessKmPrice',
  'earlyExitCost',
  'returnCost',
  'annualReturnPct',
  'returnTaxPct',
]

export function initialFormState(): FormState {
  const draft = createDefaultDraft()
  const numbers = Object.fromEntries(NUMBER_FIELDS.map((f) => [f, formatInput(draft[f])])) as Record<NumberField, string>
  const periodic = (field: PeriodicField): PeriodicText => ({
    amount: formatInput(draft[field]?.amount),
    frequency: draft[field]?.frequency ?? '',
  })
  const dep = draft.depreciationPct ?? [undefined, undefined, undefined, undefined]
  return {
    numbers,
    periodic: { service: periodic('service'), insurance: periodic('insurance'), ownershipTax: periodic('ownershipTax') },
    depreciation: [formatInput(dep[0]), formatInput(dep[1]), formatInput(dep[2]), formatInput(dep[3])],
    investDifference: draft.investDifference ?? true,
  }
}

export function toDraft(form: FormState): InputDraft {
  const draft: InputDraft = {}
  for (const field of NUMBER_FIELDS) draft[field] = parseDanishNumber(form.numbers[field])
  for (const field of ['service', 'insurance', 'ownershipTax'] as const) {
    const { amount, frequency } = form.periodic[field]
    draft[field] = { amount: parseDanishNumber(amount), frequency: frequency === '' ? undefined : frequency }
  }
  const dep = form.depreciation.map((v) => parseDanishNumber(v) ?? Number.NaN)
  draft.depreciationPct = [dep[0], dep[1], dep[2], dep[3]]
  draft.investDifference = form.investDifference
  return draft
}

/** Felter, hvor teksten ikke kan læses som et tal. */
export function unreadableFields(form: FormState): Set<InputField> {
  const fields = new Set<InputField>()
  const bad = (text: string) => Number.isNaN(parseDanishNumber(text))
  for (const field of NUMBER_FIELDS) if (bad(form.numbers[field])) fields.add(field)
  for (const field of ['service', 'insurance', 'ownershipTax'] as const) if (bad(form.periodic[field].amount)) fields.add(field)
  if (form.depreciation.some(bad)) fields.add('depreciationPct')
  return fields
}
