import { describe, expect, it } from 'vitest'
import spec from '../../SPEC.md?raw'
import { NUMBER_FIELDS } from './fields.ts'

describe('feltregler', () => {
  const ids = Object.values(NUMBER_FIELDS).map((f) => f.id)

  it('hvert talfelt har sit eget id', () => {
    expect(new Set(ids).size).toBe(ids.length)
  })

  it.each(ids)('%s står i inputtabellen i SPEC.md', (id) => {
    expect(spec).toContain(`| ${id} |`)
  })
})
