// Offentlig indgang til beregningsmotoren. Ren TypeScript uden React, DOM eller browser-API'er.
//
// Brug: createDefaultDraft() giver startværdier, validate() gør brugerens input klar, og calculate()
// giver resultatet. Alle tre tager valgfrit et Settings-objekt, hvis satserne skal komme udefra.

export * from './types.ts'
export * from './defaults.ts'
export { NUMBER_FIELD_NAMES, NUMBER_FIELDS } from './fields.ts'
export type { NumberFieldSpec } from './fields.ts'
export { validate } from './validation.ts'
export { calculate } from './calculate.ts'
export { calculateLoanNeed } from './loan.ts'
export { FREQUENCIES, isFrequency } from './runningCosts.ts'
export { FIELD_NOTES, warnings } from './notes.ts'
export type { FieldNote } from './notes.ts'
