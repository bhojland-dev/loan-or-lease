// Visning af O1-O3. Alle tal kommer fra src/core.

import type { BuyBreakdown, Cheapest, LeaseBreakdown, Result } from '../core/index.ts'
import { AnimatedNumber } from './AnimatedNumber.tsx'
import { formatFraction, formatKr, formatMonths } from './format.ts'

const CHEAPEST_LABEL: Record<Cheapest, string> = {
  buy: 'Køb',
  lease: 'Leasing',
  equal: 'Lige dyre',
}

export function Results({ result }: { result: Result }) {
  return (
    <>
      <Comparison result={result} />
      <BreakEven result={result} />
      <Breakdown result={result} />
      <Amortization result={result} />
    </>
  )
}

/** O1 */
function Comparison({ result }: { result: Result }) {
  return (
    <section className="card" aria-labelledby="comparison-title">
      <h2 id="comparison-title">Samlede omkostninger (TCO)</h2>
      <p className="section-intro">Lavest TCO er billigst.</p>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th scope="col">Efter</th>
              <th scope="col" className="num">TCO køb</th>
              <th scope="col" className="num">TCO leasing</th>
              <th scope="col" className="num">Forskel</th>
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

/** O2 */
function BreakEven({ result }: { result: Result }) {
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

const BUY_ROWS: readonly { key: keyof BuyBreakdown; label: string; sign: 1 | -1 }[] = [
  { key: 'downPayment', label: 'Udbetaling', sign: 1 },
  { key: 'loanPayments', label: 'Låneydelser inkl. gebyr', sign: 1 },
  { key: 'remainingDebt', label: 'Restgæld på lånet (indfries ved t)', sign: 1 },
  { key: 'insurance', label: 'Forsikring', sign: 1 },
  { key: 'ownershipTax', label: 'Ejerafgift', sign: 1 },
  { key: 'service', label: 'Service', sign: 1 },
  { key: 'residualValue', label: 'Bilens restværdi (salgsværdi)', sign: -1 },
  { key: 'investmentReturn', label: 'Afkast efter skat', sign: -1 },
]

const LEASE_ROWS: readonly { key: keyof LeaseBreakdown; label: string; sign: 1 | -1 }[] = [
  { key: 'initialPayment', label: 'Førstegangsydelse', sign: 1 },
  { key: 'monthlyPayments', label: 'Leasingydelser', sign: 1 },
  { key: 'insurance', label: 'Forsikring', sign: 1 },
  { key: 'ownershipTax', label: 'Ejerafgift', sign: 1 },
  { key: 'excessKm', label: 'Overkørte km', sign: 1 },
  { key: 'returnCost', label: 'Egenbetaling ved aflevering', sign: 1 },
  { key: 'exitCost', label: 'Exit ved førtidig ophør', sign: 1 },
  { key: 'investmentReturn', label: 'Afkast efter skat', sign: -1 },
]

function Breakdown({ result }: { result: Result }) {
  const months = result.comparison.map((row) => row.months)
  return (
    <details className="card">
      <summary>
        <h2>Sådan er tallene regnet</h2>
      </summary>
      <BreakdownTable
        caption="Køb"
        months={months}
        rows={BUY_ROWS.map((r) => ({ ...r, values: result.comparison.map((c) => c.buy[r.key]) }))}
        totals={result.comparison.map((c) => c.buy.total)}
      />
      <BreakdownTable
        caption="Leasing"
        months={months}
        rows={LEASE_ROWS.map((r) => ({ ...r, values: result.comparison.map((c) => c.lease[r.key]) }))}
        totals={result.comparison.map((c) => c.lease.total)}
      />
    </details>
  )
}

interface BreakdownTableProps {
  caption: string
  months: number[]
  rows: { key: string; label: string; sign: 1 | -1; values: number[] }[]
  totals: number[]
}

function BreakdownTable({ caption, months, rows, totals }: BreakdownTableProps) {
  return (
    <div className="table-scroll">
      <table>
        <caption>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Post</th>
            {months.map((m) => (
              <th key={m} scope="col" className="num">
                {formatMonths(m)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key}>
              <th scope="row">
                {row.sign === -1 ? '− ' : ''}
                {row.label}
              </th>
              {row.values.map((v, i) => (
                <td key={months[i]} className="num">
                  {formatKr(v)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row">TCO</th>
            {totals.map((v, i) => (
              <td key={months[i]} className="num">
                {formatKr(v)}
              </td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

/** O3 */
function Amortization({ result }: { result: Result }) {
  if (result.amortization.length === 0) return null
  return (
    <details className="card">
      <summary>
        <h2>Afviklingsprofil ({result.amortization.length} mdr.)</h2>
      </summary>
      <div className="table-scroll table-tall">
        <table>
          <thead>
            <tr>
              <th scope="col">Måned</th>
              <th scope="col" className="num">Ydelse</th>
              <th scope="col" className="num">Rente</th>
              <th scope="col" className="num">Afdrag</th>
              <th scope="col" className="num">Løbende gebyr</th>
              <th scope="col" className="num">Restgæld</th>
            </tr>
          </thead>
          <tbody>
            {result.amortization.map((row) => (
              <tr key={row.month}>
                <th scope="row">{row.month}</th>
                <td className="num">{formatKr(row.installment)}</td>
                <td className="num">{formatKr(row.interest)}</td>
                <td className="num">{formatKr(row.principalPaid)}</td>
                <td className="num">{formatKr(row.fee)}</td>
                <td className="num">{formatKr(row.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  )
}
