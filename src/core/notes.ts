// Advarsel (SPEC.md O4) og noter (O5 og O9), der vises ved de relevante felter.

import { DEFAULT_SETTINGS } from './defaults.ts'
import type { Settings } from './defaults.ts'
import type { InputField, Inputs, Warning } from './types.ts'


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

const km = new Intl.NumberFormat('da-DK')

/** O4 */
export function warnings(inputs: Pick<Inputs, 'annualKm'>, settings: Settings = DEFAULT_SETTINGS): Warning[] {
  const limit = settings.highMileageKmPerYear
  if (inputs.annualKm > limit) {
    const message = `Du kører over ${km.format(limit)} km om året. Restværdien ved køb kan være sat for højt, og afskrivningsprocenterne bør hæves.`
    return [{ code: 'highMileage', field: 'annualKm', message }]
  }
  return []
}
