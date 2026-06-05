const DB_NAME = 'ShopsportOffline'
const DB_VERSION = 1
const STORE_NAME = 'colaTareas'

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = (evt) => {
      const db = evt.target.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true })
        store.createIndex('createdAt', 'createdAt', { unique: false })
      }
    }
    request.onsuccess = (evt) => resolve(evt.target.result)
    request.onerror = (evt) => reject(evt.target.error)
  })
}

export async function addToQueue(entry) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const data = { ...entry, createdAt: new Date().toISOString() }
    store.add(data)
    tx.oncomplete = () => resolve()
    tx.onerror = (evt) => reject(evt.target.error)
  })
}

export async function getPendingOrders() {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const all = store.getAll()
    all.onsuccess = () => resolve(all.result || [])
    all.onerror = (evt) => reject(evt.target.error)
  })
}

export async function removeFromQueue(id) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    store.delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = (evt) => reject(evt.target.error)
  })
}

export async function processQueue(apiClient, onProgress) {
  const pending = await getPendingOrders()
  for (const entry of pending) {
    try {
      await apiClient.post('/pedidos', entry.detalles ? { detalles: entry.detalles } : entry)
      await removeFromQueue(entry.id)
      if (onProgress) onProgress(entry)
    } catch {
      break
    }
  }
  const remaining = await getPendingOrders()
  return { processed: pending.length - remaining.length, remaining: remaining.length }
}
