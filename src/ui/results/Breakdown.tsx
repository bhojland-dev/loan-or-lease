import type { BuyBreakdown, ComparisonRow, LeaseBreakdown, Side } from '../../core/index.ts'
import { AnimatedNumber } from '../AnimatedNumber.tsx'
import { NUMBER_FIELD_TEXT, PERIODIC_FIELD_TEXT } from '../fieldText.ts'
import { formatKr, formatMonths } from '../format.ts'
import { POST_LABEL, SIDE_LABEL } from '../labels.ts'

type Row<T> = { key: keyof T; label: string; sign: 1 | -1 }

const BUY_ROWS: readonly Row<BuyBreakdown>[] = [
  { key: 'downPayment', label: NUMBER_FIELD_TEXT.downPayment.label, sign: 1 },
  { key: 'loanPayments', label: 'Låneydelser inkl. gebyr', sign: 1 },
  { key: 'remainingDebt', label: 'Restgæld på lånet (indfries ved salg)', sign: 1 },
  { key: 'insurance', label: PERIODIC_FIELD_TEXT.insurance.label, sign: 1 },
  { key: 'ownershipTax', label: PERIODIC_FIELD_TEXT.ownershipTax.label, sign: 1 },
  { key: 'service', label: PERIODIC_FIELD_TEXT.service.label, sign: 1 },
  { key: 'residualValue', label: 'Bilens restværdi (salgsværdi)', sign: -1 },
  { key: 'interestDeduction', label: POST_LABEL.interestDeduction, sign: -1 },
  { key: 'investmentReturn', label: POST_LABEL.investmentReturn, sign: -1 },
]

const LEASE_ROWS: readonly Row<LeaseBreakdown>[] = [
  { key: 'initialPayment', label: NUMBER_FIELD_TEXT.leaseInitialPayment.label, sign: 1 },
  { key: 'monthlyPayments', label: 'Leasingydelser', sign: 1 },
  { key: 'insurance', label: PERIODIC_FIELD_TEXT.insurance.label, sign: 1 },
  { key: 'ownershipTax', label: PERIODIC_FIELD_TEXT.ownershipTax.label, sign: 1 },
  { key: 'returnCost', label: NUMBER_FIELD_TEXT.returnCost.label, sign: 1 },
  { key: 'investmentReturn', label: POST_LABEL.investmentReturn, sign: -1 },
]

/** Opdelingen af TCO for det valgte tidspunkt. Foldes ud nederst i resultatboksen. */
export function Breakdown({ row }: { row: ComparisonRow }) {
  return (
    <details className="breakdown">
      <summary>Sådan er tallene regnet efter {formatMonths(row.months)}</summary>
      <div className="breakdown-grid">
        <BreakdownTable
          side="buy"
          rows={BUY_ROWS.map((r) => ({ ...r, value: row.buy[r.key] }))}
          total={row.buy.total}
        />
        <BreakdownTable
          side="lease"
          rows={LEASE_ROWS.map((r) => ({ ...r, value: row.lease[r.key] }))}
          total={row.lease.total}
        />
      </div>
    </details>
  )
}

interface BreakdownTableProps {
  side: Side
  rows: { key: string; label: string; sign: 1 | -1; value: number }[]
  total: number
}

function BreakdownTable({ side, rows, total }: BreakdownTableProps) {
  return (
    <div className={`table-scroll breakdown-${side}`}>
      <table>
        <caption>
          <span className="dot" aria-hidden="true" />
          {SIDE_LABEL[side]}
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
