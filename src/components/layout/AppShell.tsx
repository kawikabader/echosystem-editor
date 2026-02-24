import { type ReactNode, useState, useCallback } from 'react'
import { MidiLog } from '../midi/MidiLog'

interface AppShellProps {
  header: ReactNode
  sidebar: ReactNode
  main: ReactNode
  controls: ReactNode
}

export function AppShell({ header, sidebar, main, controls }: AppShellProps) {
  const [showLog, setShowLog] = useState(false)
  const toggleLog = useCallback(() => setShowLog((v) => !v), [])
  const closeLog = useCallback(() => setShowLog(false), [])

  return (
    <div className="h-screen bg-[#121212] flex flex-col overflow-hidden">
      <header className="shrink-0 border-b border-border px-4 py-2 flex items-center justify-between">
        <div className="flex-1">{header}</div>
        <button
          onClick={toggleLog}
          className={`ml-3 px-2 py-1 rounded text-[10px] font-medium uppercase tracking-wider border transition-colors ${
            showLog
              ? 'bg-accent/20 text-accent border-accent/40'
              : 'bg-surface-hover text-text-muted border-border hover:text-text-secondary'
          }`}
        >
          Log
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-64 shrink-0 border-r border-border overflow-y-auto hidden lg:flex flex-col">
          {sidebar}
        </aside>

        <div className="flex-1 flex flex-col overflow-hidden relative">
          <main className="flex-1 overflow-y-auto p-4">
            {main}
          </main>
          {showLog && (
            <div className="shrink-0">
              <MidiLog onClose={closeLog} />
            </div>
          )}
        </div>

        <aside className="w-48 shrink-0 border-l border-border p-4 overflow-y-auto hidden xl:block">
          {controls}
        </aside>
      </div>
    </div>
  )
}
