import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  // Server URL management
  getServerUrl: (): Promise<string> => ipcRenderer.invoke('get-server-url'),
  setServerUrl: (url: string): Promise<string> => ipcRenderer.invoke('set-server-url', url),

  // P&W API key (stored securely in electron-store)
  getApiKey: (): Promise<string> => ipcRenderer.invoke('get-api-key'),
  setApiKey: (apiKey: string): Promise<void> => ipcRenderer.invoke('set-api-key', apiKey),

  // Notifications
  showNotification: (options: { title: string; body: string }): void =>
    ipcRenderer.send('show-notification', options),

  // Discord auth (opens a BrowserWindow popup)
  openDiscordAuth: (authUrl: string): Promise<{ success: boolean; error?: string }> =>
    ipcRenderer.invoke('open-discord-auth', authUrl),

  // Check if running in Electron
  isElectron: true,
})

// Make TS happy with the global type
declare global {
  interface Window {
    electronAPI: {
      getServerUrl: () => Promise<string>
      setServerUrl: (url: string) => Promise<string>
      getApiKey: () => Promise<string>
      setApiKey: (apiKey: string) => Promise<void>
      showNotification: (options: { title: string; body: string }) => void
      openDiscordAuth: (authUrl: string) => Promise<{ success: boolean; error?: string }>
      isElectron: boolean
    }
  }
}
