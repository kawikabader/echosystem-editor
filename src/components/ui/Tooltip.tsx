import { useState, useRef, useCallback, useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface TooltipProps {
  text: string
  children: ReactNode
}

export function Tooltip({ text, children }: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0, above: true })
  const triggerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const show = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      setVisible(true)
    }, 400)
  }, [])

  const hide = useCallback(() => {
    clearTimeout(timeoutRef.current)
    setVisible(false)
  }, [])

  useEffect(() => {
    if (!visible || !triggerRef.current) return

    const rect = triggerRef.current.getBoundingClientRect()
    const above = rect.top > 80
    setCoords({
      left: rect.left + rect.width / 2,
      top: above ? rect.top - 6 : rect.bottom + 6,
      above,
    })
  }, [visible])

  return (
    <div
      ref={triggerRef}
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      {children}
      {visible &&
        createPortal(
          <div
            ref={tooltipRef}
            className="fixed z-[9999] -translate-x-1/2 px-3 py-2 rounded-md bg-[#222] border border-border text-[11px] text-text-secondary leading-relaxed whitespace-normal min-w-40 max-w-60 pointer-events-none shadow-lg"
            style={{
              left: coords.left,
              top: coords.above ? undefined : coords.top,
              bottom: coords.above ? `calc(100vh - ${coords.top}px)` : undefined,
            }}
          >
            {text}
          </div>,
          document.body,
        )}
    </div>
  )
}
