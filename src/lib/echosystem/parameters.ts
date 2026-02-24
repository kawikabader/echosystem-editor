import type { MidiValue } from '../midi-types'
import type { EngineState, DelaySource } from './types'

export function createDefaultEngine(): EngineState {
  return {
    modeIndex: 0,
    subModeIndex: 0,
    ratio: 64 as MidiValue,
    mix: 64 as MidiValue,
    volume: 64 as MidiValue,
    feedback: 64 as MidiValue,
    tone: 64 as MidiValue,
    thing1: 64 as MidiValue,
    thing2: 64 as MidiValue,
    delaySource: 'global' as DelaySource,
  }
}

export function midiValueToPercent(val: MidiValue): number {
  return Math.round(((val as number) / 127) * 100)
}

export function percentToMidiValue(pct: number): MidiValue {
  return Math.max(0, Math.min(127, Math.round((pct / 100) * 127))) as MidiValue
}

export function delaySourceToMidi(source: DelaySource): number {
  const map: Record<DelaySource, number> = { global: 0, local: 1, knob: 2 }
  return map[source]
}

export function midiToDelaySource(val: number): DelaySource {
  if (val <= 42) return 'global'
  if (val <= 85) return 'local'
  return 'knob'
}
