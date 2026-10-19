import type { BuyBreakdown, ComparisonRow, LeaseBreakdown } from '../../core/index.ts'
import { AnimatedNumber } from '../AnimatedNumber.tsx'
import { formatKr, formatMonths } from '../format.ts'

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

export function Breakdown({ row }: { row: ComparisonRow }) {
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
