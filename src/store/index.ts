import { create } from 'zustand'
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { DeviceSlice } from './device-slice'
import type { MidiSlice } from './midi-slice'
import type { PresetSlice } from './preset-slice'
import type { StorageSlice } from './storage-slice'
import { createDeviceSlice } from './device-slice'
import { createMidiSlice } from './midi-slice'
import { createPresetSlice } from './preset-slice'
import { createStorageSlice } from './storage-slice'

export type StoreState = DeviceSlice & MidiSlice & PresetSlice & StorageSlice

export const useStore = create<StoreState>()(
  devtools(
    persist(
      subscribeWithSelector(
        immer((...a) => ({
          ...createDeviceSlice(...a),
          ...createMidiSlice(...a),
          ...createPresetSlice(...a),
          ...createStorageSlice(...a),
        })),
      ),
      {
        name: 'echosystem-editor',
        version: 1,
        partialize: (state) => ({
          presets: state.presets,
          activePresetId: state.activePresetId,
          dirty: state.dirty,
          engineA: state.engineA,
          engineB: state.engineB,
          global: state.global,
          lastPortName: state.lastPortName,
          midiChannel: state.midiChannel,
          bpm: state.bpm,
        }),
      },
    ),
    { name: 'EchosystemStore' },
  ),
)
