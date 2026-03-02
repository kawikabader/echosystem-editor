import { useCallback, useEffect, useState } from 'react'
import { useStore } from '../../store'
import { isFileSystemAccessSupported } from '../../lib/storage-service'
import { STORAGE_TIPS } from '../../lib/tooltips'
import { Tooltip } from '../ui/Tooltip'

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  return `${hours}h ago`
}

const BTN =
  'text-xs lg:text-[10px] px-2 py-1 rounded bg-surface-hover text-text-secondary hover:text-text-primary hover:bg-surface-active transition-colors'
const BTN_DISABLED = `${BTN} disabled:opacity-30 disabled:pointer-events-none`

export function StorageControls() {
  const fsDirectoryName = useStore((s) => s.fsDirectoryName)
  const fsStatus = useStore((s) => s.fsStatus)
  const fsError = useStore((s) => s.fsError)
  const fsLastSavedAt = useStore((s) => s.fsLastSavedAt)
  const chooseSaveFolder = useStore((s) => s.chooseSaveFolder)
  const saveToFolder = useStore((s) => s.saveToFolder)
  const loadFromFolder = useStore((s) => s.loadFromFolder)
  const disconnectFolder = useStore((s) => s.disconnectFolder)
  const dismissFsError = useStore((s) => s.dismissFsError)

  const [relativeTime, setRelativeTime] = useState('')

  useEffect(() => {
    if (!fsLastSavedAt) {
      setRelativeTime('')
      return
    }
    setRelativeTime(timeAgo(fsLastSavedAt))
    const id = setInterval(() => {
      setRelativeTime(timeAgo(fsLastSavedAt))
    }, 60_000)
    return () => clearInterval(id)
  }, [fsLastSavedAt])

  const handleLoad = useCallback(() => {
    if (!window.confirm('Loading from file will replace all presets in the editor. Continue?')) {
      return
    }
    loadFromFolder()
  }, [loadFromFolder])

  if (!isFileSystemAccessSupported()) return null

  const busy = fsStatus === 'busy'

  // No folder selected yet
  if (!fsDirectoryName) {
    return (
      <div className="border-t border-border px-3 py-2">
        <Tooltip text={STORAGE_TIPS.saveToFolder}>
          <button onClick={chooseSaveFolder} className={BTN}>
            Save to Folder
          </button>
        </Tooltip>
      </div>
    )
  }

  // Folder connected
  return (
    <div className="border-t border-border px-3 py-2 space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-text-secondary truncate max-w-[140px] inline-flex items-center gap-1" title={fsDirectoryName}>
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
          </svg>
          {fsDirectoryName}
        </span>
        <Tooltip text={STORAGE_TIPS.disconnect}>
          <button
            onClick={disconnectFolder}
            aria-label="Disconnect folder"
            className="text-[10px] text-text-secondary hover:text-text-primary transition-colors"
          >
            ✕
          </button>
        </Tooltip>
      </div>

      <div className="flex items-center gap-1">
        <Tooltip text={STORAGE_TIPS.saveAll}>
          <button onClick={saveToFolder} disabled={busy} className={BTN_DISABLED}>
            {busy ? 'Saving…' : 'Save All'}
          </button>
        </Tooltip>
        <Tooltip text={STORAGE_TIPS.load}>
          <button onClick={handleLoad} disabled={busy} className={BTN_DISABLED}>
            Load
          </button>
        </Tooltip>
      </div>

      {relativeTime && (
        <p className="text-[10px] text-text-secondary">Saved {relativeTime}</p>
      )}

      {fsError && (
        <div className="flex items-start gap-1 text-[10px] text-red-400">
          <span className="flex-1">{fsError}</span>
          <button onClick={dismissFsError} aria-label="Dismiss error" className="shrink-0 hover:text-red-300">
            ✕
          </button>
        </div>
      )}
    </div>
  )
}
