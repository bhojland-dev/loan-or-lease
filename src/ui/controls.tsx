// Formularfelter koblet til formularens tilstand. Etiketter og enheder kommer fra fieldText.ts.

import type { NumberField, PeriodicField } from '../core/index.ts'
import { DEPRECIATION_LABEL, NUMBER_FIELD_TEXT, PERIODIC_FIELD_TEXT } from './fieldText.ts'
import { Field, FrequencySelect, NumberInput, Slider } from './fields.tsx'
import { useForm } from './formContext.ts'

interface NumberControlProps {
  field: NumberField
  /** Erstatter den faste hjælpetekst, fx når den afhænger af andre felter. */
  hint?: string
  placeholder?: string
}

export function NumberControl({ field, hint, placeholder }: NumberControlProps) {
  const form = useForm()
  const text = NUMBER_FIELD_TEXT[field]
  const msg = form.messages(field, hint ?? text.hint)
  return (
    <Field id={field} label={text.label} {...msg}>
      {(describedBy) => (
        <NumberInput
          id={field}
          value={form.values.numbers[field]}
          onChange={(typed) => form.dispatch({ type: 'typeNumber', field, text: typed })}
          onBlur={() => form.dispatch({ type: 'commitNumber', field })}
          unit={text.unit}
          placeholder={placeholder}
          describedBy={describedBy}
          invalid={!!msg.error}
        />
      )}
    </Field>
  )
}

export function PeriodicControl({ field }: { field: PeriodicField }) {
  const form = useForm()
  const text = PERIODIC_FIELD_TEXT[field]
  const msg = form.messages(field, text.hint)
  const value = form.values.periodic[field]
  return (
    <Field id={field} label={text.label} {...msg} group>
      {(describedBy) => (
        <div className="periodic">
          <NumberInput
            id={field}
            label={`${text.label}, beløb`}
            value={value.amount}
            onChange={(typed) => form.dispatch({ type: 'typePeriodicAmount', field, text: typed })}
            onBlur={() => form.dispatch({ type: 'commitPeriodicAmount', field })}
            unit="kr."
            describedBy={describedBy}
            invalid={!!msg.error}
          />
          <FrequencySelect
            id={`${field}-frequency`}
            value={value.frequency}
            onChange={(frequency) => form.dispatch({ type: 'chooseFrequency', field, frequency })}
            onBlur={() => form.dispatch({ type: 'touch', field })}
            describedBy={describedBy}
            invalid={!!msg.error}
          />
        </div>
      )}
    </Field>
  )
}

interface SliderControlProps {
  field: NumberField
  stops: readonly number[]
  format: (value: number) => string
  tickLabel?: (value: number) => string
}

export function SliderControl({ field, stops, format, tickLabel }: SliderControlProps) {
  const form = useForm()
  return (
    <Field id={field} label={NUMBER_FIELD_TEXT[field].label} {...form.messages(field)}>
      {(describedBy) => (
        <Slider
          id={field}
          stops={stops}
          value={form.draft[field]}
          onChange={(value) => form.dispatch({ type: 'chooseNumber', field, value })}
          format={format}
          tickLabel={tickLabel}
          describedBy={describedBy}
        />
      )}
    </Field>
  )
}

export function DepreciationControl() {
  const form = useForm()
  const msg = form.messages('depreciationPct')
  return (
    <Field id="depreciationPct" label={DEPRECIATION_LABEL} {...msg} group>
      {(describedBy) => (
        <div className="depreciation">
          {form.values.depreciation.map((value, year) => (
            <div key={year} className="depreciation-year">
              <label htmlFor={`depreciation-${year}`}>År {year + 1}</label>
              <NumberInput
                id={`depreciation-${year}`}
                value={value}
                onChange={(text) => form.dispatch({ type: 'typeDepreciation', year, text })}
                onBlur={() => form.dispatch({ type: 'commitDepreciation', year })}
                unit="%"
                describedBy={describedBy}
                invalid={!!msg.error}
              />
            </div>
          ))}
        </div>
      )}
    </Field>
  )
}
