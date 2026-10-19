// Advarsel (SPEC.md O4) og noter (O5 og O9) ved de relevante felter. Motoren giver kun koder;
// teksterne ligger i brugerfladen.

import { DEFAULT_SETTINGS } from './defaults.ts'
import type { Settings } from './defaults.ts'
import type { FieldNote, Inputs, Warning } from './types.ts'

export const FIELD_NOTES: readonly FieldNote[] = [
  { field: 'depreciationPct', code: 'depreciationSource' }, // O5
  { field: 'returnCost', code: 'returnInsurance' }, // O9
]

/** O4 */
export function warnings(inputs: Pick<Inputs, 'annualKm'>, settings: Settings = DEFAULT_SETTINGS): Warning[] {
  const limit = settings.highMileageKmPerYear
  if (inputs.annualKm > limit) return [{ code: 'highMileage', field: 'annualKm', limitKmPerYear: limit }]
  return []
}
