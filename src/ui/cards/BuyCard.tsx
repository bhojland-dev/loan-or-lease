import { defaultEstablishmentFee, defaultRegistrationFee } from '../../core/index.ts'
import { DepreciationControl, NumberControl, PeriodicControl } from '../controls.tsx'
import { useForm } from '../formContext.ts'
import { formatInput, formatKr } from '../format.ts'
import { SideHead } from './SideHead.tsx'

/** Køb med billån. Lånefelterne skjules, når der ikke er et lån. */
export function BuyCard() {
  const { loanNeed, noLoan } = useForm()

  /** Hjælpetekst og pladsholder for et felt med en standardværdi beregnet af lånebehovet (I5 og I6). */
  function computedDefault(compute: (loanNeed: number) => number, rule: string) {
    if (loanNeed === undefined) return { hint: `Lad feltet stå tomt for at bruge standard: ${rule}` }
    const value = compute(loanNeed)
    return { hint: `Lad feltet stå tomt for at bruge standard: ${formatKr(value)}`, placeholder: formatInput(value) }
  }

  return (
    <section className="card card-side card-buy" aria-labelledby="buy-title">
      <SideHead id="buy-title" title="Køb med billån" intro="Du ejer bilen og kan sælge den igen." />
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
          <NumberControl
            field="registrationFee"
            {...computedDefault(defaultRegistrationFee, '1.850 kr. + 1,5 % af lånebehovet.')}
          />
          <NumberControl
            field="establishmentFee"
            {...computedDefault(defaultEstablishmentFee, '1,25 % af lånebehovet, min. 2.000, maks. 10.000 kr.')}
          />
          <NumberControl field="monthlyLoanFee" />
          <NumberControl field="interestDeductionPct" />
        </>
      )}
      <PeriodicControl field="service" />
      <DepreciationControl />
    </section>
  )
}
