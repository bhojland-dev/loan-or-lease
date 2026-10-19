// Formularens tilstand (tekst som brugeren har skrevet), en ren reducer for alle ændringer
// og oversættelse til motorens InputDraft. Ingen React her, så det kan testes direkte.

import { createDefaultDraft, isFrequency, NUMBER_FIELD_NAMES } from '../core/index.ts'
import type { Frequency, InputDraft, InputField, NumberField, PeriodicField } from '../core/index.ts'
import { formatInput, parseDanishNumber } from './format.ts'

export interface PeriodicText {
  amount: string
  frequency: Frequency | ''
}

export interface FormState {
  numbers: Record<NumberField, string>
  periodic: Record<PeriodicField, PeriodicText>
  depreciation: [string, string, string, string]
}

export const PERIODIC_FIELDS: readonly PeriodicField[] = ['service', 'insurance', 'ownershipTax']

export function initialFormState(): FormState {
  const draft = createDefaultDraft()
  const numbers = Object.fromEntries(NUMBER_FIELD_NAMES.map((f) => [f, formatInput(draft[f])])) as Record<
    NumberField,
    string
  >
  const periodic = (field: PeriodicField): PeriodicText => ({
    amount: formatInput(draft[field]?.amount),
    frequency: draft[field]?.frequency ?? '',
  })
  const dep = draft.depreciationPct ?? [undefined, undefined, undefined, undefined]
  return {
    numbers,
    periodic: {
      service: periodic('service'),
      insurance: periodic('insurance'),
      ownershipTax: periodic('ownershipTax'),
    },
    depreciation: [formatInput(dep[0]), formatInput(dep[1]), formatInput(dep[2]), formatInput(dep[3])],
  }
}

// Overgange. Hver returnerer en ny tilstand og lader den gamle være.

export function withNumber(form: FormState, field: NumberField, text: string): FormState {
  return { ...form, numbers: { ...form.numbers, [field]: text } }
}

export function withPeriodic(form: FormState, field: PeriodicField, change: Partial<PeriodicText>): FormState {
  return { ...form, periodic: { ...form.periodic, [field]: { ...form.periodic[field], ...change } } }
}

export function withDepreciation(form: FormState, year: number, text: string): FormState {
  const depreciation = [...form.depreciation] as FormState['depreciation']
  depreciation[year] = text
  return { ...form, depreciation }
}

// Formularens samlede tilstand og alle ændringer af den, som en ren reducer.
// `values` er det, der står i felterne. `committed` er det, der regnes på: tekstfelter tæller først med,
// når man forlader feltet (commit), mens slidere og valglister tæller med det samme.

export interface FormModel {
  values: FormState
  committed: FormState
  /** Felter, brugeren har forladt. Fejl vises først for dem. */
  touched: ReadonlySet<InputField>
}

export type FormAction =
  | { type: 'typeNumber'; field: NumberField; text: string }
  | { type: 'commitNumber'; field: NumberField }
  | { type: 'chooseNumber'; field: NumberField; value: number }
  | { type: 'typePeriodicAmount'; field: PeriodicField; text: string }
  | { type: 'commitPeriodicAmount'; field: PeriodicField }
  | { type: 'chooseFrequency'; field: PeriodicField; frequency: Frequency | '' }
  | { type: 'typeDepreciation'; year: number; text: string }
  | { type: 'commitDepreciation'; year: number }
  | { type: 'touch'; field: InputField }
  | { type: 'commitAll' }
  | { type: 'showProblems'; fields: readonly InputField[] }
  | { type: 'reset' }

export function createFormModel(values: FormState): FormModel {
  return { values, committed: values, touched: new Set() }
}

