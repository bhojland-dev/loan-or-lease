import type { ComparisonRow, Result, Side } from '../../core/index.ts'
import { AnimatedNumber } from '../AnimatedNumber.tsx'
import { formatKr, formatMonths } from '../format.ts'
import { CHEAPEST_LABEL, SIDE_LABEL } from '../labels.ts'
import { Breakdown } from './Breakdown.tsx'

interface SummaryProps {
  result: Result
  row: ComparisonRow
  onChoose: (months: number) => void
}

/** O1 for ét valgt tidspunkt: køb og leasing over for hinanden. */
export function Summary({ result, row, onChoose }: SummaryProps) {
  // Bjælkerne viser TCO i forhold til den største af de to.
  const max = Math.max(row.buy.total, row.lease.total, 1)

  return (
    <section className="card summary" aria-labelledby="summary-title">
      <div className="summary-head">
        <h2 id="summary-title">Resultat efter {formatMonths(row.months)}</h2>
        <div className="segmented" role="radiogroup" aria-label="Vis resultat efter">
          {result.comparison.map((r) => (
            <button
              key={r.months}
              type="button"
              role="radio"
              aria-checked={r.months === row.months}
              className={r.months === row.months ? 'is-active' : undefined}
              onClick={() => onChoose(r.months)}
            >
              {formatMonths(r.months)}
            </button>
          ))}
        </div>
      </div>

      <Verdict row={row} />

      <div className="tiles">
        <TotalTile side="buy" row={row} max={max} />
        <TotalTile side="lease" row={row} max={max} />
      </div>

      <Breakdown row={row} />
    </section>
  )
}

/** Dommen øverst i resultatet, så svaret er det første, man ser. */
function Verdict({ row }: { row: ComparisonRow }) {
  const period = formatMonths(row.months)
  if (row.cheapest === 'equal') {
    return (
      <p className="verdict" role="status">
        <span className="verdict-who">
          {CHEAPEST_LABEL.equal} efter {period}
        </span>
      </p>
    )
  }
  return (
    <p className={`verdict verdict-${row.cheapest}`} role="status">
      {/* key får dommen til at poppe ind igen, når vinderen skifter. */}
      <span key={row.cheapest} className="verdict-who">
        <strong>{CHEAPEST_LABEL[row.cheapest]} er billigst</strong> efter {period}
      </span>
      <span className="verdict-amount">
        <AnimatedNumber value={Math.abs(row.difference)} format={formatKr} /> billigere
      </span>
    </p>
  )
}

interface TotalTileProps {
  side: Side
  row: ComparisonRow
  max: number
}

function TotalTile({ side, row, max }: TotalTileProps) {
  const total = row[side].total
  const winner = row.cheapest === side
  return (
    <div className={`tile tile-${side}${winner ? ' is-winner' : ''}`}>
      <span className="tile-k">
        <span className="dot" aria-hidden="true" />
        {SIDE_LABEL[side]}
      </span>
      <span className="tile-v">
        <AnimatedNumber value={total} format={formatKr} />
      </span>
      <span className="tile-bar" aria-hidden="true">
        <span style={{ width: `${Math.max(0, (total / max) * 100)}%` }} />
      </span>
      <span className="tile-s">Samlede omkostninger (TCO)</span>
    </div>
  )
}
