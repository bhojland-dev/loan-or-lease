// Små SVG-ikoner. Farverne kommer fra CSS-variablerne, så de følger lys og mørk tilstand.

/** Køb over for leasing: to modsatrettede pile i køb- og leasingfarven. Ren dekoration. */
export function CompareIcon() {
  return (
    <svg className="compare-icon" viewBox="8 8 32 32" width="32" height="32" focusable="false">
      <path d="M12 18.5h21" className="compare-icon-buy" />
      <path d="M28.5 13l5.5 5.5-5.5 5.5" className="compare-icon-buy" />
      <path d="M36 29.5H15" className="compare-icon-lease" />
      <path d="M19.5 24L14 29.5l5.5 5.5" className="compare-icon-lease" />
    </svg>
  )
}

export function ResetIcon() {
  return (
    <svg className="button-icon" viewBox="0 0 20 20" width="16" height="16" focusable="false" aria-hidden="true">
      <path d="M4 10a6 6 0 1 0 1.8-4.3" />
      <path d="M4 3.5v3.2h3.2" />
    </svg>
  )
}
