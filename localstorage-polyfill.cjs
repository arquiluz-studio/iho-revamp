// Node 25 exposes a broken localStorage global unless --localstorage-file is set.
// Next.js SSR then crashes with "localStorage.getItem is not a function".
;(function patchLocalStorage() {
  try {
    if (typeof globalThis.localStorage?.getItem === 'function') return
  } catch {
    // ignore and replace
  }

  const store = new Map()
  const memoryStorage = {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => {
      store.set(key, String(value))
    },
    removeItem: (key) => {
      store.delete(key)
    },
    clear: () => {
      store.clear()
    },
    key: (index) => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size
    },
  }

  Object.defineProperty(globalThis, 'localStorage', {
    value: memoryStorage,
    configurable: true,
    writable: true,
  })
})()
