export type MidiLogEntry =
  | {
      timestamp: number
      type: 'CC'
      direction: 'out' | 'in'
      channel: number
      cc: number
      value: number
    }
  | {
      timestamp: number
      type: 'PC'
      direction: 'out' | 'in'
      channel: number
      value: number
    }
  | {
      timestamp: number
      type: 'SysEx'
      direction: 'out' | 'in'
      message: string
    }

type Listener = () => void

const MAX_ENTRIES = 500
let entries: MidiLogEntry[] = []
let listeners: Set<Listener> = new Set()

export function logCC(channel: number, cc: number, value: number, direction: 'out' | 'in' = 'out') {
  entries = [...entries, { timestamp: Date.now(), type: 'CC', direction, channel, cc, value }]
  if (entries.length > MAX_ENTRIES) entries = entries.slice(-MAX_ENTRIES)
  notify()
}

export function logPC(channel: number, value: number, direction: 'out' | 'in' = 'out') {
  entries = [...entries, { timestamp: Date.now(), type: 'PC', direction, channel, value }]
  if (entries.length > MAX_ENTRIES) entries = entries.slice(-MAX_ENTRIES)
  notify()
}

export function logSysEx(message: string, direction: 'out' | 'in' = 'in') {
  entries = [...entries, { timestamp: Date.now(), type: 'SysEx', direction, message }]
  if (entries.length > MAX_ENTRIES) entries = entries.slice(-MAX_ENTRIES)
  notify()
}

export function getEntries(): readonly MidiLogEntry[] {
  return entries
}

export function clearLog() {
  entries = [] as MidiLogEntry[]
  notify()
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function notify() {
  listeners.forEach((l) => l())
}
