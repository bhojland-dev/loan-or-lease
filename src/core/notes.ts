// Advarsler og noter (SPEC.md O4-O7), der vises ved de relevante felter.

import { HIGH_MILEAGE_KM_PER_YEAR } from './defaults.ts'
import type { InputField, Inputs, Warning } from './types.ts'

export const HIGH_MILEAGE_WARNING =
  'Du kører over 20.000 km om året. Restværdien ved køb kan være sat for højt, og afskrivningsprocenterne bør hæves.'

export interface FieldNote {
  field: InputField
  text: string
}

// O5-O7
export const FIELD_NOTES: readonly FieldNote[] = [
  {
    field: 'depreciationPct',
    text: 'Kilde: Bilbasen/Bilinfo (ca. 2016): ca. 20 % tab i år 1 og ca. 50 % efter 4 år. Fordelingen på år 2-4 er ligelig.',
  },
  {
    field: 'earlyExitCost',
    text: "0 kr. forudsætter FDM's standardkontrakt. Tjek egen aftale.",
  },
  {
    field: 'returnTaxPct',
    text: 'Skat beregnes samlet af gevinsten. Der tages ikke højde for grænsen på 55.000 kr. eller skat år for år.',
  },
]

/** O4 */
export function warnings(inputs: Pick<Inputs, 'annualKm'>): Warning[] {
  if (inputs.annualKm > HIGH_MILEAGE_KM_PER_YEAR) {
    return [{ code: 'highMileage', field: 'annualKm', message: HIGH_MILEAGE_WARNING }]
  }
  return []
}
