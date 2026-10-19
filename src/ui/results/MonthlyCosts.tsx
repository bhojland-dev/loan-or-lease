import type { ComparisonRow, MonthlyCosts as Costs, Side } from '../../core/index.ts'
import { AnimatedNumber } from '../AnimatedNumber.tsx'
import { PERIODIC_FIELD_TEXT } from '../fieldText.ts'
import { formatKr, formatMonths } from '../format.ts'
import { POST_LABEL, SIDE_LABEL } from '../labels.ts'

const PAYMENT_LABEL: Record<Side, string> = {
  buy: 'Låneydelse inkl. gebyr',
  lease: 'Leasingydelse',
}

/** O10: månedlige faste udgifter før og efter skat for det valgte tidspunkt. */
export function MonthlyCosts({ row }: { row: ComparisonRow }) {
  return (
    <section className="card" aria-labelledby="monthly-title">
      <h2 id="monthly-title">Månedlige faste udgifter</h2>
      <p className="section-intro">
        Gennemsnit pr. måned de første {formatMonths(row.months)}, uden engangsbeløb som udbetaling, førstegangsydelse
        og restgæld.
      </p>
      <div className="monthly-grid">
        <MonthlyTable side="buy" costs={row.monthly.buy} />
        <MonthlyTable side="lease" costs={row.monthly.lease} />
      </div>
    </section>
  )
}

function MonthlyTable({ side, costs }: { side: Side; costs: Costs }) {
  const isLease = side === 'lease'
  // Tekst i stedet for et beløb, hvor leasing ikke har posten.
  const lines: { label: string; value: number; text?: string }[] = [
    { label: PAYMENT_LABEL[side], value: costs.payment },
    { label: PERIODIC_FIELD_TEXT.insurance.label, value: costs.insurance },
    { label: PERIODIC_FIELD_TEXT.ownershipTax.label, value: costs.ownershipTax },
    { label: PERIODIC_FIELD_TEXT.service.label, value: costs.service, text: isLease ? 'Inkluderet' : undefined },
  ]
  return (
    <div className={`table-scroll monthly-${side}`}>
      <table>
        <caption>
          <span className="dot" aria-hidden="true" />
          {SIDE_LABEL[side]}
        </caption>
        <tbody>
          {lines.map((l) => (
            <tr key={l.label}>
              <th scope="row">{l.label}</th>
              <td className="num">
                {l.text ? (
                  <span className="muted">{l.text}</span>
                ) : (
                  <AnimatedNumber value={l.value} format={formatKr} />
                )}
              </td>
            </tr>
          ))}
          <tr className="subtotal">
            <th scope="row">Pr. måned før skat</th>
            <td className="num">
              <AnimatedNumber value={costs.beforeTax} format={formatKr} />
            </td>
          </tr>
          <tr>
            <th scope="row">− {POST_LABEL.interestDeduction}</th>
            <td className="num">
              {isLease ? (
                <span className="muted">Intet fradrag</span>
              ) : (
                <AnimatedNumber value={costs.interestDeduction} format={formatKr} />
              )}
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
