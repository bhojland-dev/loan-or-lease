// Giver kortene og felterne adgang til formularens tilstand uden at sende den ned gennem alle lag.

import { createContext, useContext } from 'react'
import type { FormApi } from './useFormState.ts'

export const FormContext = createContext<FormApi | null>(null)

export function useForm(): FormApi {
  const form = useContext(FormContext)
  if (!form) throw new Error('useForm skal bruges inden i <FormContext.Provider>.')
  return form
}
