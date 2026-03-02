import type { StateCreator } from 'zustand'
import { DEFAULT_MIDI_CHANNEL } from '../lib/midi-constants'
import * as midi from '../lib/midi-service'
import type { StoreState } from './index'

export interface MidiSlice {
  midiChannel: number
  selectedPortId: string | null
  selectedPortName: string | null
  lastPortName: string | null
  connected: boolean
  availableOutputs: Array<{ id: string; name: string }>
  midiSupported: boolean

  initMidi: () => Promise<void>
  selectPort: (portId: string) => void
  setMidiChannel: (channel: number) => void
  refreshPorts: () => void
}

export const createMidiSlice: StateCreator<StoreState, [['zustand/immer', never]], [], MidiSlice> = (set, get) => ({
  midiChannel: DEFAULT_MIDI_CHANNEL,
  selectedPortId: null,
  selectedPortName: null,
  lastPortName: null,
  connected: false,
  availableOutputs: [],
  midiSupported: typeof navigator !== 'undefined' && 'requestMIDIAccess' in navigator,

  initMidi: async () => {
    if (!get().midiSupported) return

    try {
      await midi.requestAccess()

      midi.onStateChange(() => {
        get().refreshPorts()
      })

      const outputs = midi.getOutputs().map((o) => ({
        id: o.id,
        name: o.name ?? 'Unknown Device',
      }))

      set((state) => {
        state.availableOutputs = outputs
      })

      // Register incoming CC handler → routes to store's receiveCC
      midi.setIncomingCCHandler((channel, cc, value) => {
        const { midiChannel, receiveCC } = get()
        if (channel !== midiChannel) return
        receiveCC(cc, value)
      })

      // Register incoming PC handler → updates activePresetId
      // Pedal echoes PC on channels above its own, so accept from any channel.
      midi.setIncomingPCHandler((_channel, program) => {
        get().receivePC(program)
      })

      const { lastPortName } = get()
      const autoPort = midi.autoDetectOutput(lastPortName ?? 'USB Uno MIDI Interface')
      if (autoPort) {
        midi.selectOutput(autoPort)
        const autoInput = midi.autoDetectInput(autoPort.name ?? '')
        if (autoInput) midi.selectInput(autoInput)
        set((state) => {
          state.selectedPortId = autoPort.id
          state.selectedPortName = autoPort.name ?? 'Unknown Device'
          state.connected = true
        })

        // After handshake completes (~6s for Identity Request cycle),
        // send a PC to trigger a full parameter dump from the pedal.
        const { activePresetId } = get()
        if (activePresetId != null) {
          setTimeout(() => {
            const ch = get().midiChannel
            midi.sendPC(ch, activePresetId + 1)
          }, 6000)
        }
      }
    } catch {
      set((state) => {
        state.midiSupported = false
      })
    }
  },

  selectPort: (portId) => {
    const outputs = midi.getOutputs()
    const port = outputs.find((o) => o.id === portId) ?? null
    midi.selectOutput(port)

    const input = port ? midi.autoDetectInput(port.name ?? '') : null
    midi.selectInput(input)

    if (input) {
      midi.setIncomingCCHandler((channel, cc, value) => {
        const { midiChannel, receiveCC } = get()
        if (channel !== midiChannel) return
        receiveCC(cc, value)
      })
      midi.setIncomingPCHandler((_channel, program) => {
        get().receivePC(program)
      })
    } else {
      midi.setIncomingCCHandler(null)
      midi.setIncomingPCHandler(null)
    }

    set((state) => {
      state.selectedPortId = port?.id ?? null
      state.selectedPortName = port?.name ?? null
      state.lastPortName = port?.name ?? null
      state.connected = port !== null
    })
  },

  setMidiChannel: (channel) => {
    set((state) => {
      state.midiChannel = Math.max(1, Math.min(16, channel))
    })
  },

  refreshPorts: () => {
    const outputs = midi.getOutputs().map((o) => ({
      id: o.id,
      name: o.name ?? 'Unknown Device',
    }))

    set((state) => {
      state.availableOutputs = outputs

      if (state.selectedPortId) {
        const stillExists = outputs.some((o) => o.id === state.selectedPortId)
        if (!stillExists) {
          midi.selectOutput(null)
          midi.selectInput(null)
          state.selectedPortId = null
          state.selectedPortName = null
          state.connected = false
        }
      }
    })
  },
})
