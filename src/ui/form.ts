// Formularens tilstand (tekst som brugeren har skrevet), rene overgange mellem tilstande
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
  const numbers = Object.fromEntries(NUMBER_FIELD_NAMES.map((f) => [f, formatInput(draft[f])])) as Record<NumberField, string>
  const periodic = (field: PeriodicField): PeriodicText => ({
    amount: formatInput(draft[field]?.amount),
    frequency: draft[field]?.frequency ?? '',
  })
  const dep = draft.depreciationPct ?? [undefined, undefined, undefined, undefined]
  return {
    numbers,
    periodic: { service: periodic('service'), insurance: periodic('insurance'), ownershipTax: periodic('ownershipTax') },
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
