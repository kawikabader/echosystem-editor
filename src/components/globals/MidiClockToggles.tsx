import { useCallback, useRef, useState } from 'react'
import { useStore } from '../../store'
import { GLOBAL_CC } from '../../lib/midi-constants'
import { GLOBAL_TIPS } from '../../lib/tooltips'
import * as midi from '../../lib/midi-service'
import { Tooltip } from '../ui/Tooltip'

export function MidiClockToggles() {
  const midiChannel = useStore((s) => s.midiChannel)
  const [clockA, setClockA] = useState(true)
  const [clockB, setClockB] = useState(true)
  const clockARef = useRef(true)
  const clockBRef = useRef(true)

  const toggleClockA = useCallback(() => {
    const next = !clockARef.current
    clockARef.current = next
    setClockA(next)
    midi.sendCC(midiChannel, GLOBAL_CC.clockA, next ? 127 : 0)
  }, [midiChannel])

  const toggleClockB = useCallback(() => {
    const next = !clockBRef.current
    clockBRef.current = next
    setClockB(next)
    midi.sendCC(midiChannel, GLOBAL_CC.clockB, next ? 127 : 0)
  }, [midiChannel])

  return (
    <div className="space-y-1.5">
      <label className="text-xs lg:text-[10px] text-text-muted uppercase tracking-wider font-medium">
        MIDI Clock
      </label>
      <div className="grid grid-cols-2 gap-1">
        <Tooltip text={GLOBAL_TIPS.clockA}>
          <button
            onClick={toggleClockA}
            className={`w-full px-2 py-1.5 rounded text-xs border transition-colors ${
              clockA
                ? 'bg-engine-a/20 text-engine-a border-engine-a/40'
                : 'bg-surface-hover text-text-muted border-border hover:text-text-secondary'
            }`}
          >
            Clock A {clockA ? 'On' : 'Off'}
          </button>
        </Tooltip>
        <Tooltip text={GLOBAL_TIPS.clockB}>
          <button
            onClick={toggleClockB}
            className={`w-full px-2 py-1.5 rounded text-xs border transition-colors ${
              clockB
                ? 'bg-engine-b/20 text-engine-b border-engine-b/40'
                : 'bg-surface-hover text-text-muted border-border hover:text-text-secondary'
            }`}
          >
            Clock B {clockB ? 'On' : 'Off'}
          </button>
        </Tooltip>
      </div>
      <p className="text-xs lg:text-[10px] text-text-muted">
        Requires Global Tap (blue) mode on pedal.
      </p>
    </div>
  )
}
