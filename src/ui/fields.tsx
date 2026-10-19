// Formularfelter med fejl, noter og advarsler ved feltet.

import type { ReactNode } from 'react'
import type { Frequency } from '../core/index.ts'

export interface FieldMessages {
  error?: string
  warning?: string
  note?: string
  hint?: string
}

interface FieldProps extends FieldMessages {
  id: string
  label: string
  children: (describedBy: string | undefined) => ReactNode
  /** Brug fieldset/legend, når feltet har flere kontroller. */
  group?: boolean
}

export function Field({ id, label, error, warning, note, hint, group, children }: FieldProps) {
  const messages = [
    hint && { key: 'hint', className: 'field-hint', text: hint },
    error && { key: 'error', className: 'field-error', text: error },
    warning && { key: 'warning', className: 'field-warning', text: warning },
    note && { key: 'note', className: 'field-note', text: note },
  ].filter((m) => !!m)
  const describedBy = messages.length > 0 ? messages.map((m) => `${id}-${m.key}`).join(' ') : undefined

  const body = (
    <>
      {children(describedBy)}
      {messages.map((m) => (
        <p key={m.key} id={`${id}-${m.key}`} className={m.className} role={m.key === 'error' ? 'alert' : undefined}>
          {m.text}
        </p>
      ))}
    </>
  )

  if (group) {
    return (
      <fieldset className={`field${error ? ' has-error' : ''}`}>
        <legend className="field-label">{label}</legend>
        {body}
      </fieldset>
    )
  }
  return (
    <div className={`field${error ? ' has-error' : ''}`}>
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      {body}
    </div>
  )
}

interface NumberInputProps {
  id: string
  value: string
  onChange: (value: string) => void
  onBlur: () => void
  unit: string
  describedBy?: string
  invalid?: boolean
  placeholder?: string
  label?: string
}

export function NumberInput({ id, value, onChange, onBlur, unit, describedBy, invalid, placeholder, label }: NumberInputProps) {
  return (
    <div className="input-with-unit">
      <input
        id={id}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={value}
        placeholder={placeholder}
        aria-label={label}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
      />
      <span className="unit" aria-hidden="true">
        {unit}
      </span>
    </div>
  )
}

const FREQUENCY_LABELS: Record<Frequency, string> = {
  month: 'pr. måned',
  quarter: 'pr. kvartal',
  halfYear: 'pr. halvår',
  year: 'pr. år',
}

interface FrequencySelectProps {
  id: string
  value: Frequency | ''
  onChange: (value: Frequency | '') => void
  onBlur: () => void
  describedBy?: string
  invalid?: boolean
}

export function FrequencySelect({ id, value, onChange, onBlur, describedBy, invalid }: FrequencySelectProps) {
  return (
    <select
      id={id}
      value={value}
      aria-label="Frekvens"
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      onChange={(e) => onChange(e.target.value as Frequency | '')}
      onBlur={onBlur}
    >
      <option value="">Vælg frekvens</option>
      {(Object.keys(FREQUENCY_LABELS) as Frequency[]).map((f) => (
        <option key={f} value={f}>
          {FREQUENCY_LABELS[f]}
        </option>
      ))}
    </select>
  )
}

interface ChoiceSelectProps {
  id: string
  value: string
  options: readonly { value: string; label: string }[]
  onChange: (value: string) => void
  describedBy?: string
}

export function ChoiceSelect({ id, value, options, onChange, describedBy }: ChoiceSelectProps) {
  return (
    <select id={id} value={value} aria-describedby={describedBy} onChange={(e) => onChange(e.target.value)}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}
