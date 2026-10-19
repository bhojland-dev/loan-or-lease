import type { Result } from '../../core/index.ts'
import { AnimatedNumber } from '../AnimatedNumber.tsx'
import { formatKr, formatMonths } from '../format.ts'
import { CHEAPEST_LABEL } from '../labels.ts'

/** O1 */
export function Comparison({ result }: { result: Result }) {
  return (
    <section className="card" aria-labelledby="comparison-title">
      <h2 id="comparison-title">Alle tidspunkter</h2>
      <p className="section-intro">Samlede omkostninger (TCO). Lavest TCO er billigst.</p>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th scope="col">Efter</th>
              <th scope="col" className="num">
                TCO køb
              </th>
              <th scope="col" className="num">
                TCO leasing
              </th>
              <th scope="col" className="num">
                Forskel
              </th>
              <th scope="col">Billigst</th>
            </tr>
          </thead>
          <tbody>
            {result.comparison.map((row) => (
              <tr key={row.months}>
                <th scope="row">{formatMonths(row.months)}</th>
                <td className={`num${row.cheapest === 'buy' ? ' winner winner-buy' : ''}`}>
                  <AnimatedNumber value={row.buy.total} format={formatKr} />
                </td>
                <td className={`num${row.cheapest === 'lease' ? ' winner winner-lease' : ''}`}>
                  <AnimatedNumber value={row.lease.total} format={formatKr} />
                </td>
                <td className="num">
                  <AnimatedNumber value={Math.abs(row.difference)} format={formatKr} />
                </td>
                <td>
                  {/* key får badgen til at poppe ind igen, når vinderen skifter. */}
                  <span key={row.cheapest} className={`badge badge-${row.cheapest}`}>
                    {CHEAPEST_LABEL[row.cheapest]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
