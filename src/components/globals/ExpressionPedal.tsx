import { useCallback, useState } from 'react'
import type { MidiValue } from '../../lib/midi-types'
import { useStore } from '../../store'
import { GLOBAL_CC } from '../../lib/midi-constants'
import * as midi from '../../lib/midi-service'
import { ParamSlider } from '../engine/ParamSlider'

export function ExpressionPedal() {
  const midiChannel = useStore((s) => s.midiChannel)
  const [value, setValue] = useState<MidiValue>(0 as MidiValue)

  const handleChange = useCallback(
    (v: MidiValue) => {
      setValue(v)
      midi.sendCCThrottled(midiChannel, GLOBAL_CC.expression, v as number)
    },
    [midiChannel],
  )

  return (
    <div className="space-y-1.5">
      <label className="text-[10px] text-text-muted uppercase tracking-wider font-medium">
        Expression Pedal
      </label>
      <ParamSlider
        label="EXP"
        value={value}
        onChange={handleChange}
        accent="#6366f1"
      />
      <p className="text-[10px] text-text-muted">
        Heel (0) → Toe (127). Controls whichever params are mapped on the pedal.
      </p>
    </div>
  )
}
