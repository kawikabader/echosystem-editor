import { useCallback, useRef } from 'react'
import type { MidiValue } from '../../lib/midi-types'
import { useStore } from '../../store'
import { GLOBAL_TIPS } from '../../lib/tooltips'
import { Tooltip } from '../ui/Tooltip'

export function ExpressionPedal() {
  const expressionValue = useStore((s) => s.expressionValue)
  const setExpression = useStore((s) => s.setExpression)
  const trackRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef(false)
  const localRef = useRef<number>(expressionValue as number)

  const calcValue = useCallback((clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect()
    if (!rect) return localRef.current
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    return Math.round(ratio * 127)
  }, [])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    draggingRef.current = true
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    const next = calcValue(e.clientX)
    localRef.current = next
    setExpression(next as MidiValue)
  }, [calcValue, setExpression])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!draggingRef.current || e.buttons === 0) return
    const next = calcValue(e.clientX)
    localRef.current = next
    setExpression(next as MidiValue)
  }, [calcValue, setExpression])

  const handlePointerUp = useCallback(() => {
    draggingRef.current = false
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      let newVal = expressionValue as number
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowUp':
          newVal = Math.min(127, newVal + 1)
          break
        case 'ArrowLeft':
        case 'ArrowDown':
          newVal = Math.max(0, newVal - 1)
          break
        case 'PageUp':
          newVal = Math.min(127, newVal + 10)
          break
        case 'PageDown':
          newVal = Math.max(0, newVal - 10)
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
      localRef.current = newVal
      setExpression(newVal as MidiValue)
    },
    [expressionValue, setExpression],
  )

  const pct = ((expressionValue as number) / 127) * 100

  return (
    <div className="space-y-1.5">
      <label className="text-xs lg:text-[10px] text-text-muted uppercase tracking-wider font-medium">
        Expression
      </label>
      <Tooltip text={GLOBAL_TIPS.expression}>
        <div
          ref={trackRef}
          role="slider"
          tabIndex={0}
          aria-valuenow={expressionValue as number}
          aria-valuemin={0}
          aria-valuemax={127}
          aria-label="Expression"
          aria-valuetext={`Expression: ${expressionValue as number}`}
          className="relative h-6 rounded bg-surface-hover cursor-pointer select-none touch-none outline-none focus-visible:ring-2 focus-visible:ring-accent"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onKeyDown={handleKeyDown}
        >
          <div
            className="absolute inset-y-0 left-0 rounded bg-accent/30 transition-none"
            style={{ width: `${pct}%` }}
          />
          <span className="absolute inset-0 flex items-center justify-center text-[10px] text-text-muted tabular-nums pointer-events-none">
            {expressionValue as number}
          </span>
        </div>
      </Tooltip>
    </div>
  )
}
