// Formularens tilstand som React-hook: hvad der står i felterne, hvad der regnes på, og resultatet.
//
// `form` er det, der står i felterne. `calcForm` er det, der regnes på: tekstfelter tæller først med,
// når man forlader feltet (commit), mens slidere og valglister tæller med det samme.

import { useEffect, useMemo, useState } from 'react'
import { calculate, calculateLoanNeed, FIELD_NOTES, validate, warnings } from '../core/index.ts'
import type { Frequency, InputDraft, InputField, NumberField, PeriodicField, ValidationError } from '../core/index.ts'
import type { FieldMessages } from './fields.tsx'
import { formatInput } from './format.ts'
import {
  clearFormState,
  initialFormState,
  loadFormState,
  saveFormState,
  tidy,
  toDraft,
  unreadableFields,
  withDepreciation,
  withNumber,
  withPeriodic,
} from './form.ts'
import type { FormState } from './form.ts'
import { noteText, UNREADABLE_MESSAGE, validationMessage, warningMessage } from './messages.ts'

/** Lånebehovet (B1), når både købspris og udbetaling er udfyldt med tal. */
function loanNeedOf(draft: InputDraft): number | undefined {
  const { purchasePrice, downPayment } = draft
  if (purchasePrice === undefined || downPayment === undefined) return undefined
  const need = calculateLoanNeed(purchasePrice, downPayment)
  return Number.isFinite(need) ? need : undefined
}

export function useFormState() {
  const [form, setForm] = useState<FormState>(() => loadFormState() ?? initialFormState())
  const [calcForm, setCalcForm] = useState<FormState>(form)
  const [touched, setTouched] = useState<ReadonlySet<InputField>>(new Set())

  useEffect(() => saveFormState(form), [form])

  const draft = useMemo(() => toDraft(form), [form])
  const calcDraft = useMemo(() => toDraft(calcForm), [calcForm])
  const validation = useMemo(() => validate(calcDraft), [calcDraft])
  const result = useMemo(() => (validation.ok ? calculate(validation.inputs) : null), [validation])
  const unreadable = useMemo(() => unreadableFields(form), [form])

  const errors = useMemo(() => {
    const map = new Map<InputField, ValidationError>()
    if (!validation.ok) for (const e of validation.errors) if (!map.has(e.field)) map.set(e.field, e)
    return map
  }, [validation])

  const kmWarning =
    calcDraft.annualKm !== undefined && Number.isFinite(calcDraft.annualKm)
      ? warnings({ annualKm: calcDraft.annualKm })[0]
      : undefined

  /** Opdaterer felterne og, hvis `commit`, også det der regnes på. */
  function apply(next: FormState, commit: boolean) {
    setForm(next)
    if (commit) setCalcForm(next)
  }

  function touch(field: InputField) {
    setTouched((prev) => (prev.has(field) ? prev : new Set(prev).add(field)))
  }

  return {
    form,
    /** Standardværdierne for I5 og I6 følger det, der står i felterne lige nu. */
    loanNeed: loanNeedOf(draft),
    /** Lånefelterne skjules først, når udbetalingen er bekræftet (feltet forladt). */
    noLoan: loanNeedOf(calcDraft) === 0,
    draft,
    validation,
    result,
    /** Antal felter, der mangler eller skal rettes. */
    problemCount: errors.size,

    /** Fejl, advarsel, note og hjælpetekst for et felt. Fejl vises først, når feltet er forladt. */
    messages(field: InputField, hint?: string): FieldMessages {
      const error = errors.get(field)
      const note = FIELD_NOTES.find((n) => n.field === field)
      return {
        hint,
        error: unreadable.has(field)
          ? UNREADABLE_MESSAGE
          : touched.has(field) && error
            ? validationMessage(error)
            : undefined,
        warning: kmWarning && field === kmWarning.field ? warningMessage(kmWarning) : undefined,
        note: note && noteText(note.code),
      }
    },

    // Tekstfelter: skriv uden at regne, regn når feltet forlades.
    typeNumber: (field: NumberField, text: string) => apply(withNumber(form, field, text), false),
    commitNumber(field: NumberField) {
      apply(withNumber(form, field, tidy(form.numbers[field])), true)
      touch(field)
    },
    typePeriodicAmount: (field: PeriodicField, amount: string) => apply(withPeriodic(form, field, { amount }), false),
    commitPeriodicAmount(field: PeriodicField) {
      apply(withPeriodic(form, field, { amount: tidy(form.periodic[field].amount) }), true)
      touch(field)
    },
    typeDepreciation: (year: number, text: string) => apply(withDepreciation(form, year, text), false),
    commitDepreciation(year: number) {
      apply(withDepreciation(form, year, tidy(form.depreciation[year])), true)
      touch('depreciationPct')
    },

    // Slidere og valglister: regn med det samme.
    chooseNumber: (field: NumberField, value: number) => apply(withNumber(form, field, formatInput(value)), true),
    chooseFrequency: (field: PeriodicField, frequency: Frequency | '') => apply(withPeriodic(form, field, { frequency }), true),
    touch,

    /** Enter i et felt: regn på det, der står. */
    commitAll: () => apply(form, true),
    /** Vis fejl ved alle felter, der mangler eller skal rettes. */
    showProblems: () => setTouched(new Set(errors.keys())),
    /** Tømmer alle felter og det gemte, så siden starter forfra med standardværdierne. */
    reset() {
      clearFormState()
      const fresh = initialFormState()
      apply(fresh, true)
      setTouched(new Set())
    },
  }
}

export type FormApi = ReturnType<typeof useFormState>
