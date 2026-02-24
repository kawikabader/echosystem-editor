import { useEffect } from 'react'
import { useMidiInit } from './hooks/useMidiPorts'
import { AppShell } from './components/layout/AppShell'
import { ConnectionPanel } from './components/midi/ConnectionPanel'
import { EnginePanel } from './components/engine/EnginePanel'
import { GlobalControls } from './components/globals/GlobalControls'
import { PresetBrowser } from './components/preset/PresetBrowser'
import { useStore } from './store'

const ACCENT_A = '#3b82f6'
const ACCENT_A_DIM = '#1e40af'
const ACCENT_B = '#f59e0b'
const ACCENT_B_DIM = '#92400e'

export default function App() {
  useMidiInit()
  const routing = useStore((s) => s.global.routing)
  const isDual = routing !== 'single'
  const activePresetId = useStore((s) => s.activePresetId)
  const loadPreset = useStore((s) => s.loadPreset)
  const soloEngine = useStore((s) => s.soloEngine)

  useEffect(() => {
    if (activePresetId === null) {
      loadPreset(0)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AppShell
      header={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-bold tracking-wider text-text-primary uppercase">
              Echosystem Editor
            </h1>
          </div>
          <ConnectionPanel />
        </div>
      }
      sidebar={<PresetBrowser />}
      main={
        <div className={`grid grid-cols-1 ${isDual ? 'lg:grid-cols-2' : ''} gap-4 max-w-5xl mx-auto`}>
          <div className={`transition-opacity ${soloEngine === 'B' ? 'opacity-40' : ''}`}>
            <EnginePanel engine="A" accent={ACCENT_A} accentDim={ACCENT_A_DIM} />
          </div>
          {isDual && (
            <div className={`transition-opacity ${soloEngine === 'A' ? 'opacity-40' : ''}`}>
              <EnginePanel engine="B" accent={ACCENT_B} accentDim={ACCENT_B_DIM} />
            </div>
          )}

          <div className="lg:hidden col-span-1">
            <div className="rounded-lg border border-border bg-surface p-4">
              <GlobalControls />
            </div>
          </div>
        </div>
      }
      controls={<GlobalControls />}
    />
  )
}
