import { type ReactNode, useState, useCallback, useRef } from 'react'
import { Drawer } from 'vaul'
import { MidiLog } from '../midi/MidiLog'
import { MobileTabBar } from '../mobile/MobileTabBar'
import { PresetDrawer } from '../mobile/PresetDrawer'
import { SyncButton } from '../globals/SyncButton'
import { SavePresetButton } from '../globals/SavePresetButton'

interface AppShellProps {
  header: ReactNode
  sidebar: ReactNode
  main: ReactNode
  controls: ReactNode
}

export function AppShell({ header, sidebar, main, controls }: AppShellProps) {
  const [showLog, setShowLog] = useState(false)
  const [presetsOpen, setPresetsOpen] = useState(false)
  const mainRef = useRef<HTMLElement>(null)
  const toggleLog = useCallback(() => setShowLog((v) => !v), [])
  const closeLog = useCallback(() => setShowLog(false), [])

  const handleScrollTo = useCallback((section: 'engineA' | 'engineB' | 'controls') => {
    const el = mainRef.current?.querySelector(`[data-section="${section}"]`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  return (
    <div className="h-dvh bg-[#121212] flex flex-col overflow-hidden">
      <header className="shrink-0 border-b border-border px-4 py-2 flex items-center justify-between">
        <div className="flex-1 min-w-0">{header}</div>
        <button
          onClick={toggleLog}
          className={`ml-3 px-2 py-1 rounded text-xs lg:text-[10px] font-medium uppercase tracking-wider border transition-colors ${
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

        <div className="flex-1 flex flex-col overflow-hidden">
          <main ref={mainRef} className="flex-1 overflow-y-auto p-4">
            {main}
          </main>

          {showLog && (
            <div className="shrink-0 hidden lg:block">
              <MidiLog onClose={closeLog} />
            </div>
          )}

          <div className="shrink-0 border-t border-border bg-[#1a1a1a] px-4 py-2 flex gap-2 lg:hidden">
            <div className="flex-1"><SyncButton /></div>
            <div className="flex-1"><SavePresetButton /></div>
          </div>
        </div>

        <aside className="w-48 shrink-0 border-l border-border p-4 overflow-y-auto hidden xl:block">
          {controls}
        </aside>
      </div>

      <MobileTabBar onPresetsOpen={() => setPresetsOpen(true)} onScrollTo={handleScrollTo} />
      <PresetDrawer open={presetsOpen} onOpenChange={setPresetsOpen} />

      {showLog && (
        <Drawer.Root open={showLog} onOpenChange={setShowLog}>
          <Drawer.Portal>
            <Drawer.Overlay className="fixed inset-0 bg-black/50 z-[100] lg:hidden" />
            <Drawer.Content className="fixed bottom-0 inset-x-0 z-[101] flex flex-col rounded-t-2xl bg-[#0d0d0d] border-t border-white/10 outline-none lg:hidden" style={{ height: '50vh' }}>
              <Drawer.Handle className="mx-auto mt-3 mb-1 h-1.5 w-10 rounded-full bg-white/20" />
              <Drawer.Title className="sr-only">MIDI Log</Drawer.Title>
              <MidiLog onClose={closeLog} />
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      )}
    </div>
  )
}
