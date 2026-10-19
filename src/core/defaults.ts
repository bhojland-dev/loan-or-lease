// Alle standardværdier fra SPEC.md, samlet ét sted.

import type { DepreciationPct, Frequency, InputDraft, LeaseTerm } from './types.ts'

// I5 tinglysningsafgift: 1.850 kr. + 1,5 % af lånebehovet, hele beløbet oprundet til nærmeste 100 kr.
// Kilde: Skat.dk, ny afgiftssats pr. 1. januar 2026, og Tinglysningsretten (2026).
export const REGISTRATION_FEE_FIXED = 1850
export const REGISTRATION_FEE_RATE = 0.015
export const REGISTRATION_FEE_ROUNDING = 100

// I6 stiftelsesprovision: 1,25 % af lånebehovet, min. 2.000 kr., maks. 10.000 kr.
// Kilde: AL Sydbank, prisliste udlån april 2026.
export const ESTABLISHMENT_FEE_RATE = 0.0125
export const ESTABLISHMENT_FEE_MIN = 2000
export const ESTABLISHMENT_FEE_MAX = 10000

// I7 løbende lånegebyr. Kilde: SPEC.md (2026).
export const MONTHLY_LOAN_FEE = 0

// I9 afskrivning år 1-4: ca. 20 % tab i år 1 og ca. 50 % efter 4 år, ligeligt fordelt på år 2-4.
// Kilde: Bilbasen/Bilinfo, "Penge ud af vinduet" (ca. 2016).
export const DEPRECIATION_PCT: DepreciationPct = [20, 14.5, 14.5, 14.5]

// I11 ejerafgift betales halvårligt. Kilde: SPEC.md (2026).
export const OWNERSHIP_TAX_FREQUENCY: Frequency = 'halfYear'

// I13 leasingaftalens løbetid. Kilde: SPEC.md (2026).
export const LEASE_TERM_MONTHS: LeaseTerm = 48
export const LEASE_TERMS: readonly LeaseTerm[] = [12, 24, 36, 48]

// I16 inkluderede km/år: 10.000-45.000 i trin af 5.000. Kilde: SPEC.md (2026).
export const INCLUDED_KM_PER_YEAR = 15000
export const INCLUDED_KM_MIN = 10000
export const INCLUDED_KM_MAX = 45000
export const INCLUDED_KM_STEP = 5000

// I18 exit-omkostning ved førtidig ophør: 0 kr. forudsætter FDM's standardkontrakt.
// Kilde: FDM, leasingkontrakt (2026).
export const EARLY_EXIT_COST = 0

// I19 egenbetaling ved aflevering. Kilde: SPEC.md (2026), jf. If, tilbageleveringsforsikring (Leasing Super).
export const RETURN_COST = 5000

// I20 afkast "til". Kilde: SPEC.md (2026).
export const INVEST_DIFFERENCE = true

// I21 årlig afkastrente i %. Kilde: SPEC.md (2026); kilden til satsen er ikke angivet.
export const ANNUAL_RETURN_PCT = 0.25

// I22 skattesats på afkast i %. Kilde: SPEC.md (2026), jf. BankInvest, skatteguide 2026.
export const RETURN_TAX_PCT = 37

// O4: advarsel ved kørsel over denne grænse (km/år). Kilde: SPEC.md (2026).
export const HIGH_MILEAGE_KM_PER_YEAR = 20000

// Tidspunkter, der sammenlignes (mdr.). Kilde: SPEC.md (2026).
export const COMPARISON_MONTHS: readonly LeaseTerm[] = [12, 24, 36, 48]

/** Standardværdi for I5 beregnet af lånebehovet L. */
export function defaultRegistrationFee(loanNeed: number): number {
  // Afrund til hele øre først, så fx 150,00000000000003 ikke rundes op til næste 100 kr.
  const fee = Math.round((REGISTRATION_FEE_FIXED + REGISTRATION_FEE_RATE * loanNeed) * 100) / 100
  return Math.ceil(fee / REGISTRATION_FEE_ROUNDING) * REGISTRATION_FEE_ROUNDING
}

/** Standardværdi for I6 beregnet af lånebehovet L. */
export function defaultEstablishmentFee(loanNeed: number): number {
  const fee = ESTABLISHMENT_FEE_RATE * loanNeed
  return Math.min(ESTABLISHMENT_FEE_MAX, Math.max(ESTABLISHMENT_FEE_MIN, fee))
}

/** Formularens startværdier. I5 og I6 udelades, da de afhænger af lånebehovet. */
export function createDefaultDraft(): InputDraft {
  return {
    monthlyLoanFee: MONTHLY_LOAN_FEE,
    depreciationPct: DEPRECIATION_PCT,
    ownershipTax: { frequency: OWNERSHIP_TAX_FREQUENCY },
    leaseTermMonths: LEASE_TERM_MONTHS,
    includedKmPerYear: INCLUDED_KM_PER_YEAR,
    earlyExitCost: EARLY_EXIT_COST,
    returnCost: RETURN_COST,
    investDifference: INVEST_DIFFERENCE,
    annualReturnPct: ANNUAL_RETURN_PCT,
    returnTaxPct: RETURN_TAX_PCT,
  }
}
