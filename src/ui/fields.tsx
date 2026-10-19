// Formularfelter med fejl, noter og advarsler ved feltet.

import type { CSSProperties, ReactNode } from 'react'
import { FREQUENCIES } from '../core/index.ts'
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
      <fieldset className="field">
        <legend className="field-label">{label}</legend>
        {body}
      </fieldset>
    )
  }
  return (
    <div className="field">
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
      {FREQUENCIES.map((f) => (
        <option key={f} value={f}>
          {FREQUENCY_LABELS[f]}
        </option>
      ))}
    </select>
  )
}

interface SliderProps {
  id: string
  /** De tilladte værdier i rækkefølge. Slideren hopper mellem dem. */
  stops: readonly number[]
  value: number | undefined
  onChange: (value: number) => void
  format: (value: number) => string
  /** Kort tekst under hvert stop. Udelades, vises kun første og sidste. */
  tickLabel?: (value: number) => string
  describedBy?: string
}

export function Slider({ id, stops, value, onChange, format, tickLabel, describedBy }: SliderProps) {
  const found = value === undefined ? -1 : stops.indexOf(value)
  const index = found === -1 ? 0 : found
  const fill = stops.length > 1 ? (index / (stops.length - 1)) * 100 : 0
  const label = tickLabel ?? format
  return (
    <div className="slider">
      <output className="slider-value" htmlFor={id} aria-hidden="true">
        {format(stops[index])}
      </output>
      <input
        id={id}
        type="range"
        min={0}
        max={stops.length - 1}
        step={1}
        value={index}
        aria-valuetext={format(stops[index])}
        aria-describedby={describedBy}
        style={{ '--fill': `${fill}%` } as CSSProperties}
        onChange={(e) => onChange(stops[Number(e.target.value)])}
      />
      <div className="slider-ticks" aria-hidden="true">
        {stops.map((stop, i) => (
          <button
            key={stop}
            type="button"
            tabIndex={-1}
            className={`slider-tick${i === index ? ' is-active' : ''}`}
            style={{ left: `${stops.length > 1 ? (i / (stops.length - 1)) * 100 : 0}%` }}
            onClick={() => onChange(stop)}
          >
            {tickLabel || i === 0 || i === stops.length - 1 ? label(stop) : ''}
          </button>
        ))}
      </div>
    </div>
  )
}
