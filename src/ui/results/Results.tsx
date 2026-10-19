// Visning af O1-O3 og O10. Alle tal kommer fra src/core.

import { useState } from 'react'
import type { Result } from '../../core/index.ts'
import { Amortization } from './Amortization.tsx'
import { BreakEven } from './BreakEven.tsx'
import { Comparison } from './Comparison.tsx'
import { MonthlyCosts } from './MonthlyCosts.tsx'
import { Summary } from './Summary.tsx'

export function Results({ result }: { result: Result }) {
  const last = result.comparison[result.comparison.length - 1]
  const [chosen, setChosen] = useState(last.months)
  // Bliver leasingperioden kortere end det valgte tidspunkt, vises det sidste.
  const row = result.comparison.find((r) => r.months === chosen) ?? last
  return (
    <>
      <Summary result={result} row={row} onChoose={setChosen} />
      <MonthlyCosts row={row} />
      <Comparison result={result} />
      <BreakEven result={result} />
      <Amortization result={result} />
    </>
  )
}
