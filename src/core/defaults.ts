// Standardværdier og satser fra SPEC.md, samlet i ét objekt.
//
// Motoren bruger DEFAULT_SETTINGS, medmindre der sendes andre indstillinger ind. Så kan satserne
// senere komme fra fx en API eller en fil, uden at beregningerne skal ændres: hent dem uden for
// motoren og send dem ind i createDefaultDraft(), validate() og calculate().

import type { DepreciationPct, InputDraft, LeaseTerm, PeriodicAmount } from './types.ts'

/**
 * Felter, der er input (samme navne som i InputDraft), plus satser og grænser, der ikke er input.
 * Et nyt standardfelt tilføjes her og i DEFAULT_SETTINGS; createDefaultDraft() tager det med af sig selv.
 */
export interface Settings {
  /** I5: fast beløb + sats af lånebehovet, hele beløbet oprundet. */
  registrationFee: { fixed: number; rate: number; rounding: number }
  /** I6: sats af lånebehovet inden for min og maks. */
  establishmentFee: { rate: number; min: number; max: number }
  monthlyLoanFee: number // I7
  depreciationPct: DepreciationPct // I9
  ownershipTax: PeriodicAmount // I11
  annualKm: number // I12
  leaseTermMonths: LeaseTerm // I13
  returnCost: number // I19
  annualReturnPct: number // I21
  returnTaxPct: number // I22
  interestDeductionPct: number // I23
  /** O4: advarsel ved kørsel over denne grænse (km/år). */
  highMileageKmPerYear: number
}

export const DEFAULT_SETTINGS: Settings = {
  // Kilde: Skat.dk, ny afgiftssats pr. 1. januar 2026, og Tinglysningsretten (2026).
  registrationFee: { fixed: 1850, rate: 0.015, rounding: 100 },
  // Kilde: AL Sydbank, prisliste udlån april 2026.
  establishmentFee: { rate: 0.0125, min: 2000, max: 10000 },
  // Kilde: SPEC.md (2026).
  monthlyLoanFee: 0,
  // Ca. 20 % tab i år 1 og ca. 50 % efter 4 år, ligeligt fordelt på år 2-4.
  // Kilde: Bilbasen/Bilinfo, "Penge ud af vinduet" (ca. 2016).
  depreciationPct: [20, 14.5, 14.5, 14.5],
  // Typisk for moderne elbiler (2026). Ingen kilde, valgt af Brian.
  ownershipTax: { amount: 460, frequency: 'halfYear' },
  // Kilde: SPEC.md (2026).
  annualKm: 15000,
  // Kilde: SPEC.md (2026).
  leaseTermMonths: 48,
  // Kilde: SPEC.md (2026), jf. If, tilbageleveringsforsikring (Leasing Super).
  returnCost: 5000,
  // Kilde: SPEC.md (2026); kilden til satsen er ikke angivet.
  annualReturnPct: 0.25,
  // Kilde: SPEC.md (2026), jf. BankInvest, skatteguide 2026.
  returnTaxPct: 37,
  // Ca. skatteværdien af negativ kapitalindkomst under 50.000 kr. om året. Kilde: valgt af Brian (2026).
  interestDeductionPct: 33,
  // Kilde: SPEC.md (2026).
  highMileageKmPerYear: 20000,
}

// Faste regler, ikke standardværdier. Kilde: SPEC.md (2026).

const KM_MIN = 10000
const KM_MAX = 45000
const KM_STEP = 5000

/** I12: de tilladte værdier, 10.000-45.000 km/år i trin af 5.000. */
export const KM_STOPS: readonly number[] = Array.from(
  { length: (KM_MAX - KM_MIN) / KM_STEP + 1 },
  (_, i) => KM_MIN + i * KM_STEP,
)

/** I13: leasingaftalens mulige løbetider (mdr.). */
export const LEASE_TERMS: readonly LeaseTerm[] = [12, 24, 36, 48]

/** Tidspunkter t, der sammenlignes (mdr.): de samme som de mulige løbetider. */
export const COMPARISON_MONTHS: readonly LeaseTerm[] = LEASE_TERMS

/** Standardværdi for I5 beregnet af lånebehovet L. */
export function defaultRegistrationFee(loanNeed: number, settings: Settings = DEFAULT_SETTINGS): number {
  const { fixed, rate, rounding } = settings.registrationFee
  // Afrund til hele øre først, så fx 150,00000000000003 ikke rundes op til næste 100 kr.
  const fee = Math.round((fixed + rate * loanNeed) * 100) / 100
  return Math.ceil(fee / rounding) * rounding
}

/** Standardværdi for I6 beregnet af lånebehovet L. */
export function defaultEstablishmentFee(loanNeed: number, settings: Settings = DEFAULT_SETTINGS): number {
  const { rate, min, max } = settings.establishmentFee
  return Math.min(max, Math.max(min, rate * loanNeed))
}

/** Formularens startværdier: alle felter i Settings, der er input. I5 og I6 afhænger af lånebehovet. */
export function createDefaultDraft(settings: Settings = DEFAULT_SETTINGS): InputDraft {
  // Satserne for I5 og I6 og grænsen for O4 er ikke input og skal ikke med.
  const { registrationFee, establishmentFee, highMileageKmPerYear, ...fieldDefaults } = settings
  return { ...fieldDefaults, ownershipTax: { ...settings.ownershipTax } }
}
