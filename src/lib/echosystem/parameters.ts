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
