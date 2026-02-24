import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react'
import { getEntries, subscribe, clearLog } from '../../lib/midi-log'
import type { MidiLogEntry } from '../../lib/midi-log'

function formatTime(ts: number): string {
  const d = new Date(ts)
  return d.toLocaleTimeString('en-US', { hour12: false }) + '.' + String(d.getMilliseconds()).padStart(3, '0')
}

const CC_LABELS: Record<number, string> = {
  10: 'Expression',
  11: 'Load Preset',
  35: 'Tap',
  36: 'Scroll',
  37: 'Bypass',
  38: 'Shift',
  39: 'Save Preset',
  40: 'Engine Order',
  41: 'Solo A',
  42: 'Solo B',
  51: 'Clock A',
  52: 'Clock B',
  60: 'Engage/Bypass',
  100: 'A Mode',
  101: 'A Ratio',
  102: 'A Mix',
  103: 'A Volume',
  104: 'A Feedback',
  105: 'A Tone',
  106: 'A Thing1',
  107: 'A Thing2',
  108: 'A Delay Src',
  109: 'B Mode',
  110: 'B Ratio',
  111: 'B Mix',
  112: 'B Volume',
  113: 'B Feedback',
  114: 'B Tone',
  115: 'B Thing1',
  116: 'B Thing2',
  117: 'B Delay Src',
  118: 'Routing',
}

function formatEntry(entry: MidiLogEntry): string {
  if (entry.type === 'PC') {
    return `PC  ch${entry.channel}  program=${entry.value}`
  }
  const label = entry.cc !== undefined ? CC_LABELS[entry.cc] : undefined
  return `CC  ch${entry.channel}  cc=${entry.cc}  val=${entry.value}${label ? `  (${label})` : ''}`
}

export function MidiLog({ onClose }: { onClose: () => void }) {
  const entries = useSyncExternalStore(subscribe, getEntries)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [entries.length])

  const handleClear = useCallback(() => clearLog(), [])

  return (
    <div className="border-t border-border bg-[#0d0d0d] flex flex-col" style={{ height: 200 }}>
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border shrink-0">
        <span className="text-xs lg:text-[10px] text-text-muted uppercase tracking-wider font-medium">
          MIDI Log
        </span>
        <div className="flex gap-2">
          <button
            onClick={handleClear}
            className="text-xs lg:text-[10px] text-text-muted hover:text-text-secondary transition-colors"
          >
            Clear
          </button>
          <button
            onClick={onClose}
            className="text-xs lg:text-[10px] text-text-muted hover:text-text-secondary transition-colors"
          >
            Close
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto font-mono text-sm lg:text-[11px] leading-5 px-3 py-1">
        {entries.length === 0 && (
          <p className="text-text-muted py-2">No messages yet.</p>
        )}
        {entries.map((entry, i) => (
          <div key={i} className="flex gap-3">
            <span className="text-text-muted shrink-0">{formatTime(entry.timestamp)}</span>
            <span className={entry.type === 'PC' ? 'text-success' : 'text-text-secondary'}>
              {formatEntry(entry)}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
