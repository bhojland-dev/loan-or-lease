// Advarsel (SPEC.md O4) og noter (O5 og O9), der vises ved de relevante felter.

import { HIGH_MILEAGE_KM_PER_YEAR } from './defaults.ts'
import type { InputField, Inputs, Warning } from './types.ts'

const HIGH_MILEAGE_WARNING =
  'Du kører over 20.000 km om året. Restværdien ved køb kan være sat for højt, og afskrivningsprocenterne bør hæves.'

export interface FieldNote {
  field: InputField
  text: string
}

// O5 og O9
export const FIELD_NOTES: readonly FieldNote[] = [
  {
    field: 'depreciationPct',
    text: 'Kilde: Bilbasen/Bilinfo (ca. 2016): ca. 20 % tab i år 1 og ca. 50 % efter 4 år. Fordelingen på år 2-4 er ligelig.',
  },
  {
    field: 'returnCost',
    text: 'Egenbetalingen kan dækkes af en afleveringsforsikring. Så svarer beløbet til forsikringens selvrisiko, fx 5.000 kr.',
  },
]

/** O4 */
export function warnings(inputs: Pick<Inputs, 'annualKm'>): Warning[] {
  if (inputs.annualKm > HIGH_MILEAGE_KM_PER_YEAR) {
    return [{ code: 'highMileage', field: 'annualKm', message: HIGH_MILEAGE_WARNING }]
  }
  return []
}
