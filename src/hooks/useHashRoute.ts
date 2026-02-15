import { useCallback, useSyncExternalStore } from 'react'

function getHash(): string {
  return window.location.hash.replace(/^#/, '') || ''
}

function subscribe(callback: () => void): () => void {
  window.addEventListener('hashchange', callback)
  return () => window.removeEventListener('hashchange', callback)
}

export function useHashRoute(): [string, (hash: string) => void] {
  const hash = useSyncExternalStore(subscribe, getHash, () => '')

  const setHash = useCallback((next: string) => {
    window.location.hash = next
  }, [])

  return [hash, setHash]
}
