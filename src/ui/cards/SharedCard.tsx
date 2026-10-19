import { KM_STOPS } from '../../core/index.ts'
import { PeriodicControl, SliderControl } from '../controls.tsx'
import { formatInput } from '../format.ts'

/** Input, der gælder for både køb og leasing. */
export function SharedCard() {
  return (
    <section className="card card-shared" aria-labelledby="shared-title">
      <h2 id="shared-title">Fælles for begge</h2>
      <p className="section-intro">Udgifter og kørsel, der er de samme, uanset om du køber eller leaser.</p>
      <div className="field-grid">
        <PeriodicControl field="insurance" />
        <PeriodicControl field="ownershipTax" />
        <SliderControl field="annualKm" stops={KM_STOPS} format={(v) => `${formatInput(v)} km`} />
      </div>
    </section>
  )
}
