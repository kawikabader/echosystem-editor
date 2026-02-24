import { useCallback, useRef } from 'react'
import { MAX_PRESETS } from '../../lib/midi-constants'
import { PRESET_TIPS } from '../../lib/tooltips'
import { useStore } from '../../store'
import { parsePresetBin, buildPresetBin } from '../../lib/preset-codec'
import { exportAllPresetsAsZip } from '../../lib/preset-codec'
import { Tooltip } from '../ui/Tooltip'
import { PresetSlot } from './PresetSlot'

export function PresetBrowser() {
  const presets = useStore((s) => s.presets)
  const importPreset = useStore((s) => s.importPreset)
  const importAllPresets = useStore((s) => s.importAllPresets)
  const activePresetId = useStore((s) => s.activePresetId)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImportFiles = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []).filter((f) =>
        f.name.endsWith('.bin'),
      )
      if (files.length === 0) return

      const imported = []
      for (const file of files) {
        const match = file.name.match(/^(\d+)_echosystem\.bin$/)
        if (!match) continue
        const slotId = parseInt(match[1], 10)
        if (slotId < 0 || slotId >= MAX_PRESETS) continue

        try {
          const buffer = await file.arrayBuffer()
          const preset = parsePresetBin(new Uint8Array(buffer), slotId)
          imported.push(preset)
        } catch (err) {
          console.error(`Failed to parse ${file.name}:`, err)
        }
      }

      if (imported.length === 1) {
        importPreset(imported[0].id, imported[0])
      } else if (imported.length > 1) {
        importAllPresets(imported)
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    },
    [importPreset, importAllPresets],
  )

  const handleExportCurrent = useCallback(() => {
    if (activePresetId === null) return
    const preset = presets[activePresetId]
    const data = buildPresetBin(preset)
    const blob = new Blob([data.buffer as ArrayBuffer], { type: 'application/octet-stream' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${String(activePresetId).padStart(2, '0')}_echosystem.bin`
    a.click()
    URL.revokeObjectURL(url)
  }, [activePresetId, presets])

  const handleExportAll = useCallback(async () => {
    await exportAllPresetsAsZip(presets)
  }, [presets])

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
          Presets
        </h2>
        <div className="flex gap-1">
          <Tooltip text={PRESET_TIPS.import}>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-[10px] px-2 py-1 rounded bg-surface-hover text-text-secondary hover:text-text-primary hover:bg-surface-active transition-colors"
            >
              Import
            </button>
          </Tooltip>
          <Tooltip text={PRESET_TIPS.export}>
            <button
              onClick={handleExportCurrent}
              disabled={activePresetId === null}
              className="text-[10px] px-2 py-1 rounded bg-surface-hover text-text-secondary hover:text-text-primary hover:bg-surface-active transition-colors disabled:opacity-30"
            >
              Export
            </button>
          </Tooltip>
          <Tooltip text={PRESET_TIPS.exportAll}>
            <button
              onClick={handleExportAll}
              className="text-[10px] px-2 py-1 rounded bg-surface-hover text-text-secondary hover:text-text-primary hover:bg-surface-active transition-colors"
            >
              Export All
            </button>
          </Tooltip>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".bin"
        multiple
        className="hidden"
        onChange={handleImportFiles}
      />

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {Array.from({ length: MAX_PRESETS }, (_, i) => (
          <PresetSlot key={i} id={i} />
        ))}
      </div>

    
    </div>
  )
}
