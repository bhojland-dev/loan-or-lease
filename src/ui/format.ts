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
 * Dansk tal fra et inputfelt: "1.234,50" → 1234.5. Komma er decimaltegn, og punktum er tusindtalsseparator,
 * når det deler tallet i grupper af tre ("200.000"). Ellers læses et enkelt punktum som decimaltegn,
 * så "3.95" bliver 3,95 og ikke 395. Tomt felt giver `undefined`, ugyldigt tal giver `NaN`.
 */
export function parseDanishNumber(text: string): number | undefined {
  const cleaned = text.replace(/\s|kr\.?|%/gi, '')
  if (cleaned === '') return undefined
  // Heltal med tusindtalspunktummer og evt. komma-decimaler: "1.234", "1.234,5", "-200.000"
  if (/^-?\d{1,3}(\.\d{3})+(,\d*)?$/.test(cleaned)) return Number(cleaned.replace(/\./g, '').replace(',', '.'))
  // Uden tusindtalspunktummer: "1234,5", "3,95", "3.95", ",5"
  if (/^-?(\d+([.,]\d*)?|[.,]\d+)$/.test(cleaned)) return Number(cleaned.replace(',', '.'))
  return Number.NaN
}
