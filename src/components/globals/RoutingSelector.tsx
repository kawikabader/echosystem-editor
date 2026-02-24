import type { Routing } from '../../lib/echosystem'
import { ROUTING_LABELS } from '../../lib/echosystem'
import { ROUTING_TIPS } from '../../lib/tooltips'
import { useStore } from '../../store'
import { Tooltip } from '../ui/Tooltip'

const ROUTINGS: Routing[] = ['single', 'parallel', 'serial', 'leftRight']

export function RoutingSelector() {
  const routing = useStore((s) => s.global.routing)
  const setRouting = useStore((s) => s.setRouting)
  const markDirty = useStore((s) => s.markDirty)

  return (
    <div className="space-y-1.5">
      <label className="text-[10px] text-text-muted uppercase tracking-wider font-medium">
        Routing
      </label>
      <div className="flex flex-col gap-1">
        {ROUTINGS.map((r) => (
          <Tooltip key={r} text={ROUTING_TIPS[r]}>
            <button
              onClick={() => { setRouting(r); markDirty() }}
              className={`px-3 py-1.5 text-xs rounded transition-colors text-left ${
                routing === r
                  ? 'bg-accent text-white'
                  : 'bg-surface-hover text-text-secondary hover:text-text-primary hover:bg-surface-active'
              }`}
            >
              {ROUTING_LABELS[r]}
            </button>
          </Tooltip>
        ))}
      </div>
    </div>
  )
}
