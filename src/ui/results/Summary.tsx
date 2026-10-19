import type { ComparisonRow, Result } from '../../core/index.ts'
import { AnimatedNumber } from '../AnimatedNumber.tsx'
import { formatKr, formatMonths } from '../format.ts'
import { CHEAPEST_LABEL } from './labels.ts'

/** O1 for ét valgt tidspunkt: køb og leasing over for hinanden. */
export function Summary({ result, row, onChoose }: { result: Result; row: ComparisonRow; onChoose: (months: number) => void }) {
  const max = Math.max(row.buy.total, row.lease.total, 1)
  const bar = (value: number) => `${Math.max(0, (value / max) * 100)}%`

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
        <div className={`tile tile-buy${row.cheapest === 'buy' ? ' is-winner' : ''}`}>
          <span className="tile-k">
            <span className="dot" aria-hidden="true" />
            Køb med billån
          </span>
          <span className="tile-v">
            <AnimatedNumber value={row.buy.total} format={formatKr} />
          </span>
          <span className="tile-bar" aria-hidden="true">
            <span style={{ width: bar(row.buy.total) }} />
          </span>
          <span className="tile-s">Samlede omkostninger (TCO)</span>
        </div>

        <div className="verdict" role="status">
          {row.cheapest === 'equal' ? (
            <span className="verdict-text">Lige dyre</span>
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

        <div className={`tile tile-lease${row.cheapest === 'lease' ? ' is-winner' : ''}`}>
          <span className="tile-k">
            <span className="dot" aria-hidden="true" />
            Privatleasing
          </span>
          <span className="tile-v">
            <AnimatedNumber value={row.lease.total} format={formatKr} />
          </span>
          <span className="tile-bar" aria-hidden="true">
            <span style={{ width: bar(row.lease.total) }} />
          </span>
          <span className="tile-s">Samlede omkostninger (TCO)</span>
        </div>
      </div>
    </section>
  )
}
