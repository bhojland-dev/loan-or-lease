import type { ComparisonRow, Result, Side } from '../../core/index.ts'
import { AnimatedNumber } from '../AnimatedNumber.tsx'
import { formatKr, formatMonths } from '../format.ts'
import { CHEAPEST_LABEL, SIDE_LABEL } from '../labels.ts'

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

      <div className="duel duel-result">
        <TotalTile side="buy" total={row.buy.total} max={max} winner={row.cheapest === 'buy'} />

        <div className="verdict" role="status">
          {row.cheapest === 'equal' ? (
            <span className="verdict-text">{CHEAPEST_LABEL.equal}</span>
          ) : (
            <>
              <span key={row.cheapest} className={`verdict-who verdict-${row.cheapest}`}>
                {CHEAPEST_LABEL[row.cheapest]} er billigst
              </span>
              <span className="verdict-amount">
                <AnimatedNumber value={Math.abs(row.difference)} format={formatKr} />
              </span>
              <span className="verdict-text">i forskel</span>
            </>
          )}
        </div>

        <TotalTile side="lease" total={row.lease.total} max={max} winner={row.cheapest === 'lease'} />
      </div>
    </section>
  )
}

interface TotalTileProps {
  side: Side
  total: number
  max: number
  winner: boolean
}

function TotalTile({ side, total, max, winner }: TotalTileProps) {
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
