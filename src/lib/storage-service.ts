import type { MidiValue } from './midi-types'
import type { Preset, EngineState, GlobalState, DelaySource, Routing } from './echosystem/types'
import { MAX_PRESETS } from './midi-constants'

const PRESET_FILENAME = 'echosystem-presets.json' as const
const DB_NAME = 'echosystem-editor'
const DB_VERSION = 1
const STORE_NAME = 'handles'
const HANDLE_KEY = 'directoryHandle'
const MAX_FILE_SIZE = 1_024 * 1_024 // 1 MB

const VALID_DELAY_SOURCES: DelaySource[] = ['global', 'local', 'knob']
const VALID_ROUTINGS: Routing[] = ['single', 'parallel', 'serial', 'leftRight']

let dbPromise: Promise<IDBDatabase> | null = null
let saveChain = Promise.resolve()

// ---------------------------------------------------------------------------
// Feature detection
// ---------------------------------------------------------------------------

export function isFileSystemAccessSupported(): boolean {
  return 'showDirectoryPicker' in window
}

// ---------------------------------------------------------------------------
// IndexedDB handle storage
// ---------------------------------------------------------------------------

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise
  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }

    request.onsuccess = () => {
      const db = request.result
      db.onversionchange = () => {
        db.close()
        dbPromise = null
      }
      resolve(db)
    }

    request.onerror = () => {
      dbPromise = null
      reject(request.error)
    }
  })
  return dbPromise
}

async function storeHandle(handle: FileSystemDirectoryHandle): Promise<void> {
  const db = await openDB()
  const tx = db.transaction(STORE_NAME, 'readwrite')
  tx.objectStore(STORE_NAME).put(handle, HANDLE_KEY)
}

async function loadHandle(): Promise<FileSystemDirectoryHandle | null> {
  try {
    const db = await openDB()
    return await new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const req = tx.objectStore(STORE_NAME).get(HANDLE_KEY)
      req.onsuccess = () => resolve(req.result ?? null)
      req.onerror = () => resolve(null)
    })
  } catch {
    return null
  }
}

async function deleteHandle(): Promise<void> {
  try {
    const db = await openDB()
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).delete(HANDLE_KEY)
  } catch {
    // silently ignore
  }
}

// ---------------------------------------------------------------------------
// Directory picker & permissions
// ---------------------------------------------------------------------------

export async function pickDirectory(): Promise<FileSystemDirectoryHandle | null> {
  try {
    const handle = await window.showDirectoryPicker({
      id: 'echosystem-presets',
      mode: 'readwrite',
      startIn: 'documents',
    })
    await storeHandle(handle)
    return handle
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') return null
    throw err
  }
}

export async function getStoredHandle(): Promise<FileSystemDirectoryHandle | null> {
  return loadHandle()
}

export async function queryStoredPermission(
  handle: FileSystemDirectoryHandle,
): Promise<PermissionState> {
  return handle.queryPermission({ mode: 'readwrite' })
}

export async function verifyPermission(
  handle: FileSystemDirectoryHandle,
): Promise<boolean> {
  const status = await handle.queryPermission({ mode: 'readwrite' })
  if (status === 'granted') return true
  const result = await handle.requestPermission({ mode: 'readwrite' })
  return result === 'granted'
}

export async function clearStoredHandle(): Promise<void> {
  await deleteHandle()
}

// ---------------------------------------------------------------------------
// File read / write
// ---------------------------------------------------------------------------

interface PresetFile {
  version: number
  app: string
  savedAt: string
  activePresetId: number | null
  presets: Preset[]
}

export async function writePresets(
  handle: FileSystemDirectoryHandle,
  data: { presets: Preset[]; activePresetId: number | null },
): Promise<void> {
  // Serialize through save chain to prevent double-click corruption
  saveChain = saveChain.then(async () => {
    const fileHandle = await handle.getFileHandle(PRESET_FILENAME, { create: true })
    const writable = await fileHandle.createWritable()
    try {
      const payload: PresetFile = {
        version: 1,
        app: 'echosystem-editor',
        savedAt: new Date().toISOString(),
        activePresetId: data.activePresetId,
        presets: data.presets,
      }
      await writable.write(JSON.stringify(payload, null, 2))
      await writable.close()
    } catch (err) {
      await writable.abort()
      throw err
    }
  })
  await saveChain
}

export type ReadResult =
  | { ok: true; presets: Preset[]; activePresetId: number | null }
  | { ok: false; error: string }

