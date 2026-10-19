// Navne og korte tekster, der bruges flere steder i brugerfladen. Feltetiketter ligger i fieldText.ts.

import type { Cheapest, Frequency, Side } from '../core/index.ts'

/** Scenariernes navne. */
export const SIDE_LABEL: Record<Side, string> = {
  buy: 'Køb med billån',
  lease: 'Privatleasing',
}

export const SIDE_INTRO: Record<Side, string> = {
  buy: 'Du ejer bilen og kan sælge den igen.',
  lease: 'Du lejer bilen og afleverer den, når aftalen slutter.',
}

/** Kort navn i dommen og tabellen over, hvad der er billigst. */
export const CHEAPEST_LABEL: Record<Cheapest, string> = {
  buy: 'Køb',
  lease: 'Leasing',
  equal: 'Lige dyre',
}

export const FREQUENCY_LABEL: Record<Frequency, string> = {
  month: 'pr. måned',
  quarter: 'pr. kvartal',
  halfYear: 'pr. halvår',
  year: 'pr. år',
}

export const CHOOSE_FREQUENCY = 'Vælg frekvens'

/** Poster i opdelingen af TCO og de månedlige udgifter, der ikke er et inputfelt. */
export const POST_LABEL = {
  interestDeduction: 'Rentefradrag',
  investmentReturn: 'Afkast efter skat',
} as const
