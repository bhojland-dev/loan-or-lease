import { defaultEstablishmentFee, defaultRegistrationFee } from '../../core/index.ts'
import { DepreciationControl, NumberControl, PeriodicControl } from '../controls.tsx'
import { useForm } from '../formContext.ts'
import { formatInput, formatKr } from '../format.ts'
import { computedDefaultRule } from '../messages.ts'
import { SideHead } from './SideHead.tsx'

/** Køb med billån. Lånefelterne skjules, når der ikke er et lån. */
export function BuyCard() {
  const { loanNeed, noLoan } = useForm()

  /** Hjælpetekst og pladsholder for et felt med en standardværdi beregnet af lånebehovet (I5 og I6). */
  function computedDefault(field: 'registrationFee' | 'establishmentFee', compute: (loanNeed: number) => number) {
    if (loanNeed === undefined)
      return { hint: `Lad feltet stå tomt for at bruge standard: ${computedDefaultRule(field)}` }
    const value = compute(loanNeed)
    return { hint: `Lad feltet stå tomt for at bruge standard: ${formatKr(value)}`, placeholder: formatInput(value) }
  }

  return (
    <section className="card card-side card-buy" aria-labelledby="buy-title">
      <SideHead side="buy" />
      <NumberControl field="purchasePrice" />
      <NumberControl field="downPayment" />
      {noLoan ? (
        <p className="info" role="status">
          Intet lån, da udbetalingen svarer til købsprisen. Felterne om lånet er skjult.
        </p>
      ) : (
        <>
          <NumberControl field="interestRatePct" />
          <NumberControl field="loanTermMonths" />
          <NumberControl field="registrationFee" {...computedDefault('registrationFee', defaultRegistrationFee)} />
          <NumberControl field="establishmentFee" {...computedDefault('establishmentFee', defaultEstablishmentFee)} />
          <NumberControl field="monthlyLoanFee" />
          <NumberControl field="interestDeductionPct" />
        </>
      )}
      <PeriodicControl field="service" />
      <DepreciationControl />
    </section>
  )
}
