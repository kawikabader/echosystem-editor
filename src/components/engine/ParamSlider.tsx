import { useCallback, useRef, useState, useEffect } from 'react'
import type { MidiValue } from '../../lib/midi-types'
import { Tooltip } from '../ui/Tooltip'

interface ParamSliderProps {
  label: string
  value: MidiValue
  onChange: (value: MidiValue) => void
  accent: string
  formatValue?: ((midiValue: number) => string) | undefined
  tooltip?: string | undefined
}

export function ParamSlider({ label, value, onChange, accent, formatValue, tooltip }: ParamSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState('')
  const shiftRef = useRef(false)
  const draggingRef = useRef(false)
  const localRef = useRef<number>(value as number)
  const rafRef = useRef<number>(0)
  const [localValue, setLocalValue] = useState<number>(value as number)

  useEffect(() => {
    if (!draggingRef.current) {
      localRef.current = value as number
      setLocalValue(value as number)
    }
  }, [value])

  const pct = (localValue / 127) * 100
  const displayPct = Math.round(pct)

  const calcValue = useCallback(
    (clientX: number) => {
      const rect = trackRef.current?.getBoundingClientRect()
      if (!rect) return localValue
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
      return Math.round(ratio * 127)
    },
    [localValue],
  )

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault()
      shiftRef.current = e.shiftKey
      draggingRef.current = true
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
      const next = calcValue(e.clientX)
      localRef.current = next
      setLocalValue(next)
    },
    [calcValue],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (e.buttons === 0) return
      shiftRef.current = e.shiftKey

      let next: number
      if (shiftRef.current) {
        const rect = trackRef.current?.getBoundingClientRect()
        if (!rect) return
        const delta = e.movementX / rect.width
        const fineDelta = delta * 0.1
        next = Math.max(0, Math.min(127, Math.round(localRef.current + fineDelta * 127)))
      } else {
        next = calcValue(e.clientX)
      }

      localRef.current = next
      cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => {
        setLocalValue(next)
      })
    },
    [calcValue],
  )

  const handlePointerUp = useCallback(() => {
    if (!draggingRef.current) return
    draggingRef.current = false
    onChange(localRef.current as MidiValue)
  }, [onChange])

  const handleDoubleClick = useCallback(() => {
    setEditValue(String(localValue))
    setEditing(true)
  }, [localValue])

  const commitEdit = useCallback(() => {
    const parsed = parseInt(editValue, 10)
    if (!isNaN(parsed)) {
      const clamped = Math.max(0, Math.min(127, parsed))
      setLocalValue(clamped)
      onChange(clamped as MidiValue)
    }
    setEditing(false)
  }, [editValue, onChange])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (editing) {
        if (e.key === 'Enter') commitEdit()
        if (e.key === 'Escape') setEditing(false)
        return
      }

      let newVal = localValue
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowUp':
          newVal = Math.min(127, localValue + 1)
          break
        case 'ArrowLeft':
        case 'ArrowDown':
          newVal = Math.max(0, localValue - 1)
          break
        case 'PageUp':
          newVal = Math.min(127, localValue + 10)
          break
        case 'PageDown':
          newVal = Math.max(0, localValue - 10)
          break
        case 'Home':
          newVal = 0
          break
        case 'End':
          newVal = 127
          break
        default:
          return
      }
      e.preventDefault()
      setLocalValue(newVal)
      onChange(newVal as MidiValue)
    },
    [editing, localValue, onChange, commitEdit],
  )

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

      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-valuenow={localValue}
        aria-valuemin={0}
        aria-valuemax={127}
        aria-valuetext={`${label}: ${formatValue ? formatValue(localValue) : `${displayPct}%`}`}
        aria-label={label}
        className="relative min-h-11 lg:min-h-0 lg:h-6 flex-1 flex items-center cursor-pointer rounded select-none touch-none outline-none focus-visible:ring-2 focus-visible:ring-accent"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onDoubleClick={handleDoubleClick}
        onKeyDown={handleKeyDown}
      >
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-2 lg:h-full lg:top-0 lg:translate-y-0 bg-surface-hover rounded" />
        <div
          className="absolute top-1/2 -translate-y-1/2 h-2 lg:h-full lg:top-0 lg:translate-y-0 left-0 rounded transition-none"
          style={{ width: `${pct}%`, backgroundColor: accent, opacity: 0.3 }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-6 h-6 lg:w-3 lg:h-5 rounded-full lg:rounded-sm transition-none after:content-[''] after:absolute after:-inset-2 after:rounded-full"
          style={{ left: `calc(${pct}% - 12px)`, backgroundColor: accent }}
        />
      </div>

      {editing ? (
        <input
          type="number"
          min={0}
          max={127}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={handleKeyDown}
          autoFocus
          className="w-12 bg-surface-hover border border-accent rounded px-1 py-0.5 text-base lg:text-xs text-text-primary text-center outline-none"
        />
      ) : (
        <span
          className="w-12 text-xs text-text-muted text-center tabular-nums cursor-pointer hover:text-text-secondary"
          onDoubleClick={handleDoubleClick}
        >
          {formatValue ? formatValue(localValue) : `${displayPct}%`}
        </span>
      )}
    </div>
  )
}
