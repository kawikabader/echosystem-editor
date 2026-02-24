import { useStore } from '../../store'
import { GLOBAL_TIPS } from '../../lib/tooltips'
import { Tooltip } from '../ui/Tooltip'

export function SyncButton() {
  const sendFullState = useStore((s) => s.sendFullState)
  const connected = useStore((s) => s.connected)
  const syncing = useStore((s) => s.syncing)

  return (
    <Tooltip text={GLOBAL_TIPS.sync}>
      <button
        onClick={sendFullState}
        disabled={!connected || syncing}
        className="w-full px-3 py-2 rounded-lg text-xs font-medium bg-accent/10 text-accent border border-accent/30 hover:bg-accent/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        {syncing ? 'Syncing...' : 'Sync to Pedal'}
      </button>
    </Tooltip>
  )
}
