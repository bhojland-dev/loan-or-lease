import { describe, expect, it } from 'vitest'
import { DEPRECIATION_PCT } from './defaults.ts'
import { residualValue } from './residualValue.ts'

describe('restværdi', () => {
  it.each([
    [0, 120000],
    [12, 96000], // 120.000 × 0,80
    [24, 82080], // 96.000 × 0,855
    [36, 70178.4], // 82.080 × 0,855
    [48, 60002.532], // 70.178,4 × 0,855
  ])('120.000 kr. med standardafskrivning efter %i mdr. er %f kr.', (months, expected) => {
    expect(residualValue(120000, DEPRECIATION_PCT, months)).toBeCloseTo(expected, 6)
  })

  it('standardafskrivningen giver ca. 50 % tab efter 4 år (O5)', () => {
    expect(1 - residualValue(1, DEPRECIATION_PCT, 48)).toBeCloseTo(0.5, 1)
  })

  it('hvert års procent regnes af restværdien ved årets start', () => {
    expect(residualValue(100000, [10, 50, 0, 100], 24)).toBeCloseTo(45000, 6) // 100.000 × 0,9 × 0,5
    expect(residualValue(100000, [10, 50, 0, 100], 48)).toBe(0)
  })
})
