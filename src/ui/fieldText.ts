// Etiketter, enheder og faste hjælpetekster for hvert felt, samlet ét sted.

import type { NumberField, PeriodicField } from '../core/index.ts'

interface FieldText {
  label: string
  unit: string
  hint?: string
}

export const NUMBER_FIELD_TEXT: Record<NumberField, FieldText> = {
  purchasePrice: { label: 'Købspris', unit: 'kr.', hint: 'Faktisk pris efter eventuel rabat.' },
  downPayment: { label: 'Udbetaling', unit: 'kr.' },
  interestRatePct: { label: 'Debitorrente', unit: '% p.a.' },
  loanTermMonths: { label: 'Lånets løbetid', unit: 'mdr.' },
  registrationFee: { label: 'Tinglysningsafgift', unit: 'kr.' },
  establishmentFee: { label: 'Stiftelsesprovision', unit: 'kr.' },
  monthlyLoanFee: { label: 'Løbende lånegebyr', unit: 'kr./md.' },
  interestDeductionPct: {
    label: 'Fradragsprocent for renter',
    unit: '%',
    hint: 'Renterne på lånet giver fradrag i skatten. Trækkes fra i TCO for køb.',
  },
  annualKm: { label: 'Forventet kørsel pr. år', unit: 'km' },
  leaseTermMonths: { label: 'Leasingaftalens løbetid', unit: 'mdr.' },
  leaseInitialPayment: { label: 'Førstegangsydelse', unit: 'kr.' },
  leaseMonthlyPayment: { label: 'Månedlig leasingydelse', unit: 'kr./md.' },
  returnCost: { label: 'Egenbetaling ved aflevering', unit: 'kr.' },
  annualReturnPct: { label: 'Årlig afkastrente', unit: '%' },
  returnTaxPct: { label: 'Skattesats på afkast', unit: '%' },
}

export const PERIODIC_FIELD_TEXT: Record<PeriodicField, Omit<FieldText, 'unit'>> = {
  service: { label: 'Service', hint: 'Ved leasing er service inkluderet.' },
  insurance: { label: 'Forsikring' },
  ownershipTax: { label: 'Ejerafgift' },
}

export const DEPRECIATION_LABEL = 'Afskrivning pr. år'
