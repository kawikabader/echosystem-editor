import type { StateCreator } from 'zustand'
import type { MidiValue } from '../lib/midi-types'
import type { EngineState, GlobalState, TunableParam, Routing, DelaySource, EngineId } from '../lib/echosystem'
import { createDefaultEngine } from '../lib/echosystem'
import { computeModeCC } from '../lib/echosystem'
import { ENGINE_CC, GLOBAL_CC, CC_TO_TARGET } from '../lib/midi-constants'
import { ROUTING_VALUES, DELAY_SOURCE_VALUES } from '../lib/echosystem/types'
import * as midi from '../lib/midi-service'
import type { StoreState } from './index'

const DELAY_SOURCE_BY_VALUE = Object.fromEntries(
  Object.entries(DELAY_SOURCE_VALUES).map(([k, v]) => [v, k]),
) as Record<number, DelaySource>

const ROUTING_BY_VALUE = Object.fromEntries(
  Object.entries(ROUTING_VALUES).map(([k, v]) => [v, k]),
) as Record<number, Routing>

type GlobalCCHandler = {
  handle: (state: StoreState, value: number) => void
  marksDirty: boolean
}

const GLOBAL_CC_HANDLERS: Partial<Record<keyof typeof GLOBAL_CC, GlobalCCHandler>> = {
  engageBypass: {
    handle: (state, value) => { state.global.bypassed = value === 0 },
    marksDirty: false,
  },
  routing: {
    handle: (state, value) => {
      const routing = ROUTING_BY_VALUE[value]
      if (routing) state.global.routing = routing
    },
    marksDirty: true,
  },
  bypass: {
    handle: (state) => { state.global.bypassed = !state.global.bypassed },
    marksDirty: false,
  },
  soloA: {
    handle: (state, value) => {
      state.soloEngine = value > 63 ? 'A' : (state.soloEngine === 'A' ? null : state.soloEngine)
    },
    marksDirty: false,
  },
  soloB: {
    handle: (state, value) => {
      state.soloEngine = value > 63 ? 'B' : (state.soloEngine === 'B' ? null : state.soloEngine)
    },
    marksDirty: false,
  },
  clockA: {
    handle: (state, value) => { state.clockA = value > 63 },
    marksDirty: false,
  },
  clockB: {
    handle: (state, value) => { state.clockB = value > 63 },
    marksDirty: false,
  },
  expression: {
    handle: (state, value) => { state.expressionValue = value as MidiValue },
    marksDirty: false,
  },
  // engineOrder: deferred until hardware-verified (double-swap risk if pedal also dumps params)
}

export interface DeviceSlice {
  engineA: EngineState
  engineB: EngineState
  global: GlobalState
  soloEngine: EngineId | null
  expressionValue: MidiValue
  clockA: boolean
  clockB: boolean
  bpm: number | null

  setBpm: (bpm: number) => void
  setEngineParam: (engine: EngineId, param: TunableParam, value: MidiValue) => void
  setEngineMode: (engine: EngineId, modeIndex: number, subModeIndex: number) => void
  setDelaySource: (engine: EngineId, source: DelaySource) => void
  setRouting: (routing: Routing) => void
  toggleBypass: () => void
  setSoloEngine: (engine: EngineId | null) => void
  toggleClockA: () => void
  toggleClockB: () => void
  setExpression: (value: MidiValue) => void
  applyEngineState: (engine: EngineId, state: EngineState) => void
  applyGlobalState: (state: GlobalState) => void
  receiveCC: (cc: number, value: number) => void
}

