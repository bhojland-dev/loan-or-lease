interface SideHeadProps {
  id: string
  title: string
  intro: string
}

/** Overskrift på køb- og leasingkortet med en prik i sidens farve. */
export function SideHead({ id, title, intro }: SideHeadProps) {
  return (
    <header className="side-head">
      <h2 id={id}>
        <span className="dot" aria-hidden="true" />
        {title}
      </h2>
      <p>{intro}</p>
    </header>
  )
}
