import { LEASE_TERMS } from '../../core/index.ts'
import { NumberControl, SliderControl } from '../controls.tsx'
import { SideHead } from './SideHead.tsx'

/** Privatleasing. */
export function LeaseCard() {
  return (
    <section className="card card-side card-lease" aria-labelledby="lease-title">
      <SideHead side="lease" />
      <SliderControl
        field="leaseTermMonths"
        stops={LEASE_TERMS}
        format={(v) => `${v} mdr.`}
        tickLabel={(v) => `${v}`}
      />
      <NumberControl field="leaseInitialPayment" />
      <NumberControl field="leaseMonthlyPayment" />
      <NumberControl field="returnCost" />
    </section>
  )
}