export const createDeviceSlice: StateCreator<StoreState, [['zustand/immer', never]], [], DeviceSlice> = (set, get) => ({
  engineA: createDefaultEngine(),
  engineB: createDefaultEngine(),
  global: {
    routing: 'single',
    bypassed: false,
    tempo: 64 as MidiValue,
  },
  soloEngine: null,
  expressionValue: 0 as MidiValue,
  clockA: true,
  clockB: true,
  bpm: null,

  setBpm: (bpm) => {
    set((state) => { state.bpm = bpm })
  },

  setEngineParam: (engine, param, value) => {
    const ch = get().midiChannel
    const cc = ENGINE_CC[engine][param]
    midi.sendCCThrottled(ch, cc, value as number)

    set((state) => {
      const eng = engine === 'A' ? state.engineA : state.engineB
      ;(eng as Record<string, unknown>)[param] = value
    })
  },

  setEngineMode: (engine, modeIndex, subModeIndex) => {
    const ch = get().midiChannel
    const cc = ENGINE_CC[engine].mode
    const modeValue = computeModeCC(modeIndex, subModeIndex)
    midi.sendCC(ch, cc, modeValue)

    set((state) => {
      const eng = engine === 'A' ? state.engineA : state.engineB
      eng.modeIndex = modeIndex
      eng.subModeIndex = subModeIndex
    })
  },

  setDelaySource: (engine, source) => {
    const ch = get().midiChannel
    const cc = ENGINE_CC[engine].delaySource
    midi.sendCC(ch, cc, DELAY_SOURCE_VALUES[source])

    set((state) => {
      const eng = engine === 'A' ? state.engineA : state.engineB
      eng.delaySource = source
    })
  },

  setRouting: (routing) => {
    const ch = get().midiChannel
    midi.sendCC(ch, GLOBAL_CC.routing, ROUTING_VALUES[routing])

    set((state) => {
      state.global.routing = routing
    })
  },

  toggleBypass: () => {
    const { global: g } = get()
    const newBypassed = !g.bypassed
    const ch = get().midiChannel
    midi.sendCC(ch, GLOBAL_CC.engageBypass, newBypassed ? 0 : 127)

    set((state) => {
      state.global.bypassed = newBypassed
    })
  },

  setSoloEngine: (engine) => {
    const ch = get().midiChannel
    const current = get().soloEngine

    if (engine === current) {
      midi.sendCC(ch, GLOBAL_CC.soloA, 0)
      setTimeout(() => midi.sendCC(ch, GLOBAL_CC.soloB, 0), 10)
      set((state) => { state.soloEngine = null })
    } else if (engine === 'A') {
      midi.sendCC(ch, GLOBAL_CC.soloB, 0)
      setTimeout(() => midi.sendCC(ch, GLOBAL_CC.soloA, 127), 10)
      set((state) => { state.soloEngine = 'A' })
    } else {
      midi.sendCC(ch, GLOBAL_CC.soloA, 0)
      setTimeout(() => midi.sendCC(ch, GLOBAL_CC.soloB, 127), 10)
      set((state) => { state.soloEngine = 'B' })
    }
  },

  toggleClockA: () => {
    const next = !get().clockA
    midi.sendCC(get().midiChannel, GLOBAL_CC.clockA, next ? 127 : 0)
    set((state) => { state.clockA = next })
  },

  toggleClockB: () => {
    const next = !get().clockB
    midi.sendCC(get().midiChannel, GLOBAL_CC.clockB, next ? 127 : 0)
    set((state) => { state.clockB = next })
  },

  setExpression: (value) => {
    midi.sendCCThrottled(get().midiChannel, GLOBAL_CC.expression, value as number)
    set((state) => { state.expressionValue = value })
  },

  applyEngineState: (engine, engineState) => {
    set((state) => {
      if (engine === 'A') {
        state.engineA = { ...engineState }
      } else {
        state.engineB = { ...engineState }
      }
    })
  },

  applyGlobalState: (globalState) => {
    set((state) => {
      state.global = { ...globalState }
    })
  },

  receiveCC: (cc, value) => {
    const target = CC_TO_TARGET.get(cc)
    if (!target) return

    if (target.type === 'engineParam') {
      const { engine, param } = target
      set((state) => {
        const eng = engine === 'A' ? state.engineA : state.engineB
        if (param === 'mode') {
          eng.modeIndex = Math.floor(value / 8)
          eng.subModeIndex = value % 8
        } else if (param === 'delaySource') {
          const source = DELAY_SOURCE_BY_VALUE[value]
          if (source) eng.delaySource = source
        } else {
          ;(eng as Record<string, unknown>)[param] = value as MidiValue
        }
      })
      get().markDirty()
      return
    }

    if (target.param === 'savePreset') {
      const id = value - 1
      if (id >= 0) {
        set((state) => {
          state.presets[id] = {
            ...state.presets[id],
            engineA: { ...get().engineA },
            engineB: { ...get().engineB },
            global: { ...get().global },
          }
          state.activePresetId = id
          state.dirty = false
        })
      }
      return
    }

    const entry = GLOBAL_CC_HANDLERS[target.param]
    if (entry) {
      set((state) => { entry.handle(state, value) })
      if (entry.marksDirty) get().markDirty()
    }
  },
})
