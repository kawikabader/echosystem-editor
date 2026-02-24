import { useCallback, useState, useRef, useEffect } from 'react'
import { useStore } from '../../store'

interface PresetSlotProps {
  id: number
}

export function PresetSlot({ id }: PresetSlotProps) {
  const name = useStore((s) => s.presets[id].name)
  const activePresetId = useStore((s) => s.activePresetId)
  const dirty = useStore((s) => s.dirty)
  const loadPreset = useStore((s) => s.loadPreset)
  const renamePreset = useStore((s) => s.renamePreset)
  const copyPreset = useStore((s) => s.copyPreset)
  const pastePreset = useStore((s) => s.pastePreset)
  const hasClipboard = useStore((s) => s.clipboardPreset !== null)

  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const isActive = activePresetId === id
  const showDirty = isActive && dirty

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  const handleClick = useCallback(() => {
    loadPreset(id)
  }, [id, loadPreset])

  const handleDoubleClick = useCallback(() => {
    setEditName(name)
    setEditing(true)
  }, [name])

  const handleRename = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      setEditName(name)
      setEditing(true)
    },
    [name],
  )

  const handleCopy = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      copyPreset(id)
    },
    [id, copyPreset],
  )

  const handlePaste = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      pastePreset(id)
    },
    [id, pastePreset],
  )

  const commitRename = useCallback(() => {
    if (editName.trim()) {
      renamePreset(id, editName.trim())
    }
    setEditing(false)
  }, [id, editName, renamePreset])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') commitRename()
      if (e.key === 'Escape') setEditing(false)
    },
    [commitRename],
  )

  return (
    <div
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      className={`group relative px-2 py-2 rounded cursor-pointer transition-colors text-left ${
        isActive
          ? 'bg-accent/20 border border-accent/50'
          : 'bg-surface-hover border border-transparent hover:border-border hover:bg-surface-active'
      }`}
    >
      {showDirty && (
        <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-warning" />
      )}

      {editing ? (
        <input
          ref={inputRef}
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onBlur={commitRename}
          onKeyDown={handleKeyDown}
          className="w-full bg-transparent text-xs text-text-primary outline-none border-b border-accent"
        />
      ) : (
        <div className="flex items-center justify-between gap-1">
          <span className="text-[11px] text-text-primary truncate">
            <span className="text-text-muted">{String(id + 1).padStart(2, '0')}</span>{' '}
            {name}
            {showDirty && ' *'}
          </span>
          <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            {isActive && (
              <button
                onClick={handleRename}
                className="text-[9px] px-1.5 py-0.5 rounded bg-surface-active text-text-muted hover:text-text-secondary"
              >
                Rename
              </button>
            )}
            <button
              onClick={handleCopy}
              className="text-[9px] px-1.5 py-0.5 rounded bg-surface-active text-text-muted hover:text-text-secondary"
            >
              Copy
            </button>
            {hasClipboard && (
              <button
                onClick={handlePaste}
                className="text-[9px] px-1.5 py-0.5 rounded bg-accent/20 text-accent hover:bg-accent/30"
              >
                Paste
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
