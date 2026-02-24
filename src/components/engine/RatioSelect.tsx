import type { MidiValue } from '../../lib/midi-types'
import { RATIO_POINTS, midiToRatioLabel } from '../../lib/echosystem/ratio-labels'
import { Tooltip } from '../ui/Tooltip'

interface RatioSelectProps {
  label: string
  value: MidiValue
  onChange: (value: MidiValue) => void
  accent: string
  tooltip?: string | undefined
}

export function RatioSelect({ label, value, onChange, accent, tooltip }: RatioSelectProps) {
  const currentLabel = midiToRatioLabel(value as number)

  return (
    <div className="flex items-center gap-3 group">
      {tooltip ? (
        <Tooltip text={tooltip}>
          <span className="text-xs text-text-secondary w-20 lg:w-28 text-right truncate shrink-0 cursor-help">
            {label}
          </span>
        </Tooltip>
      ) : (
        <span className="text-xs text-text-secondary w-20 lg:w-28 text-right truncate shrink-0">
          {label}
        </span>
      )}
      <select
        value={value as number}
        onChange={(e) => onChange(Number(e.target.value) as MidiValue)}
        className="flex-1 bg-surface-hover border border-border rounded px-2 py-2 lg:py-1.5 text-base lg:text-xs text-text-primary outline-none focus:border-accent cursor-pointer appearance-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M3 5l3 3 3-3'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 8px center',
        }}
        aria-label={`${label}: ${currentLabel}`}
      >
        {RATIO_POINTS.map((point) => (
          <option key={point.midi} value={point.midi}>
            {point.label}
          </option>
        ))}
      </select>
      <span
        className="w-12 text-xs text-center tabular-nums"
        style={{ color: accent }}
      >
        {currentLabel}
      </span>
    </div>
  )
}
