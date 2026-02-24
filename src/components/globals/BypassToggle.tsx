import { useStore } from '../../store'
import { GLOBAL_TIPS } from '../../lib/tooltips'
import { Tooltip } from '../ui/Tooltip'

export function BypassToggle() {
  const bypassed = useStore((s) => s.global.bypassed)
  const toggleBypass = useStore((s) => s.toggleBypass)

  return (
    <Tooltip text={GLOBAL_TIPS.bypass}>
      <button
        onClick={toggleBypass}
        className={`w-full px-3 py-3 rounded-lg text-sm font-semibold transition-all ${
          bypassed
            ? 'bg-text-muted/20 text-text-muted border border-border'
            : 'bg-success text-white shadow-[0_0_12px_rgba(34,197,94,0.3)]'
        }`}
      >
        {bypassed ? 'BYPASSED' : 'ENGAGED'}
      </button>
    </Tooltip>
  )
}
