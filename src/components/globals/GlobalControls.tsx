import { useCallback } from 'react'
import { useStore } from '../../store'
import { GLOBAL_CC } from '../../lib/midi-constants'
import { GLOBAL_TIPS } from '../../lib/tooltips'
import * as midi from '../../lib/midi-service'
import { Tooltip } from '../ui/Tooltip'
import { RoutingSelector } from './RoutingSelector'
import { BypassToggle } from './BypassToggle'
import { TapTempo } from './TapTempo'
import { MidiClockToggles } from './MidiClockToggles'
import { SyncButton } from './SyncButton'
import { SavePresetButton } from './SavePresetButton'

export function GlobalControls() {
  const midiChannel = useStore((s) => s.midiChannel)
  const isDual = useStore((s) => s.global.routing !== 'single')

  const markDirty = useStore((s) => s.markDirty)

  const handleEngineOrder = useCallback(() => {
    midi.sendCC(midiChannel, GLOBAL_CC.engineOrder, 64)
    markDirty()
  }, [midiChannel, markDirty])

  const soloEngine = useStore((s) => s.soloEngine)
  const setSoloEngine = useStore((s) => s.setSoloEngine)

  const toggleSoloA = useCallback(() => setSoloEngine('A'), [setSoloEngine])
  const toggleSoloB = useCallback(() => setSoloEngine('B'), [setSoloEngine])

  return (
    <div className="space-y-5">
      <BypassToggle />
      <RoutingSelector />
      <TapTempo />

      {isDual && (
        <>
          <div className="space-y-1.5">
            <label className="text-[10px] text-text-muted uppercase tracking-wider font-medium">
              Engine Order
            </label>
            <Tooltip text={GLOBAL_TIPS.engineOrder}>
              <button
                onClick={handleEngineOrder}
                className="w-full px-3 py-1.5 rounded text-xs bg-surface-hover text-text-secondary border border-border hover:bg-surface-active hover:text-text-primary transition-colors"
              >
                Swap A/B
              </button>
            </Tooltip>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-text-muted uppercase tracking-wider font-medium">
              Solo
            </label>
            <div className="grid grid-cols-2 gap-1">
              <Tooltip text={GLOBAL_TIPS.soloA}>
                <button
                  onClick={toggleSoloA}
                  className={`w-full px-2 py-1.5 rounded text-xs border transition-colors ${
                    soloEngine === 'A'
                      ? 'bg-engine-a text-white border-engine-a'
                      : 'bg-surface-hover text-engine-a border-border hover:bg-engine-a/10'
                  }`}
                >
                  Solo A
                </button>
              </Tooltip>
              <Tooltip text={GLOBAL_TIPS.soloB}>
                <button
                  onClick={toggleSoloB}
                  className={`w-full px-2 py-1.5 rounded text-xs border transition-colors ${
                    soloEngine === 'B'
                      ? 'bg-engine-b text-white border-engine-b'
                      : 'bg-surface-hover text-engine-b border-border hover:bg-engine-b/10'
                  }`}
                >
                  Solo B
                </button>
              </Tooltip>
            </div>
          </div>
        </>
      )}

      <MidiClockToggles />
      <SyncButton />
      <SavePresetButton />
    </div>
  )
}
