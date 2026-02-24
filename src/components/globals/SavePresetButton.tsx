import { useStore } from '../../store'
import { GLOBAL_TIPS } from '../../lib/tooltips'
import { Tooltip } from '../ui/Tooltip'

export function SavePresetButton() {
  const activePresetId = useStore((s) => s.activePresetId)
  const dirty = useStore((s) => s.dirty)
  const savePreset = useStore((s) => s.savePreset)

  if (activePresetId === null) return null

  return (
    <Tooltip text={GLOBAL_TIPS.save}>
      <button
        onClick={() => savePreset(activePresetId)}
        className={`w-full px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
          dirty
            ? 'bg-warning text-black hover:bg-warning/90'
            : 'bg-surface-hover text-text-secondary hover:bg-surface-active hover:text-text-primary'
        }`}
      >
        Save Preset {String(activePresetId + 1).padStart(2, '0')} to Pedal
      </button>
    </Tooltip>
  )
}
