// Formularens tilstand som React-hook. Alle ændringer går gennem formReducer (form.ts);
// her lægges kun beregning, gemning og tekster ovenpå.

import { useEffect, useMemo, useReducer } from 'react'
import { calculate, calculateLoanNeed, FIELD_NOTES, validate, warnings } from '../core/index.ts'
import type { InputDraft, InputField, ValidationError } from '../core/index.ts'
import type { FieldMessages } from './fields.tsx'
import {
  clearFormState,
  createFormModel,
  formReducer,
  initialFormState,
  loadFormState,
  saveFormState,
  toDraft,
  unreadableFields,
} from './form.ts'
import { noteText, UNREADABLE_MESSAGE, validationMessage, warningMessage } from './messages.ts'

/** Lånebehovet (B1), når både købspris og udbetaling er udfyldt med tal. */
function loanNeedOf(draft: InputDraft): number | undefined {
  const { purchasePrice, downPayment } = draft
  if (purchasePrice === undefined || downPayment === undefined) return undefined
  const need = calculateLoanNeed(purchasePrice, downPayment)
  return Number.isFinite(need) ? need : undefined
}

export function useFormState() {
  const [model, dispatch] = useReducer(formReducer, null, () => createFormModel(loadFormState() ?? initialFormState()))
  const { values, committed, touched } = model

  useEffect(() => saveFormState(values), [values])

  return useMemo(() => {
    const draft = toDraft(values)
    const committedDraft = toDraft(committed)
    const validation = validate(committedDraft)
    const result = validation.ok ? calculate(validation.inputs) : null
    const unreadable = unreadableFields(values)

    const errors = new Map<InputField, ValidationError>()
    if (!validation.ok) for (const e of validation.errors) if (!errors.has(e.field)) errors.set(e.field, e)

    const annualKm = committedDraft.annualKm
    const kmWarning = annualKm !== undefined && Number.isFinite(annualKm) ? warnings({ annualKm })[0] : undefined

    return {
      /** Det, der står i felterne. */
      values,
      draft,
      result,
      /** Standardværdierne for I5 og I6 følger det, der står i felterne lige nu. */
      loanNeed: loanNeedOf(draft),
      /** Lånefelterne skjules først, når udbetalingen er bekræftet (feltet forladt). */
      noLoan: loanNeedOf(committedDraft) === 0,
      /** Antal felter, der mangler eller skal rettes. */
      problemCount: errors.size,
      dispatch,

      /** Fejl, advarsel, note og hjælpetekst for et felt. Fejl vises først, når feltet er forladt. */
      messages(field: InputField, hint?: string): FieldMessages {
        const error = errors.get(field)
        const note = FIELD_NOTES.find((n) => n.field === field)
        let errorText: string | undefined
        if (unreadable.has(field)) errorText = UNREADABLE_MESSAGE
        else if (error && touched.has(field)) errorText = validationMessage(error)
        return {
          hint,
          error: errorText,
          warning: kmWarning && field === kmWarning.field ? warningMessage(kmWarning) : undefined,
          note: note && noteText(note.code),
        }
      },

      /** Vis fejl ved alle felter, der mangler eller skal rettes. */
      showProblems: () => dispatch({ type: 'showProblems', fields: [...errors.keys()] }),
      /** Tømmer alle felter og det gemte, så siden starter forfra med standardværdierne. */
      reset() {
        clearFormState()
        dispatch({ type: 'reset' })
      },
    }
  }, [values, committed, touched])
}

export type FormApi = ReturnType<typeof useFormState>
