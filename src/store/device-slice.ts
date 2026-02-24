import type { StateCreator } from 'zustand'
import type { MidiValue } from '../lib/midi-types'
import type { EngineState, GlobalState, TunableParam, Routing, DelaySource, EngineId } from '../lib/echosystem'
import { createDefaultEngine, delaySourceToMidi } from '../lib/echosystem'
import { computeModeCC } from '../lib/echosystem'
import { ENGINE_CC, GLOBAL_CC } from '../lib/midi-constants'
import { ROUTING_VALUES, DELAY_SOURCE_VALUES } from '../lib/echosystem/types'
import * as midi from '../lib/midi-service'
import type { StoreState } from './index'

export interface DeviceSlice {
  engineA: EngineState
  engineB: EngineState
  global: GlobalState
  soloEngine: EngineId | null
  syncing: boolean

  setEngineParam: (engine: EngineId, param: TunableParam, value: MidiValue) => void
  setEngineMode: (engine: EngineId, modeIndex: number, subModeIndex: number) => void
  setDelaySource: (engine: EngineId, source: DelaySource) => void
  setRouting: (routing: Routing) => void
  toggleBypass: () => void
  setBypass: (bypassed: boolean) => void
  setSoloEngine: (engine: EngineId | null) => void
  sendFullState: () => void
  applyEngineState: (engine: EngineId, state: EngineState) => void
  applyGlobalState: (state: GlobalState) => void
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
  syncing: false,

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
    midi.sendCC(ch, cc, delaySourceToMidi(source))

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

  setBypass: (bypassed) => {
    const ch = get().midiChannel
    midi.sendCC(ch, GLOBAL_CC.engageBypass, bypassed ? 0 : 127)

    set((state) => {
      state.global.bypassed = bypassed
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

  sendFullState: () => {
    if (get().syncing) return
    const { engineA, engineB, global: g, midiChannel: ch } = get()

    const messages: Array<{ cc: number; value: number }> = []

    for (const [engine, state] of [['A', engineA], ['B', engineB]] as const) {
      const ccMap = ENGINE_CC[engine]
      messages.push({ cc: ccMap.mode, value: computeModeCC(state.modeIndex, state.subModeIndex) })
      messages.push({ cc: ccMap.ratio, value: state.ratio as number })
      messages.push({ cc: ccMap.mix, value: state.mix as number })
      messages.push({ cc: ccMap.volume, value: state.volume as number })
      messages.push({ cc: ccMap.feedback, value: state.feedback as number })
      messages.push({ cc: ccMap.tone, value: state.tone as number })
      messages.push({ cc: ccMap.thing1, value: state.thing1 as number })
      messages.push({ cc: ccMap.thing2, value: state.thing2 as number })
      messages.push({ cc: ccMap.delaySource, value: DELAY_SOURCE_VALUES[state.delaySource] })
    }

    messages.push({ cc: GLOBAL_CC.routing, value: ROUTING_VALUES[g.routing] })
    messages.push({ cc: GLOBAL_CC.engageBypass, value: g.bypassed ? 0 : 127 })

    const spacingMs = 20
    set((state) => { state.syncing = true })
    midi.sendBulkCC(ch, messages, spacingMs)
    setTimeout(() => {
      set((state) => { state.syncing = false })
    }, messages.length * spacingMs + 50)
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
})
