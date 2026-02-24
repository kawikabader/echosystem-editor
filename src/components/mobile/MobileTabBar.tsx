interface MobileTabBarProps {
  onPresetsOpen: () => void
  onScrollTo: (section: 'engineA' | 'engineB' | 'controls') => void
}

const presetsIcon = (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
  </svg>
)

const slidersIcon = (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
  </svg>
)

const gearIcon = (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
)

export function MobileTabBar({ onPresetsOpen, onScrollTo }: MobileTabBarProps) {
  return (
    <nav className="shrink-0 border-t border-border bg-[#1a1a1a] pb-[env(safe-area-inset-bottom)] lg:hidden">
      <div className="flex items-stretch">
        <button
          onClick={onPresetsOpen}
          className="flex-1 flex flex-col items-center gap-0.5 py-2.5 text-text-muted active:text-text-primary transition-colors"
        >
          {presetsIcon}
          <span className="text-[10px] leading-none">Presets</span>
        </button>
        <button
          onClick={() => onScrollTo('engineA')}
          className="flex-1 flex flex-col items-center gap-0.5 py-2.5 text-engine-a active:text-engine-a/70 transition-colors"
        >
          {slidersIcon}
          <span className="text-[10px] leading-none">Engine A</span>
        </button>
        <button
          onClick={() => onScrollTo('engineB')}
          className="flex-1 flex flex-col items-center gap-0.5 py-2.5 text-engine-b active:text-engine-b/70 transition-colors"
        >
          {slidersIcon}
          <span className="text-[10px] leading-none">Engine B</span>
        </button>
        <button
          onClick={() => onScrollTo('controls')}
          className="flex-1 flex flex-col items-center gap-0.5 py-2.5 text-text-muted active:text-text-primary transition-colors"
        >
          {gearIcon}
          <span className="text-[10px] leading-none">Controls</span>
        </button>
      </div>
    </nav>
  )
}
