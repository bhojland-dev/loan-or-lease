// Navngivne regneeksempler til tests. Tallene er valgt, så resultaterne kan regnes efter i hånden,
// og eksemplerne kan genbruges som facit til en senere iOS-version.

import type { Inputs } from './types.ts'

/**
 * Rentefrit lån, så alle beløb går op. Lånebehov 100.000, hovedstol 105.400, ydelse 105.400 / 40 = 2.635 kr.
 * Leasing 36 mdr. med 5.000 overkørte km/år til 1 kr./km.
 */
export const RENTEFRIT_LAAN: Inputs = {
  purchasePrice: 120000,
  downPayment: 20000,
  interestRatePct: 0,
  loanTermMonths: 40,
  registrationFee: 3400,
  establishmentFee: 2000,
  monthlyLoanFee: 0,
  service: { amount: 3000, frequency: 'year' },
  depreciationPct: [20, 14.5, 14.5, 14.5],
  insurance: { amount: 6000, frequency: 'year' },
  ownershipTax: { amount: 1500, frequency: 'halfYear' },
  annualKm: 20000,
  leaseTermMonths: 36,
  leaseInitialPayment: 10000,
  leaseMonthlyPayment: 3000,
  includedKmPerYear: 15000,
  excessKmPrice: 1,
  earlyExitCost: 4000,
  returnCost: 5000,
  investDifference: false,
  annualReturnPct: 0.25,
  returnTaxPct: 37,
}

/** Lærebogslån: 100.000 kr. til 6 % p.a. over 60 mdr. giver en ydelse på 1.933,28 kr. */
export const LAEREBOGSLAAN: Inputs = {
  ...RENTEFRIT_LAAN,
  purchasePrice: 100000,
  downPayment: 0,
  interestRatePct: 6,
  loanTermMonths: 60,
  registrationFee: 0,
  establishmentFee: 0,
}

/** Kort lån på 12 mdr., der er betalt ud før leasingaftalen slutter. */
export const KORT_LAAN: Inputs = {
  ...RENTEFRIT_LAAN,
  loanTermMonths: 12,
  leaseTermMonths: 24,
}

/** Kontant køb: udbetaling = købspris, så der er intet lån. */
export const KONTANT_KOEB: Inputs = {
  ...RENTEFRIT_LAAN,
  downPayment: 120000,
  interestRatePct: 0,
  loanTermMonths: 0,
  registrationFee: 0,
  establishmentFee: 0,
}

/** Som RENTEFRIT_LAAN, men med afkast "til" ved 12 % p.a. (1 % pr. måned), så afkastet er tydeligt. */
export const MED_AFKAST: Inputs = {
  ...RENTEFRIT_LAAN,
  investDifference: true,
  annualReturnPct: 12,
  returnTaxPct: 37,
}
