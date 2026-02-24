import type { StateCreator } from 'zustand'
import type { MidiValue } from '../lib/midi-types'
import type { Preset } from '../lib/echosystem'
import { createDefaultEngine } from '../lib/echosystem'
import { MAX_PRESETS } from '../lib/midi-constants'
import * as midi from '../lib/midi-service'
import type { StoreState } from './index'

function createEmptyPreset(id: number): Preset {
  return {
    id,
    name: `Preset ${id + 1}`,
    engineA: createDefaultEngine(),
    engineB: createDefaultEngine(),
    global: {
      routing: 'single',
      bypassed: false,
      tempo: 64 as MidiValue,
    },
  }
}

export interface PresetSlice {
  presets: Preset[]
  activePresetId: number | null
  dirty: boolean
  clipboardPreset: Preset | null

  loadPreset: (id: number) => void
  savePreset: (id: number) => void
  renamePreset: (id: number, name: string) => void
  copyPreset: (id: number) => void
  pastePreset: (id: number) => void
  importPreset: (id: number, preset: Preset) => void
  importAllPresets: (presets: Preset[]) => void
  markDirty: () => void
}

export const createPresetSlice: StateCreator<StoreState, [['zustand/immer', never]], [], PresetSlice> = (set, get) => ({
  presets: Array.from({ length: MAX_PRESETS }, (_, i) => createEmptyPreset(i)),
  activePresetId: null,
  dirty: false,
  clipboardPreset: null,

  loadPreset: (id) => {
    const { presets, midiChannel } = get()
    const preset = presets[id]
    if (!preset) return

    midi.sendPC(midiChannel, id + 1)

    set((state) => {
      state.activePresetId = id
      state.dirty = false
      state.engineA = { ...preset.engineA }
      state.engineB = { ...preset.engineB }
      state.global = { ...preset.global }
    })
  },

  savePreset: (id) => {
    const { engineA, engineB, global: g, midiChannel } = get()

    midi.sendCC(midiChannel, 39, id + 1)

    set((state) => {
      state.presets[id] = {
        ...state.presets[id],
        engineA: { ...engineA },
        engineB: { ...engineB },
        global: { ...g },
      }
      state.activePresetId = id
      state.dirty = false
    })
  },

  renamePreset: (id, name) => {
    set((state) => {
      state.presets[id].name = name
    })
  },

  copyPreset: (id) => {
    const preset = get().presets[id]
    if (!preset) return
    set((state) => {
      state.clipboardPreset = {
        ...preset,
        engineA: { ...preset.engineA },
        engineB: { ...preset.engineB },
        global: { ...preset.global },
      }
    })
  },

  pastePreset: (id) => {
    const { clipboardPreset } = get()
    if (!clipboardPreset) return
    set((state) => {
      state.presets[id] = {
        id,
        name: clipboardPreset.name + ' (copy)',
        engineA: { ...clipboardPreset.engineA },
        engineB: { ...clipboardPreset.engineB },
        global: { ...clipboardPreset.global },
      }
    })
  },

  importPreset: (id, preset) => {
    set((state) => {
      state.presets[id] = { ...preset, id }
    })
  },

  importAllPresets: (presets) => {
    set((state) => {
      presets.forEach((p, i) => {
        if (i < MAX_PRESETS) {
          state.presets[i] = { ...p, id: i }
        }
      })
    })
  },

  markDirty: () => {
    set((state) => {
      state.dirty = true
    })
  },
})
