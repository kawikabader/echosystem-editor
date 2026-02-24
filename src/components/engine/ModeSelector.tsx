import { useCallback } from 'react'
import { MODE_DEFINITIONS } from '../../lib/echosystem'
import type { EngineId } from '../../lib/midi-constants'
import { MODE_CATEGORY_TIPS, SUB_MODE_TIPS } from '../../lib/tooltips'
import { useStore } from '../../store'
import { Tooltip } from '../ui/Tooltip'

interface ModeSelectorProps {
  engine: EngineId
  accent: string
}

export function ModeSelector({ engine, accent }: ModeSelectorProps) {
  const modeIndex = useStore((s) =>
    engine === 'A' ? s.engineA.modeIndex : s.engineB.modeIndex,
  )
  const subModeIndex = useStore((s) =>
    engine === 'A' ? s.engineA.subModeIndex : s.engineB.subModeIndex,
  )
  const setEngineMode = useStore((s) => s.setEngineMode)

  const currentMode = MODE_DEFINITIONS.find((m) => m.index === modeIndex)

  const handleCategoryChange = useCallback(
    (newModeIndex: number) => {
      setEngineMode(engine, newModeIndex, 0)
    },
    [engine, setEngineMode],
  )

  const handleSubModeChange = useCallback(
    (newSubModeIndex: number) => {
      setEngineMode(engine, modeIndex, newSubModeIndex)
    },
    [engine, modeIndex, setEngineMode],
  )

  return (
    <div className="space-y-2">
      <div className="flex gap-1 flex-wrap">
        {MODE_DEFINITIONS.map((mode) => (
          <Tooltip key={mode.index} text={MODE_CATEGORY_TIPS[mode.name] ?? mode.name}>
            <button
              onClick={() => handleCategoryChange(mode.index)}
              className={`px-3 py-2 lg:px-2 lg:py-1 text-xs lg:text-[11px] rounded font-medium transition-colors ${
                mode.index === modeIndex
                  ? 'text-white'
                  : 'bg-surface-hover text-text-secondary hover:text-text-primary hover:bg-surface-active'
              }`}
              style={mode.index === modeIndex ? { backgroundColor: accent } : undefined}
            >
              {mode.name}
            </button>
          </Tooltip>
        ))}
      </div>

      {currentMode && (
        <div className="flex gap-1 flex-wrap">
          {currentMode.subModes.map((sub) => (
            <Tooltip key={sub.index} text={SUB_MODE_TIPS[sub.name] ?? sub.name}>
              <button
                onClick={() => handleSubModeChange(sub.index)}
                className={`px-3 py-1.5 lg:px-2 lg:py-0.5 text-xs lg:text-[11px] rounded-full transition-colors ${
                  sub.index === subModeIndex
                    ? 'text-white border'
                    : 'bg-surface-hover text-text-secondary hover:text-text-primary'
                }`}
                style={
                  sub.index === subModeIndex
                    ? { backgroundColor: `${accent}33`, borderColor: accent }
                    : undefined
                }
              >
                {sub.name}
              </button>
            </Tooltip>
          ))}
        </div>
      )}
    </div>
  )
}
