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
  receivePC: (program: number) => void
  savePreset: (id: number) => void
  renamePreset: (id: number, name: string) => void
  copyPreset: (id: number) => void
  pastePreset: (id: number) => void
  importPreset: (id: number, preset: Preset) => void
  importAllPresets: (presets: Preset[]) => void
  markDirty: () => void
}

// Suppress dirty marking during the CC dump that follows a preset load/change (~2s)
let dirtySuppressedUntil = 0

export const createPresetSlice: StateCreator<StoreState, [['zustand/immer', never]], [], PresetSlice> = (set, get) => ({
  presets: Array.from({ length: MAX_PRESETS }, (_, i) => createEmptyPreset(i)),
  activePresetId: null,
  dirty: false,
  clipboardPreset: null,

  loadPreset: (id) => {
    const { midiChannel } = get()

    // Send PC to pedal — it will respond with a full CC dump
    // that flows through receiveCC to update the store.
    midi.sendPC(midiChannel, id + 1)
    dirtySuppressedUntil = Date.now() + 2000

    set((state) => {
      state.activePresetId = id
      state.dirty = false
    })
  },

  receivePC: (program) => {
    const id = program - 1
    if (id < 0 || id >= MAX_PRESETS) return
    dirtySuppressedUntil = Date.now() + 2000
    set((state) => {
      state.activePresetId = id
      state.dirty = false
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
    if (Date.now() < dirtySuppressedUntil) return
    set((state) => {
      state.dirty = true
    })
  },
})
