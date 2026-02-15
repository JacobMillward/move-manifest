import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

let uuidCounter = 0

if (!globalThis.crypto) {
  globalThis.crypto = {} as Crypto
}

if (!globalThis.crypto.randomUUID) {
  globalThis.crypto.randomUUID = () => {
    uuidCounter += 1
    return `test-uuid-${uuidCounter}`
  }
}

afterEach(() => {
  cleanup()
})

if (!globalThis.localStorage || typeof globalThis.localStorage.clear !== 'function') {
  const store = new Map<string, string>()

  globalThis.localStorage = {
    get length() {
      return store.size
    },
    clear() {
      store.clear()
    },
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null
    },
    removeItem(key: string) {
      store.delete(key)
    },
    setItem(key: string, value: string) {
      store.set(key, value)
    },
  }
}
