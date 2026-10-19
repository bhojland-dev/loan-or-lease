import type { Side } from '../../core/index.ts'
import { SIDE_INTRO, SIDE_LABEL } from '../labels.ts'

/** Overskrift på køb- og leasingkortet med en prik i sidens farve. */
export function SideHead({ side }: { side: Side }) {
  return (
    <header className="side-head">
      <h2 id={`${side}-title`}>
        <span className="dot" aria-hidden="true" />
        {SIDE_LABEL[side]}
      </h2>
      <p>{SIDE_INTRO[side]}</p>
    </header>
  )
}
