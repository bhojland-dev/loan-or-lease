// Dansk visning og indtastning af tal. Ingen beregninger her.

const kr = new Intl.NumberFormat('da-DK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const plain = new Intl.NumberFormat('da-DK', { maximumFractionDigits: 4 })
const pct = new Intl.NumberFormat('da-DK', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

/** 1234.5 → "1.234,50 kr." */
export function formatKr(value: number): string {
  // Undgå "-0,00 kr." ved afrundingsstøj.
  return `${kr.format(Math.abs(value) < 0.005 ? 0 : value)} kr.`
}

/** Brøk til procent: 0.43 → "43,0 %" */
export function formatFraction(value: number): string {
  return `${pct.format(value * 100)} %`
}

/** Tal til et inputfelt: 1234.5 → "1.234,5" */
export function formatInput(value: number | undefined): string {
  return value === undefined ? '' : plain.format(value)
}

/** Antal måneder som tekst: 12 → "1 år", 24 → "2 år" */
export function formatMonths(months: number): string {
  return months % 12 === 0 ? `${months / 12} år` : `${months} mdr.`
}

/**
 * Dansk tal fra et inputfelt: "1.234,50" → 1234.5. Punktum er tusindtalsseparator og komma decimaltegn.
 * Tomt felt giver `undefined`, ugyldigt tal giver `NaN`.
 */
export function parseDanishNumber(text: string): number | undefined {
  const cleaned = text.replace(/\s|kr\.?|%/gi, '')
  if (cleaned === '') return undefined
  if (!/^-?[\d.]*,?\d*$/.test(cleaned) || !/\d/.test(cleaned)) return Number.NaN
  return Number(cleaned.replace(/\./g, '').replace(',', '.'))
}
