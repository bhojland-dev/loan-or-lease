import { useMemo, useState } from 'react'
import {
  calculate,
  calculateLoanNeed,
  defaultEstablishmentFee,
  defaultRegistrationFee,
  FIELD_NOTES,
  INCLUDED_KM_MAX,
  INCLUDED_KM_MIN,
  INCLUDED_KM_STEP,
  LEASE_TERMS,
  validate,
  warnings,
} from '../core/index.ts'
import type { InputField } from '../core/index.ts'
import { Field, FrequencySelect, NumberInput, Slider } from './fields.tsx'
import type { FieldMessages } from './fields.tsx'
import { formatInput, formatKr, parseDanishNumber } from './format.ts'
import { initialFormState, toDraft, unreadableFields } from './form.ts'
import type { FormState, NumberField, PeriodicField } from './form.ts'
import { Results } from './Results.tsx'

const INCLUDED_KM_STOPS = Array.from(
  { length: (INCLUDED_KM_MAX - INCLUDED_KM_MIN) / INCLUDED_KM_STEP + 1 },
  (_, i) => INCLUDED_KM_MIN + i * INCLUDED_KM_STEP,
)

const UNREADABLE = 'Skriv et tal, fx 1.234,50.'

function App() {
  const [form, setForm] = useState<FormState>(initialFormState)
  const [touched, setTouched] = useState<ReadonlySet<InputField>>(new Set())

  const draft = useMemo(() => toDraft(form), [form])
  const validation = useMemo(() => validate(draft), [draft])
  const result = useMemo(() => (validation.ok ? calculate(validation.inputs) : null), [validation])
  const unreadable = useMemo(() => unreadableFields(form), [form])

  const errors = new Map<InputField, string>()
  if (!validation.ok) for (const e of validation.errors) if (!errors.has(e.field)) errors.set(e.field, e.message)

  const kmWarning =
    draft.annualKm !== undefined && Number.isFinite(draft.annualKm) ? warnings({ annualKm: draft.annualKm })[0] : undefined
  const loanNeed =
    draft.purchasePrice !== undefined && draft.downPayment !== undefined
      ? calculateLoanNeed(draft.purchasePrice, draft.downPayment)
      : Number.NaN
  const hasLoanNeed = Number.isFinite(loanNeed)

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

  function setNumber(field: NumberField, value: string) {
    setForm((prev) => ({ ...prev, numbers: { ...prev.numbers, [field]: value } }))
  }

  /** Ved blur skrives tallet pænt med dansk formatering, fx "200000" → "200.000". */
  function tidyNumber(field: NumberField) {
    const value = parseDanishNumber(form.numbers[field])
    if (value !== undefined && Number.isFinite(value)) setNumber(field, formatInput(value))
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
            onChange={(v) => setNumber(field, v)}
            onBlur={() => tidyNumber(field)}
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
    const update = (change: Partial<typeof value>) =>
      setForm((prev) => ({ ...prev, periodic: { ...prev.periodic, [field]: { ...prev.periodic[field], ...change } } }))
    return (
      <Field id={field} label={label} {...msg} group>
        {(describedBy) => (
          <div className="periodic">
            <NumberInput
              id={field}
              label={`${label}, beløb`}
              value={value.amount}
              onChange={(amount) => update({ amount })}
              onBlur={() => {
                const n = parseDanishNumber(value.amount)
                if (n !== undefined && Number.isFinite(n)) update({ amount: formatInput(n) })
                touch(field)
              }}
              unit="kr."
              describedBy={describedBy}
              invalid={!!msg.error}
            />
            <FrequencySelect
              id={`${field}-frequency`}
              value={value.frequency}
              onChange={(frequency) => update({ frequency })}
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
  const noLoan = hasLoanNeed && loanNeed === 0
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

      <main className="layout">
        <form className="inputs" onSubmit={(e) => e.preventDefault()} noValidate>
          <section className="card" aria-labelledby="buy-title">
            <h2 id="buy-title">Køb med billån</h2>
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
                        onChange={(v) =>
                          setForm((prev) => {
                            const next = [...prev.depreciation] as FormState['depreciation']
                            next[i] = v
                            return { ...prev, depreciation: next }
                          })
                        }
                        onBlur={() => touch('depreciationPct')}
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

          <section className="card" aria-labelledby="lease-title">
            <h2 id="lease-title">Privatleasing</h2>
            <Field id="leaseTermMonths" label="Leasingaftalens løbetid">
              {(describedBy) => (
                <Slider
                  id="leaseTermMonths"
                  stops={LEASE_TERMS}
                  value={draft.leaseTermMonths}
                  onChange={(v) => setNumber('leaseTermMonths', formatInput(v))}
                  format={(v) => `${v} mdr.`}
                  tickLabel={(v) => `${v}`}
                  describedBy={describedBy}
                />
              )}
            </Field>
            {numberField('leaseInitialPayment', 'Førstegangsydelse', 'kr.')}
            {numberField('leaseMonthlyPayment', 'Månedlig leasingydelse', 'kr./md.')}
            <Field id="includedKmPerYear" label="Inkluderede km pr. år">
              {(describedBy) => (
                <Slider
                  id="includedKmPerYear"
                  stops={INCLUDED_KM_STOPS}
                  value={draft.includedKmPerYear}
                  onChange={(v) => setNumber('includedKmPerYear', formatInput(v))}
                  format={(v) => `${formatInput(v)} km`}
                  describedBy={describedBy}
                />
              )}
            </Field>
            {numberField('excessKmPrice', 'Pris pr. overkørt km', 'kr.')}
            {numberField('earlyExitCost', 'Exit-omkostning ved førtidig ophør', 'kr.')}
            {numberField('returnCost', 'Egenbetaling ved aflevering', 'kr.')}
          </section>

          <section className="card" aria-labelledby="shared-title">
            <h2 id="shared-title">Fælles for begge</h2>
            {periodicField('insurance', 'Forsikring')}
            {periodicField('ownershipTax', 'Ejerafgift')}
            {numberField('annualKm', 'Forventet kørsel', 'km/år')}
          </section>

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
                      onChange={() => setForm((prev) => ({ ...prev, investDifference: o.value }))}
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
