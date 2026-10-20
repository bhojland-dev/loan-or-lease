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

      <div className="tiles">
        <TotalTile side="buy" row={row} max={max} />
        <TotalTile side="lease" row={row} max={max} />
      </div>

      {/* Dommen til skærmlæsere. Visuelt står den som et mærke i den billigste flise. */}
      <p className="visually-hidden" role="status">
        {verdictText(row)}
      </p>

      <Breakdown row={row} />
    </section>
  )
}

/** "Køb er billigst, 19.794,04 kr. billigere" eller "Lige dyre". */
function verdictText(row: ComparisonRow): string {
  if (row.cheapest === 'equal') return CHEAPEST_LABEL.equal
  return `${CHEAPEST_LABEL[row.cheapest]} er billigst, ${formatKr(Math.abs(row.difference))} billigere`
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
      {winner && (
        // key får mærket til at poppe ind, når vinderen skifter.
        <span key={row.cheapest} className="tile-badge" aria-hidden="true">
          Billigst · <AnimatedNumber value={Math.abs(row.difference)} format={formatKr} /> mindre
        </span>
      )}
      {row.cheapest === 'equal' && (
        <span className="tile-badge tile-badge-equal" aria-hidden="true">
          {CHEAPEST_LABEL.equal}
        </span>
      )}
    </div>
  )
}
