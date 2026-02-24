import { useCallback } from 'react'
import type { MidiValue } from '../../lib/midi-types'
import type { EngineId } from '../../lib/midi-constants'
import type { TunableParam, DelaySource } from '../../lib/echosystem'
import { getSubModeDefinition, ENGINE_PARAM_ORDER, ENGINE_PARAM_LABELS, DELAY_SOURCE_LABELS } from '../../lib/echosystem'
import { PARAM_TIPS, DELAY_SOURCE_TIPS } from '../../lib/tooltips'
import { useStore } from '../../store'
import { Tooltip } from '../ui/Tooltip'
import { ModeSelector } from './ModeSelector'
import { ParamSlider } from './ParamSlider'
import { RatioSelect } from './RatioSelect'

interface EnginePanelProps {
  engine: EngineId
  accent: string
  accentDim: string
}

const DELAY_SOURCES: DelaySource[] = ['global', 'local', 'knob']

export function EnginePanel({ engine, accent, accentDim }: EnginePanelProps) {
  const engineState = useStore((s) => (engine === 'A' ? s.engineA : s.engineB))
  const setEngineParam = useStore((s) => s.setEngineParam)
  const setDelaySource = useStore((s) => s.setDelaySource)
  const markDirty = useStore((s) => s.markDirty)

  const subModeDef = getSubModeDefinition(engineState.modeIndex, engineState.subModeIndex)

  const getLabel = useCallback(
    (param: TunableParam): string => {
      if (param === 'thing1' && subModeDef) return subModeDef.thing1
      if (param === 'thing2' && subModeDef) return subModeDef.thing2
      return ENGINE_PARAM_LABELS[param] ?? param
    },
    [subModeDef],
  )

  const handleParamChange = useCallback(
    (param: TunableParam) => (value: MidiValue) => {
      setEngineParam(engine, param, value)
      markDirty()
    },
    [engine, setEngineParam, markDirty],
  )

  const handleSourceChange = useCallback(
    (source: DelaySource) => {
      setDelaySource(engine, source)
      markDirty()
    },
    [engine, setDelaySource, markDirty],
  )

  return (
    <div
      className="rounded-lg border bg-surface overflow-hidden"
      style={{ borderColor: accentDim }}
    >
      <div
        className="px-4 py-2 flex items-center justify-between"
        style={{ borderBottom: `1px solid ${accentDim}` }}
      >
        <h2 className="text-sm font-semibold tracking-wide" style={{ color: accent }}>
          Engine {engine}
        </h2>
      </div>

      <div className="p-4 space-y-4">
        <ModeSelector engine={engine} accent={accent} />

        <div className="space-y-2">
          {ENGINE_PARAM_ORDER.map((param) =>
            param === 'ratio' ? (
              <RatioSelect
                key={param}
                label={getLabel(param)}
                value={engineState[param]}
                onChange={handleParamChange(param)}
                accent={accent}
                tooltip={PARAM_TIPS[param]}
              />
            ) : (
              <ParamSlider
                key={param}
                label={getLabel(param)}
                value={engineState[param]}
                onChange={handleParamChange(param)}
                accent={accent}
                tooltip={PARAM_TIPS[param]}
              />
            ),
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-text-secondary w-28 text-right shrink-0">
            Delay Source
          </span>
          <div className="flex gap-1">
            {DELAY_SOURCES.map((source) => (
              <Tooltip key={source} text={DELAY_SOURCE_TIPS[source]}>
                <button
                  onClick={() => handleSourceChange(source)}
                  className={`px-2 py-0.5 text-[11px] rounded transition-colors ${
                    engineState.delaySource === source
                      ? 'text-white'
                      : 'bg-surface-hover text-text-secondary hover:text-text-primary'
                  }`}
                  style={
                    engineState.delaySource === source
                      ? { backgroundColor: accent }
                      : undefined
                  }
                >
                  {DELAY_SOURCE_LABELS[source]}
                </button>
              </Tooltip>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
