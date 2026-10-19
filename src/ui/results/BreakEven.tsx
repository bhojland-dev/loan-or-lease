import type { Result } from '../../core/index.ts'
import { AnimatedNumber } from '../AnimatedNumber.tsx'
import { formatFraction, formatKr, formatMonths } from '../format.ts'

/** O2 */
export function BreakEven({ result }: { result: Result }) {
  return (
    <section className="card" aria-labelledby="breakeven-title">
      <h2 id="breakeven-title">Break-even for værditab</h2>
      <p className="section-intro">
        Det største værditab, bilen må have, før leasing bliver billigst. Er det forventede værditab mindre, er køb
        billigst.
      </p>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th scope="col">Efter</th>
              <th scope="col" className="num">Break-even-værditab</th>
              <th scope="col" className="num">Forventet værditab</th>
              <th scope="col" className="num">Break-even-restværdi</th>
            </tr>
          </thead>
          <tbody>
            {result.breakEven.map((row) => (
              <tr key={row.months}>
                <th scope="row">{formatMonths(row.months)}</th>
                <td className="num">
                  <AnimatedNumber value={row.breakEvenDepreciation} format={formatFraction} />
                </td>
                <td className="num">
                  <AnimatedNumber value={row.expectedDepreciation} format={formatFraction} />
                </td>
                <td className="num">
                  <AnimatedNumber value={row.breakEvenResidualValue} format={formatKr} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
