'use strict'

import { app, protocol, BrowserWindow, ipcMain, Notification, session, Tray, Menu, nativeImage } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import path from 'path'
import Store from 'electron-store'

const isDevelopment = process.env.NODE_ENV !== 'production'

// Persistent settings store
const store = new Store({
  defaults: {
    serverUrl: process.env.VUE_APP_DEFAULT_SERVER_URL || 'https://bar3.bsnk.dev',
    windowBounds: { width: 1200, height: 800 }
  }
})

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true, supportFetchAPI: true, corsEnabled: true } }
])

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null

function createTray() {
  // Use a simple empty tray icon (placeholder nativeImage)
  const icon = nativeImage.createEmpty()
  tray = new Tray(icon)
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Open Bar 3', click: () => { mainWindow?.show(); mainWindow?.focus() } },
    { type: 'separator' },
    { label: 'Quit', click: () => { app.quit() } }
  ])
  tray.setToolTip('TRF Bar 3')
  tray.setContextMenu(contextMenu)
  tray.on('double-click', () => { mainWindow?.show(); mainWindow?.focus() })
}

async function createWindow() {
  const bounds = store.get('windowBounds') as { width: number; height: number }

  mainWindow = new BrowserWindow({
    width: bounds.width,
    height: bounds.height,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#0f0f0f',
    titleBarStyle: 'default',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      session: session.defaultSession
    }
  })

  mainWindow.on('resize', () => {
    if (mainWindow) {
      const [width, height] = mainWindow.getSize()
      store.set('windowBounds', { width, height })
    }
  })

  mainWindow.on('close', (e) => {
    if (tray) {
      e.preventDefault()
      mainWindow?.hide()
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    await mainWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string)
    if (!process.env.IS_TEST) mainWindow.webContents.openDevTools()
  } else {
    createProtocol('app')
    mainWindow.loadURL('app://./index.html')
  }
}

// IPC: Get server URL
ipcMain.handle('get-server-url', () => {
  return store.get('serverUrl') as string
})

// IPC: Set server URL
ipcMain.handle('set-server-url', (_event, url: string) => {
  store.set('serverUrl', url)
  return url
})

// IPC: Get/set P&W API key (securely via electron-store, not localStorage)
ipcMain.handle('get-api-key', () => {
  return store.get('apiKey', '') as string
})

ipcMain.handle('set-api-key', (_event, apiKey: string) => {
  store.set('apiKey', apiKey)
})

// IPC: Show Windows notification
ipcMain.on('show-notification', (_event, options: { title: string; body: string }) => {
  if (Notification.isSupported()) {
    const notification = new Notification({
      title: options.title || 'Bar 3',
      body: options.body || '',
      silent: false
    })
    notification.on('click', () => {
      mainWindow?.show()
      mainWindow?.focus()
    })
    notification.show()
  }
})

// IPC: Open Discord auth window
ipcMain.handle('open-discord-auth', async (_event, authUrl: string) => {
  return new Promise<{ success: boolean; error?: string }>((resolve) => {
    let settled = false
    const settle = (result: { success: boolean; error?: string }) => {
      if (settled) return
      settled = true
      resolve(result)
    }

    const authWindow = new BrowserWindow({
      width: 500,
      height: 700,
      parent: mainWindow || undefined,
      modal: true,
      show: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        session: session.defaultSession
      }
    })

    authWindow.loadURL(authUrl)

    const expectedOrigin = new URL(authUrl).origin
    const successPath = '/auth/discord/callback'
    const loginPath = '/auth/login'

    // Detect when the OAuth flow finishes on a non-auth route on the same server.
    const handleNavigation = (url: string) => {
      try {
        const current = new URL(url)
        if (current.origin !== expectedOrigin) return
        if (current.pathname === successPath) return

        if (current.pathname === loginPath) {
          const error = current.searchParams.get('error') || 'Authentication failed'
          authWindow.close()
          settle({ success: false, error })
          return
        }

        if (!current.pathname.startsWith('/auth/')) {
          authWindow.close()
          settle({ success: true })
        }
      } catch {
        // Ignore invalid URLs during OAuth navigation.
      }
    }

    authWindow.webContents.on('will-navigate', (_e, url) => handleNavigation(url))
    authWindow.webContents.on('did-navigate', (_e, url) => handleNavigation(url))
    authWindow.webContents.on('did-redirect-navigation', (_e, url) => handleNavigation(url))

    authWindow.on('closed', () => {
      settle({ success: false, error: 'Auth window closed' })
    })
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (!tray) app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e)
    }
  }
  createWindow()
  createTray()
})

if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') app.quit()
    })
  } else {
    process.on('SIGTERM', () => app.quit())
  }
}
