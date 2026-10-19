import { useEffect, useMemo, useState } from 'react'
import {
  calculate,
  calculateLoanNeed,
  defaultEstablishmentFee,
  defaultRegistrationFee,
  FIELD_NOTES,
  KM_STOPS,
  LEASE_TERMS,
  validate,
  warnings,
} from '../core/index.ts'
import type { InputField } from '../core/index.ts'
import { Field, FrequencySelect, NumberInput, Slider } from './fields.tsx'
import type { FieldMessages } from './fields.tsx'
import { formatInput, formatKr, parseDanishNumber } from './format.ts'
import { initialFormState, loadFormState, saveFormState, toDraft, unreadableFields } from './form.ts'
import type { FormState, NumberField, PeriodicField } from './form.ts'
import { Results } from './Results.tsx'

const UNREADABLE = 'Skriv et tal, fx 1.234,50.'

function App() {
  // `form` er det, der står i felterne. `calcForm` er det, der regnes på: tekstfelter
  // tæller først med, når man forlader feltet, mens slidere og valg tæller med det samme.
  const [form, setForm] = useState<FormState>(() => loadFormState() ?? initialFormState())
  const [calcForm, setCalcForm] = useState<FormState>(form)
  const [touched, setTouched] = useState<ReadonlySet<InputField>>(new Set())

  useEffect(() => saveFormState(form), [form])

  const draft = useMemo(() => toDraft(form), [form])
  const calcDraft = useMemo(() => toDraft(calcForm), [calcForm])
  const validation = useMemo(() => validate(calcDraft), [calcDraft])
  const result = useMemo(() => (validation.ok ? calculate(validation.inputs) : null), [validation])
  const unreadable = useMemo(() => unreadableFields(form), [form])

  const errors = new Map<InputField, string>()
  if (!validation.ok) for (const e of validation.errors) if (!errors.has(e.field)) errors.set(e.field, e.message)

  const kmWarning =
    calcDraft.annualKm !== undefined && Number.isFinite(calcDraft.annualKm)
      ? warnings({ annualKm: calcDraft.annualKm })[0]
      : undefined
  const liveLoanNeed =
    draft.purchasePrice !== undefined && draft.downPayment !== undefined
      ? calculateLoanNeed(draft.purchasePrice, draft.downPayment)
      : Number.NaN
  const hasLoanNeed = Number.isFinite(liveLoanNeed)
  const loanNeed = liveLoanNeed
  const calcLoanNeed =
    calcDraft.purchasePrice !== undefined && calcDraft.downPayment !== undefined
      ? calculateLoanNeed(calcDraft.purchasePrice, calcDraft.downPayment)
      : Number.NaN

  function messages(field: InputField, hint?: string): FieldMessages {
    const error = unreadable.has(field) ? UNREADABLE : touched.has(field) ? errors.get(field) : undefined
    return {
      hint,
      error,
      warning: field === kmWarning?.field ? kmWarning.message : undefined,
      note: FIELD_NOTES.find((n) => n.field === field)?.text,
    }
  }

  function touch(field: InputField) {
    setTouched((prev) => (prev.has(field) ? prev : new Set(prev).add(field)))
  }

  /** Opdaterer felterne og, hvis `commit`, også det der regnes på. */
  function apply(next: FormState, commit: boolean) {
    setForm(next)
    if (commit) setCalcForm(next)
  }

  function withNumber(state: FormState, field: NumberField, value: string): FormState {
    return { ...state, numbers: { ...state.numbers, [field]: value } }
  }

  /** Dansk formatering af et tal, fx "200000" → "200.000". Ulæselig tekst bliver stående. */
  function tidy(text: string): string {
    const value = parseDanishNumber(text)
    return value !== undefined && Number.isFinite(value) ? formatInput(value) : text
  }

  function commitNumber(field: NumberField) {
    apply(withNumber(form, field, tidy(form.numbers[field])), true)
    touch(field)
  }

  function numberField(field: NumberField, label: string, unit: string, options: { hint?: string; placeholder?: string } = {}) {
    const msg = messages(field, options.hint)
    return (
      <Field id={field} label={label} {...msg}>
        {(describedBy) => (
          <NumberInput
            id={field}
            value={form.numbers[field]}
            onChange={(v) => apply(withNumber(form, field, v), false)}
            onBlur={() => commitNumber(field)}
            unit={unit}
            placeholder={options.placeholder}
            describedBy={describedBy}
            invalid={!!msg.error}
          />
        )}
      </Field>
    )
  }

  function periodicField(field: PeriodicField, label: string, hint?: string) {
    const msg = messages(field, hint)
    const value = form.periodic[field]
    const withPeriodic = (change: Partial<typeof value>): FormState => ({
      ...form,
      periodic: { ...form.periodic, [field]: { ...value, ...change } },
    })
    return (
      <Field id={field} label={label} {...msg} group>
        {(describedBy) => (
          <div className="periodic">
            <NumberInput
              id={field}
              label={`${label}, beløb`}
              value={value.amount}
              onChange={(amount) => apply(withPeriodic({ amount }), false)}
              onBlur={() => {
                apply(withPeriodic({ amount: tidy(value.amount) }), true)
                touch(field)
              }}
              unit="kr."
              describedBy={describedBy}
              invalid={!!msg.error}
            />
            <FrequencySelect
              id={`${field}-frequency`}
              value={value.frequency}
              onChange={(frequency) => apply(withPeriodic({ frequency }), true)}
              onBlur={() => touch(field)}
              describedBy={describedBy}
              invalid={!!msg.error}
            />
          </div>
        )}
      </Field>
    )
  }

  const depMsg = messages('depreciationPct')
  // Lånefelterne skjules først, når udbetalingen er bekræftet (feltet forladt).
  const noLoan = calcLoanNeed === 0
  const missingCount = validation.ok ? 0 : new Set(validation.errors.map((e) => e.field)).size

  return (
    <>
      <header className="page-header">
        <h1>Lån eller leasing</h1>
        <p>
          Sammenlign de samlede omkostninger (TCO) ved at købe bilen med billån og ved privatleasing af den samme bil
          efter 1, 2, 3 og 4 år.
        </p>
      </header>

      <main className="page">
        <form
          className="inputs"
          onSubmit={(e) => {
            // Enter i et felt beregner også.
            e.preventDefault()
            apply(form, true)
          }}
          noValidate
        >
          <section className="card card-shared" aria-labelledby="shared-title">
            <h2 id="shared-title">Fælles for begge</h2>
            <p className="section-intro">Udgifter og kørsel, der er de samme, uanset om du køber eller leaser.</p>
            <div className="field-grid">
              {periodicField('insurance', 'Forsikring')}
              {periodicField('ownershipTax', 'Ejerafgift')}
              <Field id="annualKm" label="Forventet kørsel pr. år" {...messages('annualKm')}>
                {(describedBy) => (
                  <Slider
                    id="annualKm"
                    stops={KM_STOPS}
                    value={draft.annualKm}
                    onChange={(v) => apply(withNumber(form, 'annualKm', formatInput(v)), true)}
                    format={(v) => `${formatInput(v)} km`}
                    describedBy={describedBy}
                  />
                )}
              </Field>
            </div>
          </section>

          <div className="duel">
            <section className="card card-side card-buy" aria-labelledby="buy-title">
              <header className="side-head">
                <h2 id="buy-title">
                  <span className="dot" aria-hidden="true" />
                  Køb med billån
                </h2>
                <p>Du ejer bilen og kan sælge den igen.</p>
              </header>
              {numberField('purchasePrice', 'Købspris', 'kr.', { hint: 'Faktisk pris efter eventuel rabat.' })}
              {numberField('downPayment', 'Udbetaling', 'kr.')}
              {noLoan ? (
                <p className="info" role="status">
                  Intet lån, da udbetalingen svarer til købsprisen. Felterne om lånet er skjult.
                </p>
              ) : (
                <>
                  {numberField('interestRatePct', 'Debitorrente', '% p.a.')}
                  {numberField('loanTermMonths', 'Lånets løbetid', 'mdr.')}
                  {numberField('registrationFee', 'Tinglysningsafgift', 'kr.', {
                    placeholder: hasLoanNeed ? formatInput(defaultRegistrationFee(loanNeed)) : undefined,
                    hint: hasLoanNeed
                      ? `Lad feltet stå tomt for at bruge standard: ${formatKr(defaultRegistrationFee(loanNeed))}`
                      : 'Lad feltet stå tomt for at bruge standard: 1.850 kr. + 1,5 % af lånebehovet.',
                  })}
                  {numberField('establishmentFee', 'Stiftelsesprovision', 'kr.', {
                    placeholder: hasLoanNeed ? formatInput(defaultEstablishmentFee(loanNeed)) : undefined,
                    hint: hasLoanNeed
                      ? `Lad feltet stå tomt for at bruge standard: ${formatKr(defaultEstablishmentFee(loanNeed))}`
                      : 'Lad feltet stå tomt for at bruge standard: 1,25 % af lånebehovet, min. 2.000, maks. 10.000 kr.',
                  })}
                  {numberField('monthlyLoanFee', 'Løbende lånegebyr', 'kr./md.')}
                </>
              )}
              {periodicField('service', 'Service', 'Ved leasing er service inkluderet.')}
              <Field id="depreciationPct" label="Afskrivning pr. år" {...depMsg} group>
                {(describedBy) => (
                  <div className="depreciation">
                    {form.depreciation.map((value, i) => (
                      <div key={i} className="depreciation-year">
                        <label htmlFor={`depreciation-${i}`}>År {i + 1}</label>
                        <NumberInput
                          id={`depreciation-${i}`}
                          value={value}
                          onChange={(v) => {
                            const next = [...form.depreciation] as FormState['depreciation']
                            next[i] = v
                            apply({ ...form, depreciation: next }, false)
                          }}
                          onBlur={() => {
                            const next = [...form.depreciation] as FormState['depreciation']
                            next[i] = tidy(next[i])
                            apply({ ...form, depreciation: next }, true)
                            touch('depreciationPct')
                          }}
                          unit="%"
                          describedBy={describedBy}
                          invalid={!!depMsg.error}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </Field>
            </section>
            <div className="vs" aria-hidden="true">
              <span>vs</span>
            </div>
            <section className="card card-side card-lease" aria-labelledby="lease-title">
              <header className="side-head">
                <h2 id="lease-title">
                  <span className="dot" aria-hidden="true" />
                  Privatleasing
                </h2>
                <p>Du lejer bilen og afleverer den, når aftalen slutter.</p>
              </header>
              <Field id="leaseTermMonths" label="Leasingaftalens løbetid">
                {(describedBy) => (
                  <Slider
                    id="leaseTermMonths"
                    stops={LEASE_TERMS}
                    value={draft.leaseTermMonths}
                    onChange={(v) => apply(withNumber(form, 'leaseTermMonths', formatInput(v)), true)}
                    format={(v) => `${v} mdr.`}
                    tickLabel={(v) => `${v}`}
                    describedBy={describedBy}
                  />
                )}
              </Field>
              {numberField('leaseInitialPayment', 'Førstegangsydelse', 'kr.')}
              {numberField('leaseMonthlyPayment', 'Månedlig leasingydelse', 'kr./md.')}
              <Field
              id="includedKmPerYear"
              label="Inkluderede km pr. år"
              {...messages(
                'includedKmPerYear',
                form.includedKmLinked ? 'Følger forventet kørsel, indtil du selv vælger.' : undefined,
              )}
            >
              {(describedBy) => (
                <>
                  <Slider
                    id="includedKmPerYear"
                    stops={KM_STOPS}
                    value={form.includedKmLinked ? draft.annualKm : draft.includedKmPerYear}
                    onChange={(v) =>
                      apply({ ...withNumber(form, 'includedKmPerYear', formatInput(v)), includedKmLinked: false }, true)
                    }
                    format={(v) => `${formatInput(v)} km`}
                    describedBy={describedBy}
                  />
                  {!form.includedKmLinked && (
                    <button
                      type="button"
                      className="link-button"
                      onClick={() => apply({ ...form, includedKmLinked: true }, true)}
                    >
                      Brug forventet kørsel ({formatInput(draft.annualKm ?? 0)} km)
                    </button>
                  )}
                </>
              )}
            </Field>
            {numberField('excessKmPrice', 'Pris pr. overkørt km', 'kr.')}
              {numberField('earlyExitCost', 'Exit-omkostning ved førtidig ophør', 'kr.')}
              {numberField('returnCost', 'Egenbetaling ved aflevering', 'kr.')}
            </section>
          </div>

          <section className="card" aria-labelledby="return-title">
            <h2 id="return-title">Afkast af forskellen</h2>
            <fieldset className="field">
              <legend className="field-label">Medregn afkast</legend>
              <p className="field-hint" id="investDifference-hint">
                Det billigste scenarie sætter hver måned forskellen ind på en konto med rente.
              </p>
              <div className="radio-row">
                {[
                  { value: true, label: 'Til' },
                  { value: false, label: 'Fra' },
                ].map((o) => (
                  <label key={o.label} className="radio">
                    <input
                      type="radio"
                      name="investDifference"
                      checked={form.investDifference === o.value}
                      onChange={() => apply({ ...form, investDifference: o.value }, true)}
                      aria-describedby="investDifference-hint"
                    />
                    {o.label}
                  </label>
                ))}
              </div>
            </fieldset>
            {form.investDifference && (
              <>
                {numberField('annualReturnPct', 'Årlig afkastrente', '%')}
                {numberField('returnTaxPct', 'Skattesats på afkast', '%')}
              </>
            )}
          </section>
        </form>

        <div className="results" aria-live="polite">
          {result ? (
            <Results result={result} />
          ) : (
            <section className="card status">
              <h2>Resultat</h2>
              <p>
                Udfyld de påkrævede felter for at se sammenligningen.{' '}
                {missingCount > 0 && (
                  <>
                    {missingCount === 1 ? 'Der mangler 1 felt.' : `Der mangler ${missingCount} felter.`}
                  </>
                )}
              </p>
              <button
                type="button"
                className="button"
                onClick={() => setTouched(new Set(validation.ok ? [] : validation.errors.map((e) => e.field)))}
              >
                Vis manglende felter
              </button>
            </section>
          )}
        </div>
      </main>
    </>
  )
}

export default App
