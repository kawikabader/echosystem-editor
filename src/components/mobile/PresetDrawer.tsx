import { Drawer } from 'vaul'
import { MAX_PRESETS } from '../../lib/midi-constants'
import { PresetSlot } from '../preset/PresetSlot'

interface PresetDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PresetDrawer({ open, onOpenChange }: PresetDrawerProps) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/50 z-[100]" />
        <Drawer.Content className="fixed bottom-0 inset-x-0 z-[101] flex flex-col rounded-t-2xl bg-[#1a1a1a] border-t border-white/10 outline-none max-h-[85dvh]">
          <Drawer.Handle className="mx-auto mt-3 mb-1 h-1.5 w-10 rounded-full bg-white/20" />
          <Drawer.Title className="px-4 pb-2 pt-1 text-sm font-semibold text-white/80 tracking-wide">
            Presets
          </Drawer.Title>

          <div
            className="flex-1 overflow-y-auto overscroll-contain px-2 pb-[env(safe-area-inset-bottom)]"
            data-vaul-no-drag
          >
            <div className="space-y-1">
              {Array.from({ length: MAX_PRESETS }, (_, i) => (
                <PresetSlot key={i} id={i} />
              ))}
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
