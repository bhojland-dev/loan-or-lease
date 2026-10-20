import type { ComparisonRow, Result } from '../../core/index.ts'
import { AnimatedNumber } from '../AnimatedNumber.tsx'
import { formatKr, formatMonths } from '../format.ts'
import { CHEAPEST_LABEL } from '../labels.ts'

/**
 * O1: alle tidspunkter. Bygget som et grid med tabel-roller i stedet for en <table>, så kolonnerne
 * kan følge de samme tre kolonner som fliserne: køb til venstre, dommen i midten og leasing til højre.
 */
export function Comparison({ result }: { result: Result }) {
  return (
    <section className="card" aria-labelledby="comparison-title">
      <h2 id="comparison-title">Alle tidspunkter</h2>
      <p className="section-intro">Samlede omkostninger (TCO). Lavest TCO er billigst.</p>
      <div className="table-scroll">
        <div className="comparison" role="table" aria-labelledby="comparison-title">
          <div className="comparison-row comparison-head" role="row">
            <div className="comparison-side">
              <span role="columnheader">Efter</span>
              <span role="columnheader">TCO køb</span>
            </div>
            <span className="comparison-middle" role="columnheader">
              Billigst
            </span>
            <div className="comparison-side">
              <span role="columnheader">TCO leasing</span>
            </div>
          </div>
          {result.comparison.map((row) => (
            <ComparisonLine key={row.months} row={row} />
          ))}
        </div>
      </div>
    </section>
  )
}

function ComparisonLine({ row }: { row: ComparisonRow }) {
  return (
    <div className="comparison-row" role="row">
      <div className="comparison-side">
        <span role="rowheader">{formatMonths(row.months)}</span>
        <span role="cell" className={row.cheapest === 'buy' ? 'winner winner-buy' : undefined}>
          <AnimatedNumber value={row.buy.total} format={formatKr} />
        </span>
      </div>
      <span className="comparison-middle" role="cell">
        {/* key får badgen til at poppe ind igen, når vinderen skifter. */}
        <span key={row.cheapest} className={`badge badge-${row.cheapest}`}>
          {CHEAPEST_LABEL[row.cheapest]}
        </span>
        <span>{row.cheapest !== 'equal' && <AnimatedNumber value={Math.abs(row.difference)} format={formatKr} />}</span>
      </span>
      <div className="comparison-side">
        <span role="cell" className={row.cheapest === 'lease' ? 'winner winner-lease' : undefined}>
          <AnimatedNumber value={row.lease.total} format={formatKr} />
        </span>
      </div>
    </div>
  )
}
