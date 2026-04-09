const JSONBIN_BASE = 'https://api.jsonbin.io/v3'

const BIN_ID = '2a$10$1jeowFk4rI03kberVotT5eIaSrBV3R7SRi8Hztc0.lpAuUgblURga'
const MASTER_KEY = '69d810f210716a4d5de5a04a'

export const SYNC_STORAGE_KEY = 'vag_sync_enabled'

export const syncToCloud = async (data) => {
  try {
    const response = await fetch(`${JSONBIN_BASE}/b/${BIN_ID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': MASTER_KEY
      },
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error(`Sync failed: ${response.status}`)
    return { success: true }
  } catch (error) {
    console.error('syncToCloud error:', error)
    return { success: false, error: error.message }
  }
}

export const fetchFromCloud = async () => {
  try {
    const response = await fetch(`${JSONBIN_BASE}/b/${BIN_ID}/latest`, {
      method: 'GET',
      headers: {
        'X-Master-Key': MASTER_KEY
      }
    })
    if (!response.ok) throw new Error(`Fetch failed: ${response.status}`)
    const json = await response.json()
    return { success: true, data: json.record }
  } catch (error) {
    console.error('fetchFromCloud error:', error)
    return { success: false, error: error.message }
  }
}

export const isSyncEnabled = () => {
  try {
    return localStorage.getItem(SYNC_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export const setSyncEnabled = (enabled) => {
  try {
    localStorage.setItem(SYNC_STORAGE_KEY, enabled ? 'true' : 'false')
  } catch {}
}
