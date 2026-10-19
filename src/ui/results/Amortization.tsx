import type { Result } from '../../core/index.ts'
import { formatKr } from '../format.ts'

/** O3 */
export function Amortization({ result }: { result: Result }) {
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
