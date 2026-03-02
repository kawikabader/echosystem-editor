import { useEffect } from 'react'
import { useStore } from '../store'

export function useStorageInit() {
  const initStorage = useStore((s) => s.initStorage)

  useEffect(() => {
    initStorage()
  }, [initStorage])
}
