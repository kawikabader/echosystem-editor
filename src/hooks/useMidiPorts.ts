import { useEffect } from 'react'
import { useStore } from '../store'

export function useMidiInit() {
  const initMidi = useStore((s) => s.initMidi)

  useEffect(() => {
    initMidi()
  }, [initMidi])
}
