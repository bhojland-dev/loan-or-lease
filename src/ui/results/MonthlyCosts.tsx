import type { ComparisonRow, MonthlyCosts as Costs } from '../../core/index.ts'
import { AnimatedNumber } from '../AnimatedNumber.tsx'
import { formatKr, formatMonths } from '../format.ts'

/** O10: månedlige faste udgifter før og efter skat for det valgte tidspunkt. */
export function MonthlyCosts({ row }: { row: ComparisonRow }) {
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
  costs: Costs
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
