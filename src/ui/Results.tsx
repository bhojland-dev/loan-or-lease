// Visning af O1-O3 og O10. Alle tal kommer fra src/core.

import { useState } from 'react'
import type { BuyBreakdown, Cheapest, ComparisonRow, LeaseBreakdown, MonthlyCosts, Result } from '../core/index.ts'
import { AnimatedNumber } from './AnimatedNumber.tsx'
import { formatFraction, formatKr, formatMonths } from './format.ts'

const CHEAPEST_LABEL: Record<Cheapest, string> = {
  buy: 'Køb',
  lease: 'Leasing',
  equal: 'Lige dyre',
}

export function Results({ result }: { result: Result }) {
  const last = result.comparison[result.comparison.length - 1]
  const [chosen, setChosen] = useState(last.months)
  // Bliver leasingperioden kortere end det valgte tidspunkt, vises det sidste.
  const row = result.comparison.find((r) => r.months === chosen) ?? last
  return (
    <>
      <Summary result={result} row={row} onChoose={setChosen} />
      <Monthly row={row} />
      <Comparison result={result} />
      <BreakEven result={result} />
      <Breakdown row={row} />
      <Amortization result={result} />
    </>
  )
}

/** O1 for ét valgt tidspunkt: køb og leasing over for hinanden. */
function Summary({ result, row, onChoose }: { result: Result; row: ComparisonRow; onChoose: (months: number) => void }) {
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

/** O10: månedlige faste udgifter før og efter skat for det valgte tidspunkt. */
function Monthly({ row }: { row: ComparisonRow }) {
  return (
    <section className="card" aria-labelledby="monthly-title">
      <h2 id="monthly-title">Månedlige faste udgifter</h2>
      <p className="section-intro">
        Gennemsnit pr. måned de første {formatMonths(row.months)}, uden engangsbeløb som udbetaling,
        førstegangsydelse og restgæld.
      </p>
      <div className="monthly-grid">
        <MonthlyTable side="buy" caption="Køb med billån" paymentLabel="Låneydelse inkl. gebyr" costs={row.monthly.buy} />
        <MonthlyTable side="lease" caption="Privatleasing" paymentLabel="Leasingydelse" costs={row.monthly.lease} />
      </div>
    </section>
  )
}

interface MonthlyTableProps {
  side: 'buy' | 'lease'
  caption: string
  paymentLabel: string
  costs: MonthlyCosts
}

function MonthlyTable({ side, caption, paymentLabel, costs }: MonthlyTableProps) {
  const isLease = side === 'lease'
  // Tekst i stedet for et beløb, hvor leasing ikke har posten.
  const lines: { label: string; value: number; text?: string }[] = [
    { label: paymentLabel, value: costs.payment },
    { label: 'Forsikring', value: costs.insurance },
    { label: 'Ejerafgift', value: costs.ownershipTax },
    { label: 'Service', value: costs.service, text: isLease ? 'Inkluderet' : undefined },
  ]
  return (
    <div className={`table-scroll monthly-${side}`}>
      <table>
        <caption>
          <span className="dot" aria-hidden="true" />
          {caption}
        </caption>
        <tbody>
          {lines.map((l) => (
            <tr key={l.label}>
              <th scope="row">{l.label}</th>
              <td className="num">{l.text ? <span className="muted">{l.text}</span> : <AnimatedNumber value={l.value} format={formatKr} />}</td>
            </tr>
          ))}
          <tr className="subtotal">
            <th scope="row">Pr. måned før skat</th>
            <td className="num">
              <AnimatedNumber value={costs.beforeTax} format={formatKr} />
            </td>
          </tr>
          <tr>
            <th scope="row">− Rentefradrag</th>
            <td className="num">
              {isLease ? <span className="muted">Intet fradrag</span> : <AnimatedNumber value={costs.interestDeduction} format={formatKr} />}
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <th scope="row">Pr. måned efter skat</th>
            <td className="num">
              <AnimatedNumber value={costs.afterTax} format={formatKr} />
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

/** O1 */
function Comparison({ result }: { result: Result }) {
  return (
    <section className="card" aria-labelledby="comparison-title">
      <h2 id="comparison-title">Alle tidspunkter</h2>
      <p className="section-intro">Samlede omkostninger (TCO). Lavest TCO er billigst.</p>
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
  { key: 'remainingDebt', label: 'Restgæld på lånet (indfries ved salg)', sign: 1 },
  { key: 'insurance', label: 'Forsikring', sign: 1 },
  { key: 'ownershipTax', label: 'Ejerafgift', sign: 1 },
  { key: 'service', label: 'Service', sign: 1 },
  { key: 'residualValue', label: 'Bilens restværdi (salgsværdi)', sign: -1 },
  { key: 'interestDeduction', label: 'Rentefradrag', sign: -1 },
  { key: 'investmentReturn', label: 'Afkast efter skat', sign: -1 },
]

const LEASE_ROWS: readonly { key: keyof LeaseBreakdown; label: string; sign: 1 | -1 }[] = [
  { key: 'initialPayment', label: 'Førstegangsydelse', sign: 1 },
  { key: 'monthlyPayments', label: 'Leasingydelser', sign: 1 },
  { key: 'insurance', label: 'Forsikring', sign: 1 },
  { key: 'ownershipTax', label: 'Ejerafgift', sign: 1 },
  { key: 'returnCost', label: 'Egenbetaling ved aflevering', sign: 1 },
  { key: 'investmentReturn', label: 'Afkast efter skat', sign: -1 },
]

function Breakdown({ row }: { row: ComparisonRow }) {
  return (
    <details className="card">
      <summary>
        <h2>Sådan er tallene regnet efter {formatMonths(row.months)}</h2>
      </summary>
      <p className="section-intro">Skift tidspunkt øverst i resultatet.</p>
      <div className="breakdown-grid">
        <BreakdownTable
          caption="Køb med billån"
          side="buy"
          rows={BUY_ROWS.map((r) => ({ ...r, value: row.buy[r.key] }))}
          total={row.buy.total}
        />
        <BreakdownTable
          caption="Privatleasing"
          side="lease"
          rows={LEASE_ROWS.map((r) => ({ ...r, value: row.lease[r.key] }))}
          total={row.lease.total}
        />
      </div>
    </details>
  )
}

interface BreakdownTableProps {
  caption: string
  side: 'buy' | 'lease'
  rows: { key: string; label: string; sign: 1 | -1; value: number }[]
  total: number
}

function BreakdownTable({ caption, side, rows, total }: BreakdownTableProps) {
  return (
    <div className={`table-scroll breakdown-${side}`}>
      <table>
        <caption>
          <span className="dot" aria-hidden="true" />
          {caption}
        </caption>
        <thead>
          <tr>
            <th scope="col">Post</th>
            <th scope="col" className="num">
              Beløb
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key}>
              <th scope="row">
                {r.sign === -1 ? '− ' : ''}
                {r.label}
              </th>
              <td className="num">
                <AnimatedNumber value={r.value} format={formatKr} />
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row">TCO</th>
            <td className="num">
              <AnimatedNumber value={total} format={formatKr} />
            </td>
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
