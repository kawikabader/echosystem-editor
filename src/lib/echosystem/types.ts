import type { MidiValue } from '../midi-types'
import type { EngineId } from '../midi-constants'

export type DelaySource = 'global' | 'local' | 'knob'
export type Routing = 'single' | 'parallel' | 'serial' | 'leftRight'

export const DELAY_SOURCE_VALUES: Record<DelaySource, number> = {
  global: 0,
  local: 1,
  knob: 2,
}

export const ROUTING_VALUES: Record<Routing, number> = {
  single: 0,
  parallel: 1,
  serial: 2,
  leftRight: 3,
}

export const ROUTING_LABELS: Record<Routing, string> = {
  single: 'Single',
  parallel: 'Parallel',
  serial: 'Serial',
  leftRight: 'Left / Right',
}

export const DELAY_SOURCE_LABELS: Record<DelaySource, string> = {
  global: 'Global Tap',
  local: 'Local Tap',
  knob: 'Knob',
}

export interface EngineState {
  modeIndex: number
  subModeIndex: number
  ratio: MidiValue
  mix: MidiValue
  volume: MidiValue
  feedback: MidiValue
  tone: MidiValue
  thing1: MidiValue
  thing2: MidiValue
  delaySource: DelaySource
}

export interface GlobalState {
  routing: Routing
  bypassed: boolean
  tempo: MidiValue
}

export interface Preset {
  id: number
  name: string
  engineA: EngineState
  engineB: EngineState
  global: GlobalState
}

export type { EngineId }

export const ENGINE_PARAM_LABELS: Record<string, string> = {
  ratio: 'Delay Time / Ratio',
  mix: 'Mix',
  volume: 'Volume',
  feedback: 'Feedback',
  tone: 'Tone',
  thing1: 'Thing 1',
  thing2: 'Thing 2',
}

export const ENGINE_PARAM_ORDER = ['ratio', 'mix', 'volume', 'feedback', 'tone', 'thing1', 'thing2'] as const
export type TunableParam = (typeof ENGINE_PARAM_ORDER)[number]
