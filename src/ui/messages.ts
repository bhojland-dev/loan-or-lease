// Danske tekster til motorens koder for fejl, advarsler og noter. Motoren giver kun koder,
// så ordlyden kan ændres her uden at røre beregningerne. Hver switch dækker alle koder:
// kommer der en ny kode i motoren, fejler typecheck, indtil den har en tekst her.

import { KM_STOPS, LEASE_TERMS } from '../core/index.ts'
import type { NoteCode, ValidationError, Warning } from '../core/index.ts'
import { formatInput } from './format.ts'

/** Når feltet indeholder tekst, der ikke kan læses som et tal. Opdages i UI, før motoren ser værdien. */
export const UNREADABLE_MESSAGE = 'Skriv et tal, fx 1.234,50.'

export function validationMessage({ field, code }: ValidationError): string {
  switch (code) {
    case 'required':
      return 'Feltet skal udfyldes.'
    case 'notPositive':
      if (field === 'purchasePrice') return 'Købsprisen skal være større end 0.'
      if (field === 'leaseMonthlyPayment') return 'Ydelsen skal være større end 0.'
      return 'Værdien skal være større end 0.'
    case 'negative':
      if (field === 'interestRatePct' || field === 'annualReturnPct') return 'Renten må ikke være negativ.'
      if (field === 'service' || field === 'insurance' || field === 'ownershipTax') return 'Beløbet må ikke være negativt.'
      return 'Værdien må ikke være negativ.'
    case 'notWholeMonths':
      return 'Løbetiden skal være et helt antal måneder større end 0.'
    case 'percentOutOfRange':
      return 'Procenten skal være mellem 0 og 100.'
    case 'invalidKm': {
      const step = KM_STOPS[1] - KM_STOPS[0]
      return `Vælg mellem ${formatInput(KM_STOPS[0])} og ${formatInput(KM_STOPS[KM_STOPS.length - 1])} km i trin af ${formatInput(step)}.`
    }
    case 'invalidLeaseTerm':
      return `Løbetiden skal være ${LEASE_TERMS.slice(0, -1).join(', ')} eller ${LEASE_TERMS[LEASE_TERMS.length - 1]} måneder.`
    case 'exceedsPurchasePrice':
      return 'Udbetalingen må ikke være større end købsprisen.'
    case 'missingFrequency':
      return 'Vælg en frekvens.'
    case 'depreciationIncomplete':
      return 'Udfyld afskrivning for alle fire år.'
    case 'depreciationOutOfRange':
      return 'Afskrivningen skal være mellem 0 og 100 %.'
    default:
      return unreachable(code)
  }
}

export function warningMessage(warning: Warning): string {
  switch (warning.code) {
    case 'highMileage':
      return `Du kører over ${formatInput(warning.limitKmPerYear)} km om året. Restværdien ved køb kan være sat for højt, og afskrivningsprocenterne bør hæves.`
    default:
      return unreachable(warning.code)
  }
}

export function noteText(code: NoteCode): string {
  switch (code) {
    case 'depreciationSource':
      return 'Kilde: Bilbasen/Bilinfo (ca. 2016): ca. 20 % tab i år 1 og ca. 50 % efter 4 år. Fordelingen på år 2-4 er ligelig.'
    case 'returnInsurance':
      return 'Egenbetalingen kan dækkes af en afleveringsforsikring. Så svarer beløbet til forsikringens selvrisiko, fx 5.000 kr.'
    default:
      return unreachable(code)
  }
}

function unreachable(code: never): never {
  throw new Error(`Ukendt kode: ${String(code)}`)
}
