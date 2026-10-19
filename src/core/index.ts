// Offentlig indgang til beregningsmotoren. Ren TypeScript uden React, DOM eller browser-API'er.

export * from './types.ts'
export * from './defaults.ts'
export { validate } from './validation.ts'
export { calculate } from './calculate.ts'
export { calculateLoanNeed } from './loan.ts'
export { FREQUENCIES, isFrequency } from './runningCosts.ts'
export { FIELD_NOTES, warnings } from './notes.ts'
export type { FieldNote } from './notes.ts'
