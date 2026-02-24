import { useStore } from '../../store'

export function ConnectionPanel() {
  const midiSupported = useStore((s) => s.midiSupported)
  const connected = useStore((s) => s.connected)
  const availableOutputs = useStore((s) => s.availableOutputs)
  const selectedPortId = useStore((s) => s.selectedPortId)
  const midiChannel = useStore((s) => s.midiChannel)
  const selectPort = useStore((s) => s.selectPort)
  const setMidiChannel = useStore((s) => s.setMidiChannel)

  if (!midiSupported) {
    return (
      <div className="flex items-center gap-3 px-4 py-2 bg-danger/10 border border-danger/30 rounded-lg">
        <span className="text-danger text-sm font-medium">
          Web MIDI not supported. Use Chrome or Edge.
        </span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4 px-3 py-2 bg-surface rounded-lg border border-border">
      <div className="flex items-center gap-2 min-w-0">
        <label className="text-xs text-text-secondary uppercase tracking-wider font-medium hidden sm:inline">
          Device
        </label>
        <select
          value={selectedPortId ?? ''}
          onChange={(e) => selectPort(e.target.value)}
          className="bg-surface-hover border border-border rounded px-2 py-1.5 text-base lg:text-sm text-text-primary outline-none focus:border-accent flex-1 min-w-0 truncate"
        >
          <option value="">No device</option>
          {availableOutputs.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs text-text-secondary uppercase tracking-wider font-medium">
            CH
          </label>
          <select
            value={midiChannel}
            onChange={(e) => setMidiChannel(Number(e.target.value))}
            className="bg-surface-hover border border-border rounded px-2 py-1.5 text-base lg:text-sm text-text-primary outline-none focus:border-accent w-16"
          >
            {Array.from({ length: 16 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              connected ? 'bg-success shadow-[0_0_6px_rgba(34,197,94,0.5)]' : 'bg-text-muted'
            }`}
          />
          <span className="text-xs text-text-secondary hidden sm:inline">
            {connected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>
    </div>
  )
}