export async function readPresets(
  handle: FileSystemDirectoryHandle,
): Promise<ReadResult> {
  let fileHandle: FileSystemFileHandle
  try {
    fileHandle = await handle.getFileHandle(PRESET_FILENAME)
  } catch {
    return { ok: false, error: `File "${PRESET_FILENAME}" not found in the selected folder.` }
  }

  const file = await fileHandle.getFile()
  if (file.size > MAX_FILE_SIZE) {
    return { ok: false, error: 'File too large (max 1 MB).' }
  }

  const text = await file.text()
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    return { ok: false, error: 'File is not valid JSON.' }
  }

  return validatePresetFile(parsed)
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function clampMidi(value: unknown): MidiValue | null {
  if (typeof value !== 'number' || !Number.isInteger(value)) return null
  return Math.max(0, Math.min(127, value)) as MidiValue
}

function validateEngine(raw: unknown): EngineState | null {
  if (typeof raw !== 'object' || raw === null) return null
  const obj = raw as Record<string, unknown>

  const modeIndex = typeof obj.modeIndex === 'number' && Number.isInteger(obj.modeIndex)
    ? Math.max(0, Math.min(11, obj.modeIndex))
    : null
  const subModeIndex = typeof obj.subModeIndex === 'number' && Number.isInteger(obj.subModeIndex)
    ? Math.max(0, Math.min(7, obj.subModeIndex))
    : null
  const delaySource = VALID_DELAY_SOURCES.includes(obj.delaySource as DelaySource)
    ? (obj.delaySource as DelaySource)
    : null

  const ratio = clampMidi(obj.ratio)
  const mix = clampMidi(obj.mix)
  const volume = clampMidi(obj.volume)
  const feedback = clampMidi(obj.feedback)
  const tone = clampMidi(obj.tone)
  const thing1 = clampMidi(obj.thing1)
  const thing2 = clampMidi(obj.thing2)

  if (
    modeIndex === null || subModeIndex === null || delaySource === null ||
    ratio === null || mix === null || volume === null || feedback === null ||
    tone === null || thing1 === null || thing2 === null
  ) {
    return null
  }

  return { modeIndex, subModeIndex, ratio, mix, volume, feedback, tone, thing1, thing2, delaySource }
}

function validatePresetFile(parsed: unknown): ReadResult {
  if (typeof parsed !== 'object' || parsed === null) {
    return { ok: false, error: 'Invalid file structure.' }
  }

  const file = parsed as Record<string, unknown>

  if (file.app !== 'echosystem-editor') {
    return { ok: false, error: 'Not an Echosystem Editor file.' }
  }
  if (typeof file.version !== 'number' || file.version < 1) {
    return { ok: false, error: 'Unsupported file version.' }
  }
  if (!Array.isArray(file.presets) || file.presets.length > MAX_PRESETS) {
    return { ok: false, error: `Expected an array of up to ${MAX_PRESETS} presets.` }
  }

  const activePresetId =
    typeof file.activePresetId === 'number' &&
    Number.isInteger(file.activePresetId) &&
    file.activePresetId >= 0 &&
    file.activePresetId < MAX_PRESETS
      ? file.activePresetId
      : null

  const presets: Preset[] = []

  for (const raw of file.presets) {
    if (typeof raw !== 'object' || raw === null) {
      return { ok: false, error: 'Invalid preset entry.' }
    }

    const entry = raw as Record<string, unknown>
    const id = typeof entry.id === 'number' && Number.isInteger(entry.id) ? entry.id : presets.length
    const name = typeof entry.name === 'string' ? entry.name.slice(0, 100) : `Preset ${id + 1}`

    const engineA = validateEngine(entry.engineA)
    const engineB = validateEngine(entry.engineB)

    if (!engineA || !engineB) {
      return { ok: false, error: `Invalid engine data in preset "${name}".` }
    }

    // Validate global
    const g = entry.global
    if (typeof g !== 'object' || g === null) {
      return { ok: false, error: `Invalid global data in preset "${name}".` }
    }
    const gObj = g as Record<string, unknown>
    const routing = VALID_ROUTINGS.includes(gObj.routing as Routing)
      ? (gObj.routing as Routing)
      : null
    const bypassed = typeof gObj.bypassed === 'boolean' ? gObj.bypassed : false
    const tempo = clampMidi(gObj.tempo)

    if (!routing || tempo === null) {
      return { ok: false, error: `Invalid global data in preset "${name}".` }
    }

    const global: GlobalState = { routing, bypassed, tempo }

    presets.push({ id, name, engineA, engineB, global })
  }

  return { ok: true, presets, activePresetId }
}
