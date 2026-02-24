import { useCallback, useRef, useState } from 'react'
import { useStore } from '../../store'
import { GLOBAL_CC } from '../../lib/midi-constants'
import { GLOBAL_TIPS } from '../../lib/tooltips'
import * as midi from '../../lib/midi-service'
import { Tooltip } from '../ui/Tooltip'

export function TapTempo() {
  const midiChannel = useStore((s) => s.midiChannel)
  const lastTapRef = useRef<number | null>(null)
  const [bpm, setBpm] = useState<number | null>(null)
  const [bpmInput, setBpmInput] = useState('')
  const [holding, setHolding] = useState(false)
  const tapTimesRef = useRef<number[]>([])
  const resetTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const sendTapsForBpm = useCallback(
    (targetBpm: number) => {
      const intervalMs = 60000 / targetBpm
      midi.sendCC(midiChannel, GLOBAL_CC.tap, 64)
      setTimeout(() => {
        midi.sendCC(midiChannel, GLOBAL_CC.tap, 64)
      }, intervalMs)
      setBpm(targetBpm)
      setBpmInput('')
    },
    [midiChannel],
  )

  const handleTap = useCallback(() => {
    midi.sendCC(midiChannel, GLOBAL_CC.tap, 64)

    const now = performance.now()
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
  }, [midiChannel])

  const handleBpmSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const parsed = parseInt(bpmInput, 10)
      if (!isNaN(parsed) && parsed >= 20 && parsed <= 300) {
        sendTapsForBpm(parsed)
      }
    },
    [bpmInput, sendTapsForBpm],
  )

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
          placeholder={bpm !== null ? String(bpm) : 'BPM'}
          value={bpmInput}
          onChange={(e) => setBpmInput(e.target.value)}
          className="w-full bg-surface-hover border border-border rounded px-2 py-2 lg:py-1 text-base lg:text-xs text-text-primary text-center outline-none focus:border-accent tabular-nums placeholder:text-text-muted"
        />
      </form>
    </div>
  )
}
