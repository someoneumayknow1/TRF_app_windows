/**
 * Retrieves the P&W API key from electron-store via IPC.
 * Web fallback reads from localStorage (read-only, no new writes).
 */
export async function getApiKey(): Promise<string> {
  if (typeof window !== 'undefined' && window.electronAPI) {
    return window.electronAPI.getApiKey()
  }
  return localStorage.getItem('apiKey') || ''
}

/**
 * Stores the P&W API key in electron-store via IPC.
 */
export async function setApiKey(apiKey: string): Promise<void> {
  if (typeof window !== 'undefined' && window.electronAPI) {
    return window.electronAPI.setApiKey(apiKey)
  }
}
