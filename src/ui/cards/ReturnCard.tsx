import { NumberControl } from '../controls.tsx'

/** Afkast af forskellen (SPEC.md 2.6). */
export function ReturnCard() {
  return (
    <section className="card" aria-labelledby="return-title">
      <h2 id="return-title">Afkast af forskellen</h2>
      <p className="section-intro">Det billigste scenarie sætter hver måned forskellen ind på en konto med rente.</p>
      <div className="field-grid">
        <NumberControl field="annualReturnPct" />
        <NumberControl field="returnTaxPct" />
      </div>
    </section>
  )
}
