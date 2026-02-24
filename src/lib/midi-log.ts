export interface MidiLogEntry {
  timestamp: number
  type: 'CC' | 'PC'
  channel: number
  cc?: number | undefined
  value: number
}

type Listener = () => void

const MAX_ENTRIES = 500
let entries: MidiLogEntry[] = []
let listeners: Set<Listener> = new Set()

export function logCC(channel: number, cc: number, value: number) {
  entries = [...entries, { timestamp: Date.now(), type: 'CC', channel, cc, value }]
  if (entries.length > MAX_ENTRIES) entries = entries.slice(-MAX_ENTRIES)
  notify()
}

export function logPC(channel: number, value: number) {
  entries = [...entries, { timestamp: Date.now(), type: 'PC', channel, value }]
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