export function formReducer(model: FormModel, action: FormAction): FormModel {
  const { values } = model
  const type = (next: FormState): FormModel => ({ ...model, values: next })
  const commit = (next: FormState, touched?: InputField): FormModel => ({
    values: next,
    committed: next,
    touched: touched === undefined || model.touched.has(touched) ? model.touched : new Set(model.touched).add(touched),
  })

  switch (action.type) {
    case 'typeNumber':
      return type(withNumber(values, action.field, action.text))
    case 'commitNumber':
      return commit(withNumber(values, action.field, tidy(values.numbers[action.field])), action.field)
    case 'chooseNumber':
      return commit(withNumber(values, action.field, formatInput(action.value)))
    case 'typePeriodicAmount':
      return type(withPeriodic(values, action.field, { amount: action.text }))
    case 'commitPeriodicAmount':
      return commit(
        withPeriodic(values, action.field, { amount: tidy(values.periodic[action.field].amount) }),
        action.field,
      )
    case 'chooseFrequency':
      return commit(withPeriodic(values, action.field, { frequency: action.frequency }))
    case 'typeDepreciation':
      return type(withDepreciation(values, action.year, action.text))
    case 'commitDepreciation':
      return commit(withDepreciation(values, action.year, tidy(values.depreciation[action.year])), 'depreciationPct')
    case 'touch':
      return model.touched.has(action.field) ? model : { ...model, touched: new Set(model.touched).add(action.field) }
    case 'commitAll':
      return commit(values)
    case 'showProblems':
      return { ...model, touched: new Set(action.fields) }
    case 'reset':
      return createFormModel(initialFormState())
  }
}

/** Dansk formatering af et indtastet tal, fx "200000" → "200.000". Ulæselig tekst bliver stående. */
export function tidy(text: string): string {
  const value = parseDanishNumber(text)
  return value !== undefined && Number.isFinite(value) ? formatInput(value) : text
}

export function toDraft(form: FormState): InputDraft {
  const draft: InputDraft = {}
  for (const field of NUMBER_FIELD_NAMES) draft[field] = parseDanishNumber(form.numbers[field])
  for (const field of PERIODIC_FIELDS) {
    const { amount, frequency } = form.periodic[field]
    draft[field] = { amount: parseDanishNumber(amount), frequency: frequency === '' ? undefined : frequency }
  }
  const dep = form.depreciation.map((v) => parseDanishNumber(v) ?? Number.NaN)
  draft.depreciationPct = [dep[0], dep[1], dep[2], dep[3]]
  return draft
}

/** Felter, hvor teksten ikke kan læses som et tal. */
export function unreadableFields(form: FormState): Set<InputField> {
  const fields = new Set<InputField>()
  const bad = (text: string) => Number.isNaN(parseDanishNumber(text))
  for (const field of NUMBER_FIELD_NAMES) if (bad(form.numbers[field])) fields.add(field)
  for (const field of PERIODIC_FIELDS) if (bad(form.periodic[field].amount)) fields.add(field)
  if (form.depreciation.some(bad)) fields.add('depreciationPct')
  return fields
}

// Felterne gemmes i browseren, så de ikke tømmes ved genindlæsning. Kun en bekvemmelighed:
// mangler eller fejler lageret, starter formularen bare med standardværdierne.

const STORAGE_KEY = 'loan-or-lease:form:v1'

export function saveFormState(form: FormState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form))
  } catch {
    // Lageret er ikke tilgængeligt (fx privat vindue). Ignoreres.
  }
}

/** Gemt formular lagt oven på standardværdierne, så nye felter i senere versioner får en værdi. */
export function loadFormState(): FormState | null {
  let stored: unknown
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) return null
    stored = JSON.parse(raw)
  } catch {
    return null
  }
  if (typeof stored !== 'object' || stored === null) return null
  const saved = stored as Partial<FormState>
  const base = initialFormState()
  const text = (v: unknown, fallback: string) => (typeof v === 'string' ? v : fallback)

  const numbers = { ...base.numbers }
  for (const field of NUMBER_FIELD_NAMES) numbers[field] = text(saved.numbers?.[field], base.numbers[field])

  const periodic = { ...base.periodic }
  for (const field of PERIODIC_FIELDS) {
    const s = saved.periodic?.[field]
    const frequency = s?.frequency
    periodic[field] = {
      amount: text(s?.amount, base.periodic[field].amount),
      frequency: frequency === '' || isFrequency(frequency) ? frequency : base.periodic[field].frequency,
    }
  }

  const dep = Array.isArray(saved.depreciation) ? saved.depreciation : []
  const depreciation = base.depreciation.map((d, i) => text(dep[i], d)) as FormState['depreciation']

  return { numbers, periodic, depreciation }
}

/** Glemmer de gemte felter, så siden starter forfra med standardværdierne. */
export function clearFormState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Lageret er ikke tilgængeligt. Ignoreres.
  }
}
