import type { StateCreator } from 'zustand'
import {
  getStoredHandle,
  pickDirectory,
  queryStoredPermission,
  verifyPermission,
  writePresets,
  readPresets,
  clearStoredHandle,
} from '../lib/storage-service'
import type { StoreState } from './index'

export interface StorageSlice {
  fsDirectoryName: string | null
  fsStatus: 'idle' | 'busy' | 'error'
  fsError: string | null
  fsLastSavedAt: string | null

  initStorage: () => Promise<void>
  chooseSaveFolder: () => Promise<void>
  saveToFolder: () => Promise<void>
  loadFromFolder: () => Promise<void>
  disconnectFolder: () => Promise<void>
  dismissFsError: () => void
}

export const createStorageSlice: StateCreator<
  StoreState,
  [['zustand/immer', never]],
  [],
  StorageSlice
> = (set, get) => ({
  fsDirectoryName: null,
  fsStatus: 'idle',
  fsError: null,
  fsLastSavedAt: null,

  initStorage: async () => {
    const handle = await getStoredHandle()
    if (!handle) return

    const permission = await queryStoredPermission(handle)
    if (permission === 'denied') return

    // 'granted' or 'prompt' — show the folder name either way.
    // User will be re-prompted on the next Save/Load click if needed.
    set((s) => {
      s.fsDirectoryName = handle.name
    })
  },

  chooseSaveFolder: async () => {
    const handle = await pickDirectory()
    if (!handle) return
    set((s) => {
      s.fsDirectoryName = handle.name
      s.fsError = null
    })
  },

  saveToFolder: async () => {
    set((s) => {
      s.fsStatus = 'busy'
      s.fsError = null
    })
    try {
      const handle = await getStoredHandle()
      if (!handle) throw new Error('No folder selected.')
      const granted = await verifyPermission(handle)
      if (!granted) {
        await clearStoredHandle()
        set((s) => {
          s.fsDirectoryName = null
          s.fsStatus = 'idle'
          s.fsError = 'Permission denied. Please choose a folder again.'
        })
        return
      }

      const { presets, activePresetId } = get()
      await writePresets(handle, { presets, activePresetId })

      set((s) => {
        s.fsStatus = 'idle'
        s.fsLastSavedAt = new Date().toISOString()
      })
    } catch (err) {
      set((s) => {
        s.fsStatus = 'error'
        s.fsError = err instanceof Error ? err.message : 'Failed to save.'
      })
    }
  },

  loadFromFolder: async () => {
    set((s) => {
      s.fsStatus = 'busy'
      s.fsError = null
    })
    try {
      const handle = await getStoredHandle()
      if (!handle) throw new Error('No folder selected.')
      const granted = await verifyPermission(handle)
      if (!granted) {
        await clearStoredHandle()
        set((s) => {
          s.fsDirectoryName = null
          s.fsStatus = 'idle'
          s.fsError = 'Permission denied. Please choose a folder again.'
        })
        return
      }

      const result = await readPresets(handle)
      if (!result.ok) {
        set((s) => {
          s.fsStatus = 'error'
          s.fsError = result.error
        })
        return
      }

      get().importAllPresets(result.presets)

      // If the file had an active preset, load it into the live engine state
      if (result.activePresetId !== null) {
        get().loadPreset(result.activePresetId)
      }

      set((s) => {
        s.fsStatus = 'idle'
      })
    } catch (err) {
      set((s) => {
        s.fsStatus = 'error'
        s.fsError = err instanceof Error ? err.message : 'Failed to load.'
      })
    }
  },

  disconnectFolder: async () => {
    await clearStoredHandle()
    set((s) => {
      s.fsDirectoryName = null
      s.fsStatus = 'idle'
      s.fsError = null
      s.fsLastSavedAt = null
    })
  },

  dismissFsError: () => {
    set((s) => {
      s.fsError = null
      if (s.fsStatus === 'error') s.fsStatus = 'idle'
    })
  },
})
