import { create } from 'zustand'
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { DeviceSlice } from './device-slice'
import type { MidiSlice } from './midi-slice'
import type { PresetSlice } from './preset-slice'
import { createDeviceSlice } from './device-slice'
import { createMidiSlice } from './midi-slice'
import { createPresetSlice } from './preset-slice'

export type StoreState = DeviceSlice & MidiSlice & PresetSlice

export const useStore = create<StoreState>()(
  devtools(
    persist(
      subscribeWithSelector(
        immer((...a) => ({
          ...createDeviceSlice(...a),
          ...createMidiSlice(...a),
          ...createPresetSlice(...a),
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
        }),
      },
    ),
    { name: 'EchosystemStore' },
  ),
)
