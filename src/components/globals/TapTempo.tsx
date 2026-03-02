import { useCallback, useRef, useState, type FocusEvent } from 'react'
import { useStore } from '../../store'
import { GLOBAL_CC } from '../../lib/midi-constants'
import { GLOBAL_TIPS } from '../../lib/tooltips'
import * as midi from '../../lib/midi-service'
import { Tooltip } from '../ui/Tooltip'

/**
 * Outgoing tap timestamps are tracked so that if incoming CC 35 handling
 * is ever added (e.g. via a MIDI loop), echoes within this window can be
 * filtered out to prevent double-counting in BPM calculation.
 */
const ECHO_SUPPRESS_MS = 80

export function TapTempo() {
  const midiChannel = useStore((s) => s.midiChannel)
  const lastTapRef = useRef<number | null>(null)
  const lastOutgoingTapRef = useRef(0)
  const bpm = useStore((s) => s.bpm)
  const setBpm = useStore((s) => s.setBpm)
  const [bpmInput, setBpmInput] = useState('')
  const [editing, setEditing] = useState(false)
  const [holding, setHolding] = useState(false)
  const tapTimesRef = useRef<number[]>([])
  const resetTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const recordTap = useCallback((now: number) => {
    if (now - lastOutgoingTapRef.current < ECHO_SUPPRESS_MS && lastTapRef.current !== null) return

    const lastTap = lastTapRef.current
    if (lastTap !== null) {
      const interval = now - lastTap
      tapTimesRef.current.push(interval)
      if (tapTimesRef.current.length > 4) {
        tapTimesRef.current = tapTimesRef.current.slice(-4)
      }
      const avg =
        tapTimesRef.current.reduce((a, b) => a + b, 0) / tapTimesRef.current.length
      setBpm(Math.round(60000 / avg))
    }
    lastTapRef.current = now

    clearTimeout(resetTimerRef.current)
    resetTimerRef.current = setTimeout(() => {
      tapTimesRef.current = []
      lastTapRef.current = null
    }, 3000)
  }, [])

  const sendTapsForBpm = useCallback(
    (targetBpm: number) => {
      const intervalMs = 60000 / targetBpm
      lastOutgoingTapRef.current = performance.now()
      midi.sendCC(midiChannel, GLOBAL_CC.tap, 64)
      setTimeout(() => {
        lastOutgoingTapRef.current = performance.now()
        midi.sendCC(midiChannel, GLOBAL_CC.tap, 64)
      }, intervalMs)
      setBpm(targetBpm)
      setBpmInput('')
    },
    [midiChannel],
  )

  const handleTap = useCallback(() => {
    lastOutgoingTapRef.current = performance.now()
    midi.sendCC(midiChannel, GLOBAL_CC.tap, 64)
    recordTap(performance.now())
  }, [midiChannel, recordTap])

  const handleBpmSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const parsed = parseInt(bpmInput, 10)
      if (!isNaN(parsed) && parsed >= 20 && parsed <= 300) {
        sendTapsForBpm(parsed)
      }
      setEditing(false)
    },
    [bpmInput, sendTapsForBpm],
  )

  const handleBpmFocus = useCallback((e: FocusEvent<HTMLInputElement>) => {
    setEditing(true)
    setBpmInput(bpm !== null ? String(bpm) : '')
    requestAnimationFrame(() => e.target.select())
  }, [bpm])

  const handleBpmBlur = useCallback(() => {
    setEditing(false)
    setBpmInput('')
  }, [])

  const handleInfiniteDown = useCallback(() => {
    setHolding(true)
    midi.sendCC(midiChannel, GLOBAL_CC.tap, 127)
  }, [midiChannel])

  const handleInfiniteUp = useCallback(() => {
    setHolding(false)
    midi.sendCC(midiChannel, GLOBAL_CC.tap, 0)
  }, [midiChannel])

  return (
    <div className="space-y-1.5">
      <label className="text-xs lg:text-[10px] text-text-muted uppercase tracking-wider font-medium">
        Tap Tempo
      </label>
      <div className="grid grid-cols-2 gap-1">
        <Tooltip text={GLOBAL_TIPS.tap}>
          <button
            onClick={handleTap}
            className="w-full px-3 py-3 rounded-lg text-sm font-semibold bg-surface-hover text-text-primary border border-border hover:bg-surface-active active:bg-accent active:text-white transition-colors"
          >
            TAP
          </button>
        </Tooltip>
        <Tooltip text={GLOBAL_TIPS.infinite}>
          <button
            onPointerDown={handleInfiniteDown}
            onPointerUp={handleInfiniteUp}
            onPointerLeave={handleInfiniteUp}
            className={`w-full px-3 py-3 rounded-lg text-sm font-semibold border transition-colors select-none ${
              holding
                ? 'bg-danger text-white border-danger'
                : 'bg-surface-hover text-text-primary border-border hover:bg-surface-active'
            }`}
          >
            {holding ? '∞ HOLD' : '∞'}
          </button>
        </Tooltip>
      </div>
      <form onSubmit={handleBpmSubmit}>
        <input
          type="number"
          min={20}
          max={300}
          placeholder="BPM"
          value={editing ? bpmInput : (bpm !== null ? String(bpm) : '')}
          onChange={(e) => setBpmInput(e.target.value)}
          onFocus={handleBpmFocus}
          onBlur={handleBpmBlur}
          className="w-full bg-surface-hover border border-border rounded px-2 py-2 lg:py-1 text-base lg:text-xs text-text-primary text-center outline-none focus:border-accent tabular-nums placeholder:text-text-muted"
        />
      </form>
    </div>
  )
}
