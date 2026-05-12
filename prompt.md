Create a complete Electron + Vue 2 + Vuetify 2 Windows desktop application in the directory /home/runner/work/TRF_app_windows/TRF_app_windows.

The app is based on the bar3-client (Vue 2 + Vuetify 2) UI from https://github.com/TheonlyGlaernisch/bar3-server and wraps it in Electron for Windows.

Requirements
Electron app with Vue 2 + Vuetify 2 + TypeScript
Discord OAuth authentication (Electron BrowserWindow-based OAuth flow)
Windows notifications via Electron's Notification API (with IPC)
API connection to a configurable bar3-server URL
Settings view for configuring the server URL
System tray support
Uses vue-cli-plugin-electron-builder for build pipeline
Files to create (ALL must be created):
/home/runner/work/TRF_app_windows/TRF_app_windows/package.json
JSON
{
  "name": "trf-app-windows",
  "version": "1.0.0",
  "description": "TRF Bar 3 Windows Desktop Application",
  "author": "TRF",
  "private": true,
  "scripts": {
    "serve": "vue-cli-service serve",
    "build": "vue-cli-service build",
    "electron:build": "vue-cli-service electron:build",
    "electron:serve": "vue-cli-service electron:serve",
    "lint": "vue-cli-service lint"
  },
  "main": "background.js",
  "dependencies": {
    "@mdi/font": "^7.4.47",
    "axios": "^1.9.0",
    "chart.js": "^2.9.4",
    "core-js": "^3.6.5",
    "debounce": "^1.2.0",
    "electron-store": "^8.2.0",
    "hammerjs": "^2.0.8",
    "juice": "^7.0.0",
    "markdown-it": "^14.1.0",
    "prismjs": "^1.30.0",
    "quill": "^1.3.7",
    "sass": "^1.19.0",
    "sass-loader": "^8.0.0",
    "vue": "^2.6.11",
    "vue-chartjs": "^3.5.1",
    "vue-class-component": "^7.2.3",
    "vue-property-decorator": "^9.1.2",
    "vue-router": "^3.2.0",
    "vue-template-compiler": "^2.6.11",
    "vuetify": "^2.2.11",
    "vuetify-loader": "^1.3.0",
    "vuex": "^3.4.0"
  },
  "devDependencies": {
    "@types/debounce": "^1.2.0",
    "@types/hammerjs": "^2.0.38",
    "@types/node": "^18.0.0",
    "@types/prismjs": "^1.16.2",
    "@types/quill": "^2.0.4",
    "@typescript-eslint/eslint-plugin": "^2.33.0",
    "@typescript-eslint/parser": "^2.33.0",
    "@vue/cli-plugin-babel": "~4.5.0",
    "@vue/cli-plugin-eslint": "~4.5.0",
    "@vue/cli-plugin-router": "~4.5.0",
    "@vue/cli-plugin-typescript": "~4.5.0",
    "@vue/cli-plugin-vuex": "~4.5.0",
    "@vue/cli-service": "~4.5.0",
    "@vue/eslint-config-typescript": "^5.0.2",
    "electron": "^22.3.27",
    "electron-devtools-installer": "^3.2.0",
    "eslint": "^6.7.2",
    "eslint-plugin-vue": "^6.2.2",
    "typescript": "~3.9.3",
    "vue-cli-plugin-electron-builder": "~2.1.1",
    "vue-cli-plugin-vuetify": "~2.0.9"
  }
}
/home/runner/work/TRF_app_windows/TRF_app_windows/.gitignore
Code
node_modules/
dist/
dist_electron/
.env
.env.local
*.log
/home/runner/work/TRF_app_windows/TRF_app_windows/.env.example
Code
# Server URL for bar3-server (default used if not set in app settings)
VUE_APP_DEFAULT_SERVER_URL=https://your-bar3-server.com
/home/runner/work/TRF_app_windows/TRF_app_windows/babel.config.js
js
module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ]
}
/home/runner/work/TRF_app_windows/TRF_app_windows/tsconfig.json
JSON
{
  "compilerOptions": {
    "target": "esnext",
    "module": "esnext",
    "strict": false,
    "jsx": "preserve",
    "importHelpers": true,
    "moduleResolution": "node",
    "experimentalDecorators": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "sourceMap": true,
    "baseUrl": ".",
    "types": ["webpack-env", "node"],
    "paths": {
      "@/*": ["src/*"]
    },
    "lib": ["esnext", "dom", "dom.iterable", "scripthost"]
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.tsx",
    "src/**/*.vue",
    "tests/**/*.ts",
    "tests/**/*.tsx"
  ],
  "exclude": ["node_modules"]
}
/home/runner/work/TRF_app_windows/TRF_app_windows/vue.config.js
js
const fs = require('fs');
const packageJson = fs.readFileSync('./package.json');
const version = JSON.parse(packageJson).version || '0';
const webpack = require('webpack');

module.exports = {
  transpileDependencies: ['vuetify', 'juice'],
  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        'process.env.PACKAGE_VERSION': '"' + version + '"'
      })
    ]
  },
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: false,
      preload: 'src/preload.ts',
      builderOptions: {
        productName: 'TRF Bar 3',
        appId: 'com.trf.bar3',
        win: {
          target: ['nsis', 'portable'],
          icon: 'public/icon.ico'
        },
        nsis: {
          oneClick: false,
          allowToChangeInstallationDirectory: true
        }
      }
    }
  }
};
/home/runner/work/TRF_app_windows/TRF_app_windows/src/background.ts
This is the Electron MAIN PROCESS. It:

Creates the main BrowserWindow
Handles the Discord OAuth popup (a child BrowserWindow)
Handles IPC for notifications, settings, Discord auth
Manages system tray
Uses electron-store for persisting the server URL setting
TypeScript
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
  // Use a simple 16x16 tray icon (placeholder nativeImage)
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
      webSecurity: false, // Allow cross-origin requests to the bar3-server
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

    // Detect when the OAuth flow redirects to the callback page
    const handleNavigation = (url: string) => {
      if (url.includes('/auth/discord/callback')) {
        // Auth completed - notify renderer and close window
        authWindow.close()
        resolve({ success: true })
      }
    }

    authWindow.webContents.on('will-navigate', (_e, url) => handleNavigation(url))
    authWindow.webContents.on('did-navigate', (_e, url) => handleNavigation(url))
    authWindow.webContents.on('did-redirect-navigation', (_e, url) => handleNavigation(url))

    authWindow.on('closed', () => {
      resolve({ success: false, error: 'Auth window closed' })
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
/home/runner/work/TRF_app_windows/TRF_app_windows/src/preload.ts
TypeScript
import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  // Server URL management
  getServerUrl: (): Promise<string> => ipcRenderer.invoke('get-server-url'),
  setServerUrl: (url: string): Promise<string> => ipcRenderer.invoke('set-server-url', url),

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
      showNotification: (options: { title: string; body: string }) => void
      openDiscordAuth: (authUrl: string) => Promise<{ success: boolean; error?: string }>
      isElectron: boolean
    }
  }
}
/home/runner/work/TRF_app_windows/TRF_app_windows/src/main.ts
TypeScript
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import '@mdi/font/css/materialdesignicons.css'

Vue.config.productionTip = false

document.title = 'TRF Bar 3'

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
/home/runner/work/TRF_app_windows/TRF_app_windows/src/global.d.ts
TypeScript
declare module '*.vue' {
  import Vue from 'vue'
  export default Vue
}

declare module 'markdown-it'
declare module 'vue-prism-editor'
/home/runner/work/TRF_app_windows/TRF_app_windows/src/shims-vue.d.ts
TypeScript
declare module '*.vue' {
  import Vue from 'vue'
  export default Vue
}
/home/runner/work/TRF_app_windows/TRF_app_windows/src/plugins/vuetify.ts
TypeScript
import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    dark: true,
    themes: {
      dark: {
        primary: '#FF6B00',
        secondary: '#424242',
        accent: '#FF9500',
        error: '#FF5252',
        info: '#2196F3',
        success: '#4CAF50',
        warning: '#FFC107',
      },
    },
  },
});
/home/runner/work/TRF_app_windows/TRF_app_windows/src/styles/viewStyle.css
(copy from bar3-client - the original content from https://github.com/TheonlyGlaernisch/bar3-server/blob/main/bar3-client/src/styles/viewStyle.css)

Actually just create it with:

CSS
.view-small-inner-wrapper {
  padding: 32px;
  max-width: 1200px;
  margin: 0 auto;
}

.view-padding-inner-wrapper {
  padding: 24px;
}
/home/runner/work/TRF_app_windows/TRF_app_windows/src/utilities/serverUrls.ts
This MODIFIED version gets the server URL from electron-store via IPC if running in Electron, otherwise falls back to env vars:

TypeScript
// Resolved asynchronously from electron-store in Electron, or from env vars in web
let _cachedServerUrl: string | null = null;

async function resolveServerUrl(): Promise<string> {
  if (_cachedServerUrl) return _cachedServerUrl;
  
  // In Electron, get the URL from the main process store
  if (typeof window !== 'undefined' && window.electronAPI) {
    try {
      const url = await window.electronAPI.getServerUrl();
      if (url) {
        _cachedServerUrl = url.replace(/\/+$/, '');
        return _cachedServerUrl;
      }
    } catch {
      // fall through
    }
  }
  
  // Fallback to env vars or window origin
  const fallback = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  _cachedServerUrl = (
    process.env.VUE_APP_API_URL ||
    process.env.VUE_APP_SERVER_URL ||
    process.env.VUE_APP_DEFAULT_SERVER_URL ||
    fallback
  ).replace(/\/+$/, '');
  return _cachedServerUrl;
}

export function clearServerUrlCache(): void {
  _cachedServerUrl = null;
}

// Sync version for backward compat - returns cached value or env fallback
function getServerUrlSync(): string {
  if (_cachedServerUrl) return _cachedServerUrl;
  const fallback = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  return (
    process.env.VUE_APP_API_URL ||
    process.env.VUE_APP_SERVER_URL ||
    process.env.VUE_APP_DEFAULT_SERVER_URL ||
    fallback
  ).replace(/\/+$/, '');
}

export const API_BASE_URL = getServerUrlSync();
export const AUTH_BASE_URL = getServerUrlSync();

export { resolveServerUrl };

export function normalizeReturnTo(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  if (!value.startsWith('/') || value.startsWith('//')) return undefined;
  return value;
}
/home/runner/work/TRF_app_windows/TRF_app_windows/src/utilities/discordAuth.ts
Modified for Electron - uses window.electronAPI.openDiscordAuth() when running in Electron:

TypeScript
import { resolveServerUrl, normalizeReturnTo } from '@/utilities/serverUrls';

interface SessionData {
  authenticated: boolean;
  isAdmin: boolean;
}

let sessionCache: SessionData | null = null;

export const discordAuth = {
  async redirectToDiscord(returnTo?: string): Promise<void> {
    const serverUrl = await resolveServerUrl();
    const url = new URL(`${serverUrl}/auth/discord`);
    const safeReturnTo = normalizeReturnTo(returnTo);
    if (safeReturnTo) {
      url.searchParams.set('returnTo', safeReturnTo);
    }

    // In Electron: open a child BrowserWindow for OAuth
    if (typeof window !== 'undefined' && window.electronAPI) {
      const result = await window.electronAPI.openDiscordAuth(url.toString());
      if (result.success) {
        // Clear session cache so we re-fetch after auth
        sessionCache = null;
        // Navigate to the callback route to finalize
        window.location.href = '/auth/discord/callback';
      }
    } else {
      window.location.href = url.toString();
    }
  },

  async getSession(): Promise<SessionData> {
    if (sessionCache !== null) return sessionCache;
    try {
      const serverUrl = await resolveServerUrl();
      const res = await fetch(`${serverUrl}/auth/session`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        const roles = Array.isArray(data?.roles) ? data.roles : [];
        const roleBasedAdmin = roles.some((role: unknown) => {
          if (typeof role === 'string') return role.toLowerCase() === 'admin';
          if (role && typeof role === 'object' && 'name' in role) {
            const name = (role as { name?: unknown }).name;
            return typeof name === 'string' && name.toLowerCase() === 'admin';
          }
          return false;
        });
        sessionCache = {
          authenticated: data?.authenticated === true,
          isAdmin: data?.isAdmin === true || roleBasedAdmin,
        };
      } else {
        sessionCache = { authenticated: false, isAdmin: false };
      }
    } catch {
      sessionCache = { authenticated: false, isAdmin: false };
    }
    return sessionCache;
  },

  async isAuthed(): Promise<boolean> {
    return (await discordAuth.getSession()).authenticated;
  },

  async logout(): Promise<void> {
    sessionCache = null;
    const serverUrl = await resolveServerUrl();
    window.location.href = `${serverUrl}/auth/logout`;
  },
};
/home/runner/work/TRF_app_windows/TRF_app_windows/src/utilities/authFetch.ts
TypeScript
import { resolveServerUrl } from '@/utilities/serverUrls';

export async function apiFetch(path: string, init: RequestInit = {}, body?: Record<string, unknown>): Promise<Response> {
  const serverUrl = await resolveServerUrl();
  const headers: Record<string, string> = {
    ...(init.headers as Record<string, string> || {}),
  };
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  return fetch(`${serverUrl}${path}`, {
    ...init,
    credentials: 'include',
    headers,
    body: body !== undefined ? JSON.stringify(body) : init.body,
  });
}
/home/runner/work/TRF_app_windows/TRF_app_windows/src/utilities/notifications.ts
New utility for triggering Windows notifications from the Vue app:

TypeScript
export interface NotificationOptions {
  title: string;
  body: string;
}

export function showNotification(options: NotificationOptions): void {
  // In Electron: use the native notification API via IPC
  if (typeof window !== 'undefined' && window.electronAPI) {
    window.electronAPI.showNotification(options);
    return;
  }
  // Web fallback: use the browser Notification API
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(options.title, { body: options.body });
  } else if ('Notification' in window && Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        new Notification(options.title, { body: options.body });
      }
    });
  }
}
/home/runner/work/TRF_app_windows/TRF_app_windows/src/utilities/v2Api.ts
TypeScript
import { apiFetch } from '@/utilities/authFetch';
import { resolveServerUrl } from '@/utilities/serverUrls';
import getAppData from '@/actions/getAppData';

type JsonValue = Record<string, unknown> | unknown[] | string | number | boolean | null;

export function hasV2Credentials(): boolean {
  return !!(localStorage.getItem('apiKey') || '').trim();
}

async function v2Fetch(path: string, init: RequestInit = {}, body?: JsonValue) {
  const serverUrl = await resolveServerUrl();
  const headers: Record<string, string> = {
    ...(init.headers as Record<string, string> || {}),
  };
  const apiKey = (localStorage.getItem('apiKey') || '').trim();
  if (apiKey) headers['x-api-key'] = apiKey;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  return fetch(`${serverUrl}${path}`, {
    ...init,
    credentials: 'include',
    headers,
    body: body !== undefined ? JSON.stringify(body) : init.body,
  });
}

export const v2Api = {
  async loginWithPwApiKey(apiKey: string): Promise<{ accountId: string }> {
    const res = await v2Fetch('/api/v2/auth/login', { method: 'POST' }, { apiKey });
    if (res.status !== 200) throw new Error((await res.json().catch(() => ({} as any)))?.error || 'Login failed');
    const data = await res.json();
    const accountId = String(data?.accountId || data?.account?.id || '').trim();
    return { accountId };
  },

  async getAutomationState(): Promise<{ enabled: boolean }> {
    try {
      const res = await v2Fetch('/api/v2/automation/state');
      if (res.status === 401 || res.status === 403) throw new Error('Unauthorized');
      if (res.status !== 200) throw new Error('Failed to load automation state');
      return res.json();
    } catch (e) {
      if (e instanceof Error && e.message === 'Unauthorized') throw e;
      const appData = await getAppData();
      if (!appData) throw new Error('Failed to load automation state via fallback');
      return { enabled: appData.applicationOn };
    }
  },

  async setAutomationState(enabled: boolean): Promise<void> {
    try {
      const res = await v2Fetch('/api/v2/automation/state', { method: 'POST' }, { enabled });
      if (res.status !== 204) throw new Error('Failed to update automation state');
    } catch (e) {
      const res = await apiFetch('/api/setApplicationState', { method: 'POST' }, { applicationOn: enabled });
      if (res.status !== 204) throw new Error('Failed to update automation state');
    }
  },

  async upsertTemplate(payload: { subject: string; bodyText?: string; bodyHtml?: string; bodyCss?: string; currentEditor?: number }): Promise<void> {
    const res = await v2Fetch('/api/v2/templates', { method: 'POST' }, payload);
    if (res.status !== 201 && res.status !== 200) {
      const data = await res.json();
      throw new Error(data?.error || `Failed to save (status: ${res.status})`);
    }
  },

  async getMyAnalytics(): Promise<{
    links: { shortId: string; url: string; clickCount: number; lastClickedAt: string | null }[];
    messages: { messageId: string; viewCount: number; lastViewedAt: string | null }[];
  }> {
    const res = await v2Fetch('/api/v2/analytics/me');
    if (res.status !== 200) throw new Error('Failed to load analytics');
    return res.json();
  },

  async sendActiveUnallied(payload: { dryRun: boolean; minCities?: number; maxCities?: number }): Promise<any> {
    const res = await v2Fetch('/api/v2/automation/send-active-unallied', { method: 'POST' }, payload);
    if (res.status === 401 || res.status === 403) throw new Error('Unauthorized: please log in from Account with your P&W API key.');
    if (res.status !== 200) {
      const data = await res.json().catch(() => ({} as any));
      throw new Error(data?.error || 'Failed to send active + unallied messages');
    }
    return res.json();
  },

  async sendActiveUnalliedDiscord(payload: { dryRun: boolean; hasDiscord: boolean; minCities?: number; maxCities?: number }): Promise<any> {
    const res = await v2Fetch('/api/v2/automation/send-active-unallied-discord', { method: 'POST' }, payload);
    if (res.status === 401 || res.status === 403) throw new Error('Unauthorized: please log in from Account with your P&W API key.');
    if (res.status !== 200) {
      const data = await res.json().catch(() => ({} as any));
      throw new Error(data?.error || 'Failed to send messages');
    }
    return res.json();
  },

  async sendByNationIds(payload: { dryRun: boolean; nationIds: string | number[] }): Promise<any> {
    const res = await v2Fetch('/api/v2/automation/send-by-nation-ids', { method: 'POST' }, payload);
    if (res.status === 401 || res.status === 403) throw new Error('Unauthorized');
    if (res.status !== 200) {
      const data = await res.json().catch(() => ({} as any));
      throw new Error(data?.error || 'Failed to send messages');
    }
    return res.json();
  }
};
/home/runner/work/TRF_app_windows/TRF_app_windows/src/utilities/pwApi.ts
TypeScript
export async function getPwApiKeyDetails(apiKey: string): Promise<{ used: number; max: number }> {
  try {
    const response = await fetch(
      `https://api.politicsandwar.com/v3?api_key=${encodeURIComponent(apiKey)}&query={me{api_key_details{requests_today,max_requests_per_day}}}`,
    );
    if (!response.ok) return { used: 0, max: 0 };
    const data = await response.json();
    const details = data?.data?.me?.api_key_details;
    if (!details) return { used: 0, max: 0 };
    return {
      used: details.requests_today ?? 0,
      max: details.max_requests_per_day ?? 0,
    };
  } catch {
    return { used: 0, max: 0 };
  }
}
/home/runner/work/TRF_app_windows/TRF_app_windows/src/utilities/toRGBA.ts
TypeScript
export default function toRGBA(color: string, alpha: number): string {
  const match = color.match(/[\d.]+/g);
  if (!match || match.length < 3) return color;
  return `rgba(${match[0]}, ${match[1]}, ${match[2]}, ${alpha})`;
}
/home/runner/work/TRF_app_windows/TRF_app_windows/src/utilities/sanitizeHtml.ts
TypeScript
export function sanitizeHtml(html: string): string {
  return html;
}
/home/runner/work/TRF_app_windows/TRF_app_windows/src/utilities/botApi.ts
TypeScript
import { resolveServerUrl } from '@/utilities/serverUrls';

export async function getBotStatus(): Promise<any> {
  const serverUrl = await resolveServerUrl();
  const res = await fetch(`${serverUrl}/api/bot/status`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to get bot status');
  return res.json();
}

export async function setBotConfig(config: any): Promise<void> {
  const serverUrl = await resolveServerUrl();
  const res = await fetch(`${serverUrl}/api/bot/config`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  if (!res.ok) throw new Error('Failed to set bot config');
}
/home/runner/work/TRF_app_windows/TRF_app_windows/src/utilities/botAuth.ts
TypeScript
export function getBotToken(): string | null {
  return localStorage.getItem('botToken');
}

export function setBotToken(token: string): void {
  localStorage.setItem('botToken', token);
}

export function clearBotToken(): void {
  localStorage.removeItem('botToken');
}

export function isBotAuthed(): boolean {
  return !!getBotToken();
}
/home/runner/work/TRF_app_windows/TRF_app_windows/src/utilities/AccountAPI.ts
TypeScript
import { resolveServerUrl } from '@/utilities/serverUrls';

export async function getAccount(): Promise<any> {
  const serverUrl = await resolveServerUrl();
  const apiKey = localStorage.getItem('apiKey') || '';
  const res = await fetch(`${serverUrl}/account`, {
    credentials: 'include',
    headers: { 'x-api-key': apiKey },
  });
  if (!res.ok) throw new Error('Failed to get account');
  return res.json();
}
/home/runner/work/TRF_app_windows/TRF_app_windows/src/utilities/googleTag.ts
TypeScript
// No-op for desktop app (Google Analytics not needed)
export function ensureGoogleTag(): void {
  // Desktop app: skip Google Analytics
}
/home/runner/work/TRF_app_windows/TRF_app_windows/src/actions/getAppData.ts
TypeScript
import { resolveServerUrl } from '@/utilities/serverUrls';

export default async function getAppData(): Promise<{
  applicationOn: boolean;
  isSetup: boolean;
  sentMessages: any[];
  apiDetails: { used: number; max: number };
  serverVersion: string;
} | null> {
  try {
    const serverUrl = await resolveServerUrl();
    const apiKey = localStorage.getItem('apiKey') || '';
    const res = await fetch(`${serverUrl}/api/appData`, {
      credentials: 'include',
      headers: apiKey ? { 'x-api-key': apiKey } : {},
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
/home/runner/work/TRF_app_windows/TRF_app_windows/src/actions/getConfig.ts
TypeScript
import { resolveServerUrl } from '@/utilities/serverUrls';

export default async function getConfig(): Promise<any> {
  try {
    const serverUrl = await resolveServerUrl();
    const apiKey = localStorage.getItem('apiKey') || '';
    const res = await fetch(`${serverUrl}/api/config`, {
      credentials: 'include',
      headers: apiKey ? { 'x-api-key': apiKey } : {},
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
/home/runner/work/TRF_app_windows/TRF_app_windows/src/actions/sendConfig.ts
TypeScript
import { resolveServerUrl } from '@/utilities/serverUrls';

export default async function sendConfig(config: any): Promise<boolean> {
  try {
    const serverUrl = await resolveServerUrl();
    const apiKey = localStorage.getItem('apiKey') || '';
    const res = await fetch(`${serverUrl}/api/setConfig`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(apiKey ? { 'x-api-key': apiKey } : {}) },
      body: JSON.stringify({ config }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
/home/runner/work/TRF_app_windows/TRF_app_windows/src/actions/setApplicationState.ts
TypeScript
import { resolveServerUrl } from '@/utilities/serverUrls';

export default async function setApplicationState(applicationOn: boolean): Promise<boolean> {
  try {
    const serverUrl = await resolveServerUrl();
    const apiKey = localStorage.getItem('apiKey') || '';
    const res = await fetch(`${serverUrl}/api/setApplicationState`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(apiKey ? { 'x-api-key': apiKey } : {}) },
      body: JSON.stringify({ applicationOn }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
/home/runner/work/TRF_app_windows/TRF_app_windows/src/actions/checkForUpdates.ts
TypeScript
import store from '@/store';

export default async function checkForUpdates(): Promise<void> {
  try {
    const res = await fetch('https://api.github.com/repos/TheonlyGlaernisch/bar3-server/releases/latest');
    if (!res.ok) return;
    const release = await res.json();
    store.commit('setNewUpdate', release);
  } catch {
    // ignore
  }
}
/home/runner/work/TRF_app_windows/TRF_app_windows/src/actions/sendMessage.ts
TypeScript
import { resolveServerUrl } from '@/utilities/serverUrls';

export default async function sendMessage(params: {
  nationID: number;
  nationName: string;
  leaderName: string;
}): Promise<boolean> {
  try {
    const serverUrl = await resolveServerUrl();
    const apiKey = localStorage.getItem('apiKey') || '';
    const res = await fetch(`${serverUrl}/api/sendMessage`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(apiKey ? { 'x-api-key': apiKey } : {}) },
      body: JSON.stringify(params),
    });
    return res.ok;
  } catch {
    return false;
  }
}
/home/runner/work/TRF_app_windows/TRF_app_windows/src/actions/getAnalyticalCampaigns.ts
TypeScript
import { resolveServerUrl } from '@/utilities/serverUrls';

export default async function getAnalyticalCampaigns(): Promise<any[]> {
  try {
    const serverUrl = await resolveServerUrl();
    const res = await fetch(`${serverUrl}/analytics/campaigns`, { credentials: 'include' });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}
/home/runner/work/TRF_app_windows/TRF_app_windows/src/actions/createNewCampaign.ts
TypeScript
import { resolveServerUrl } from '@/utilities/serverUrls';

export default async function createNewCampaign(name: string): Promise<any> {
  const serverUrl = await resolveServerUrl();
  const res = await fetch(`${serverUrl}/analytics/campaigns`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error('Failed to create campaign');
  return res.json();
}
/home/runner/work/TRF_app_windows/TRF_app_windows/src/store/index.ts
Same as bar3-client store but with server URL management:

TypeScript
import Vue from 'vue'
import Vuex from 'vuex'
import { GitHubRelease } from '@/types'
import { resolveServerUrl } from '@/utilities/serverUrls'

Vue.use(Vuex)

import analytics from './modules/analytics'

export default new Vuex.Store({
  state: {
    isApplicationOn: false,
    serverUrl: '',
    sentMessages: [] as any[],
    lastRefreshed: 0,
    packageVersion: process.env.PACKAGE_VERSION || '0',
    serverVersion: '',
    apiDetails: { used: 0, max: 0 },
    newUpdate: null as null | GitHubRelease,
    isLoggedIn: !!localStorage.getItem('apiKey'),
    isDiscordAuthed: false,
    isAdmin: false,
    isBotAuthed: false,
  },
  getters: {
    applicationOn: (state) => state.isApplicationOn,
    serverUrl: (state) => state.serverUrl,
    isLoggedIn: (state) => state.isLoggedIn,
    isDiscordAuthed: (state) => state.isDiscordAuthed,
    isAdmin: (state) => state.isAdmin,
    isBotAuthed: (state) => state.isBotAuthed,
    sentMessages: (state) => state.sentMessages,
    appVersion: (state) => state.packageVersion,
    serverVersion: (state) => state.serverVersion,
    apiDetails: (state) => state.apiDetails,
    lastRefreshed: (state) => state.lastRefreshed,
    newUpdate: (state) => state.newUpdate,
  },
  mutations: {
    setApplicationState(state, isOn: boolean) { state.isApplicationOn = isOn },
    setServerUrl(state, url: string) { state.serverUrl = url },
    setLoggedIn(state, isLoggedIn: boolean) { state.isLoggedIn = isLoggedIn },
    setDiscordAuthed(state, value: boolean) { state.isDiscordAuthed = value },
    setIsAdmin(state, value: boolean) { state.isAdmin = value },
    setBotAuthed(state, value: boolean) { state.isBotAuthed = value },
    setSentMessages(state, msgs: any[]) { state.sentMessages = msgs },
    setAPIDetails(state, details: { used: number; max: number }) { state.apiDetails = details },
    setLastRefreshed(state, time: number) { state.lastRefreshed = time },
    setNewUpdate(state, update: GitHubRelease) { state.newUpdate = update },
    setServerVersion(state, v: string) { state.serverVersion = v },
  },
  actions: {
    async loadServerUrl({ commit }) {
      const url = await resolveServerUrl();
      commit('setServerUrl', url);
    }
  },
  modules: { analytics }
})
/home/runner/work/TRF_app_windows/TRF_app_windows/src/store/modules/analytics.ts
TypeScript
export default {
  namespaced: true,
  state: {
    campaigns: [] as any[],
  },
  getters: {
    campaigns: (state: any) => state.campaigns,
  },
  mutations: {
    setCampaigns(state: any, campaigns: any[]) { state.campaigns = campaigns },
  },
  actions: {},
}
/home/runner/work/TRF_app_windows/TRF_app_windows/src/types.ts
(Same as bar3-client src/types.ts - the full content from the analysis above. This is a complex file, create it with all the interfaces.)

TypeScript
import toRGBA from '@/utilities/toRGBA'

export interface Config {
  apiKey?: string
  messageSubject?: string
  messageHTML?: string
  advancedRaw?: { html: string; css: string }
  analyticsEnabled?: boolean
  currentEditor?: number
  updatePeriodMilliseconds?: number
  queueTime?: number
  configVersion?: string
}

export class DefaultConfig implements Config {
  apiKey = ''
  messageSubject = ''
  messageHTML = ''
  advancedRaw = { html: '', css: '' }
  analyticsEnabled = false
  currentEditor = 0
  updatePeriodMilliseconds = 0
}

export interface Message {
  sentTimeMilliseconds: number
  nation: NationAPICall.Nation
  successful: boolean
  error?: string
}

export namespace NationAPICall {
  export interface Nation {
    nation_id: number
    nation: string
    leader: string
    continent: number
    war_policy: number
    domestic_policy: number
    color: number
    alliance_id: number
    alliance: string
    alliance_position: number
    cities: number
    offensive_wars: number
    defensive_wars: number
    score: number
    v_mode: boolean
    v_mode_turns: number
    beige_turns: number
    last_active: string
    founded: string
    soldiers: number
    tanks: number
    aircraft: number
    ships: number
    missiles: number
    nukes: number
  }
}

export interface SideBarItem {
  title: string
  icon: string
  path: string
}

export namespace VueLineChart {
  export const color = [
    'rgba(187, 96, 109, 0.8)',
    'rgba(177, 103, 135, 0.8)',
    'rgba(154, 115, 157, 0.8)',
    'rgba(121, 128, 170, 0.8)',
    'rgba(81, 139, 170, 0.8)',
    'rgba(42, 147, 158, 0.8)',
    'rgba(35, 153, 136, 0.8)',
    'rgba(67, 155, 109, 0.8)',
    'rgba(102, 154, 83, 0.8)',
    'rgba(137, 150, 62, 0.8)',
    'rgba(170, 142, 56, 0.8)',
  ]

  export interface ChartData {
    labels: string[]
    datasets: Dataset[]
  }

  export class ChartData implements ChartData {
    labels: string[] = []
    datasets: Dataset[] = []
  }

  export interface Dataset {
    label: string
    data: (number | string | { x: string | number; y: string | number })[]
    lineTension: number
    borderColor: string
    backgroundColor: string
    fill: boolean
    pointHitRadius: number
    pointRadius: number
  }

  export class Dataset implements Dataset {
    label = ''
    data: (number | string | { x: string | number; y: string | number })[] = []
    lineTension = 0
    borderColor = color[0]
    backgroundColor = toRGBA(color[0], 0.3)
    fill = true
    pointHitRadius = 5
    pointRadius = 0
  }
}

export interface GitHubRelease {
  url: string
  html_url: string
  tag_name: string
  name: string
  body: string
  draft: boolean
  prerelease: boolean
  created_at: string
  published_at: string
}
/home/runner/work/TRF_app_windows/TRF_app_windows/src/router/index.ts
TypeScript
import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import Home from '@/views/Home.vue'
import Configuration from '@/views/Configuration.vue'
import MessageCreator from '@/views/MessageCreator.vue'
import Analytics from '@/views/Analytics.vue'
import AccountManager from '@/components/AccountManager.vue'
import About from '@/views/About.vue'
import Help from '@/views/Help.vue'
import DiscordLogin from '@/views/DiscordLogin.vue'
import DiscordCallback from '@/views/DiscordCallback.vue'
import BotPanel from '@/views/BotPanel.vue'
import Settings from '@/views/Settings.vue'
import { discordAuth } from '@/utilities/discordAuth'
import { normalizeReturnTo } from '@/utilities/serverUrls'

Vue.use(VueRouter)

const DISCORD_PUBLIC_PATHS = ['/discord-login', '/auth/discord/callback', '/settings']

const routes: Array<RouteConfig> = [
  { path: '/', redirect: '/dashboard' },
  { path: '/dashboard', name: 'Dashboard', component: Home },
  { path: '/automation', name: 'Automation', component: MessageCreator },
  { path: '/config', name: 'Configuration', component: Configuration },
  { path: '/message-creator', name: 'Message Creator', component: MessageCreator },
  { path: '/analytics', name: 'Analytics', component: Analytics },
  { path: '/account', name: 'Account', component: AccountManager },
  { path: '/about', name: 'About', component: About },
  { path: '/help', name: 'Help', component: Help },
  { path: '/settings', name: 'Settings', component: Settings },
  { path: '/discord-login', name: 'Discord Login', component: DiscordLogin },
  { path: '/auth/discord/callback', name: 'Discord Callback', component: DiscordCallback },
  { path: '/bot', name: 'Bot Panel', component: BotPanel, meta: { requiresBotAuth: true } },
]

const router = new VueRouter({
  mode: 'hash', // Use hash mode for Electron (no server-side routing needed)
  routes
})

router.beforeEach(async (to, _from, next) => {
  if (DISCORD_PUBLIC_PATHS.includes(to.path)) {
    next()
    return
  }

  const authed = await discordAuth.isAuthed()
  if (!authed) {
    next(`/discord-login?returnTo=${encodeURIComponent(to.fullPath)}`)
    return
  }

  if (to.meta?.requiresBotAuth) {
    const session = await discordAuth.getSession()
    if (!session.isAdmin) {
      next('/dashboard')
      return
    }
  }

  if (to.query.returnTo) {
    const returnTo = normalizeReturnTo(to.query.returnTo)
    if (returnTo) {
      next({ path: returnTo, replace: true })
      return
    }
  }

  next()
})

export default router
/home/runner/work/TRF_app_windows/TRF_app_windows/src/App.vue
Vue
<template>
  <v-app>
    <template v-if="isDiscordAuthed">
      <v-app-bar app color="#1A1A1A" dark flat>
        <v-app-bar-nav-icon
          v-if="$vuetify.breakpoint.mobile"
          @click.stop="sideBarOpen = !sideBarOpen"
        />
        <div class="d-flex align-center">
          <div class="ml-2 white--text text-h6 font-weight-medium">TRF Bar 3</div>
        </div>
        <v-spacer />
        <v2-automation-toggle class="mr-2" />
        <v-btn icon @click="$router.push('/settings')" title="Settings">
          <v-icon>mdi-cog</v-icon>
        </v-btn>
      </v-app-bar>
      <side-bar v-model="sideBarOpen" :disabled="false" />
    </template>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import SideBar from '@/components/SideBar.vue'
import V2AutomationToggle from '@/components/V2AutomationToggle.vue'
import { hasV2Credentials, v2Api } from '@/utilities/v2Api'
import { discordAuth } from '@/utilities/discordAuth'
import { resolveServerUrl, clearServerUrlCache } from '@/utilities/serverUrls'

@Component({
  name: 'App',
  components: { SideBar, V2AutomationToggle }
})
export default class App extends Vue {
  sideBarOpen = false

  get isDiscordAuthed(): boolean {
    return this.$store.getters.isDiscordAuthed
  }

  async mounted() {
    // Load server URL from electron-store
    if (typeof window !== 'undefined' && window.electronAPI) {
      const url = await window.electronAPI.getServerUrl()
      this.$store.commit('setServerUrl', url)
    }

    const session = await discordAuth.getSession()
    this.$store.commit('setDiscordAuthed', session.authenticated)
    this.$store.commit('setIsAdmin', session.isAdmin)

    if (!session.authenticated) return

    if (hasV2Credentials()) {
      try {
        const state = await v2Api.getAutomationState()
        this.$store.commit('setApplicationState', !!state.enabled)
      } catch { /* ignore */ }
    }
  }
}
</script>

<style>
@import url('styles/viewStyle.css');

.v-toolbar__content {
  border-bottom: thin solid rgba(255, 107, 0, 0.3) !important;
}
.v-card { border-radius: 12px !important; }
.v-text-field .v-input__control .v-input__slot { border-radius: 8px !important; }
.v-btn:not(.v-btn--fab):not(.v-btn--icon) { border-radius: 8px !important; }
</style>
/home/runner/work/TRF_app_windows/TRF_app_windows/src/views/Settings.vue
NEW VIEW - allows user to configure server URL:

Vue
<template>
  <div class="view-small-inner-wrapper view-padding-inner-wrapper">
    <h1 class="mb-2">Settings</h1>
    <div class="text-subtitle-1 grey--text text--lighten-1 mb-6">Configure your Bar 3 desktop application.</div>

    <v-card class="pa-6" dark color="#1A1A1A">
      <div class="text-h6 mb-4">Server Connection</div>
      <v-text-field
        v-model="serverUrl"
        label="Bar 3 Server URL"
        placeholder="https://your-bar3-server.com"
        outlined
        dense
        :rules="[urlRule]"
        hint="The URL of your bar3-server instance"
        persistent-hint
        class="mb-4"
      />
      <v-btn color="primary" :loading="saving" @click="saveServerUrl">
        <v-icon left>mdi-content-save</v-icon>
        Save
      </v-btn>
      <v-alert v-if="saveSuccess" type="success" dense class="mt-4">
        Server URL saved! Reload the app to apply.
      </v-alert>
      <v-alert v-if="saveError" type="error" dense class="mt-4">
        {{ saveError }}
      </v-alert>
    </v-card>

    <v-card class="pa-6 mt-4" dark color="#1A1A1A">
      <div class="text-h6 mb-4">Notifications</div>
      <v-switch
        v-model="notificationsEnabled"
        label="Enable Desktop Notifications"
        color="primary"
        @change="toggleNotifications"
      />
      <v-btn color="secondary" outlined small @click="testNotification" class="mt-2">
        <v-icon left small>mdi-bell</v-icon>
        Test Notification
      </v-btn>
    </v-card>

    <v-card class="pa-6 mt-4" dark color="#1A1A1A">
      <div class="text-h6 mb-2">Account</div>
      <v-btn color="error" outlined @click="logout">
        <v-icon left>mdi-logout</v-icon>
        Sign Out (Discord)
      </v-btn>
    </v-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { discordAuth } from '@/utilities/discordAuth'
import { clearServerUrlCache } from '@/utilities/serverUrls'
import { showNotification } from '@/utilities/notifications'

@Component
export default class Settings extends Vue {
  serverUrl = ''
  saving = false
  saveSuccess = false
  saveError = ''
  notificationsEnabled = true

  urlRule(v: string): boolean | string {
    try {
      new URL(v)
      return true
    } catch {
      return 'Please enter a valid URL'
    }
  }

  async created() {
    if (typeof window !== 'undefined' && window.electronAPI) {
      this.serverUrl = await window.electronAPI.getServerUrl()
    }
    this.notificationsEnabled = localStorage.getItem('notificationsEnabled') !== 'false'
  }

  async saveServerUrl() {
    this.saving = true
    this.saveSuccess = false
    this.saveError = ''
    try {
      if (typeof window !== 'undefined' && window.electronAPI) {
        await window.electronAPI.setServerUrl(this.serverUrl)
        clearServerUrlCache()
        this.$store.commit('setServerUrl', this.serverUrl)
        this.saveSuccess = true
      }
    } catch (e: any) {
      this.saveError = e.message || 'Failed to save'
    } finally {
      this.saving = false
    }
  }

  toggleNotifications(value: boolean) {
    localStorage.setItem('notificationsEnabled', String(value))
  }

  testNotification() {
    showNotification({
      title: 'Bar 3',
      body: 'Desktop notifications are working!'
    })
  }

  async logout() {
    await discordAuth.logout()
  }
}
</script>
/home/runner/work/TRF_app_windows/TRF_app_windows/src/views/DiscordLogin.vue
Vue
<template>
  <v-app style="background: #0f0f0f;">
    <v-main>
      <v-container class="fill-height" fluid>
        <v-row align="center" justify="center">
          <v-col cols="12" sm="8" md="5" lg="4">
            <v-card class="discord-login-card pa-8" dark color="#1A1A1A">
              <div class="text-center mb-6">
                <div class="text-h5 white--text font-weight-bold mb-1">TRF Bar 3</div>
                <div class="text--secondary body-2">
                  You must verify your Discord membership before accessing this application.
                </div>
              </div>

              <v-alert v-if="error" type="error" dense class="mb-4">
                {{ error }}
                <div v-if="errorHint" class="caption mt-1">{{ errorHint }}</div>
                <div v-if="errorCode" class="caption mt-1">Error code: {{ errorCode }}</div>
              </v-alert>

              <v-btn block large color="#5865F2" dark class="discord-btn" :loading="loading" @click="login">
                <v-icon left>mdi-discord</v-icon>
                Login with Discord
              </v-btn>

              <div class="text-center mt-4 caption text--secondary">
                Access is restricted to authorized Discord members only.
              </div>
              <div class="text-center mt-2">
                <v-btn text small color="grey" @click="$router.push('/settings')">
                  <v-icon left small>mdi-cog</v-icon>
                  Server Settings
                </v-btn>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { discordAuth } from '@/utilities/discordAuth'
import { normalizeReturnTo } from '@/utilities/serverUrls'

@Component
export default class DiscordLogin extends Vue {
  error = ''
  errorCode = ''
  errorHint = ''
  loading = false

  private mapAuthError(rawError: string): string {
    this.errorCode = ''
    this.errorHint = ''
    const normalized = rawError.toLowerCase()
    if (normalized.startsWith('role_check_failed')) {
      this.errorCode = rawError
      this.errorHint = 'If you already have the correct role, this is usually a temporary backend issue.'
      return 'Role verification is temporarily unavailable. Please try again in a moment.'
    }
    if (normalized === 'no_role') return 'Your Discord account does not currently have access to Bar 3.'
    if (normalized === 'auth_failed') return 'Discord sign-in failed. Please try again.'
    if (normalized === 'no_code') return 'No authorization code received from Discord. Please try again.'
    return rawError
  }

  created() {
    discordAuth.isAuthed().then(authed => {
      if (authed) this.$router.replace('/')
    })
    const queryError = this.$route.query.error
    if (typeof queryError === 'string' && queryError) {
      this.error = this.mapAuthError(queryError)
    }
  }

  async login() {
    this.loading = true
    this.error = ''
    try {
      await discordAuth.redirectToDiscord(normalizeReturnTo(this.$route.query.returnTo))
      // After redirectToDiscord returns (Electron), re-check auth
      const authed = await discordAuth.isAuthed()
      if (authed) {
        this.$store.commit('setDiscordAuthed', true)
        const target = normalizeReturnTo(this.$route.query.returnTo) || '/dashboard'
        this.$router.replace(target)
      } else {
        this.error = 'Authentication failed. Please try again.'
      }
    } catch (e: any) {
      this.error = e.message || 'An error occurred during login.'
    } finally {
      this.loading = false
    }
  }
}
</script>

<style scoped>
.discord-login-card {
  border: 1px solid rgba(88, 101, 242, 0.3) !important;
  border-radius: 16px !important;
}
.discord-btn {
  border-radius: 8px !important;
  font-weight: 600;
  letter-spacing: 0.03em;
}
</style>
/home/runner/work/TRF_app_windows/TRF_app_windows/src/views/DiscordCallback.vue
Vue
<template>
  <v-app style="background: #0f0f0f;">
    <v-main>
      <v-container class="fill-height" fluid>
        <v-row align="center" justify="center">
          <v-col cols="12" sm="8" md="5" lg="4">
            <v-card class="pa-8" dark color="#1A1A1A" style="border-radius: 16px !important;">
              <div class="text-center">
                <v-progress-circular indeterminate color="#5865F2" size="56" class="mb-4" />
                <div class="text-h6 white--text font-weight-medium mb-2">Signing you in…</div>
                <div class="body-2 text--secondary">Please wait a moment.</div>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { discordAuth } from '@/utilities/discordAuth'
import { normalizeReturnTo } from '@/utilities/serverUrls'

@Component
export default class DiscordCallback extends Vue {
  async created() {
    const authed = await discordAuth.isAuthed()
    if (!authed) {
      this.$router.replace('/discord-login?error=' + encodeURIComponent('Sign-in failed. Please try again.'))
      return
    }
    this.$store.commit('setDiscordAuthed', true)
    const target = normalizeReturnTo(this.$route.query.returnTo) || '/'
    this.$router.replace(target)
  }
}
</script>
/home/runner/work/TRF_app_windows/TRF_app_windows/src/views/Home.vue
Vue
<template>
  <div class="home view-small-inner-wrapper view-padding-inner-wrapper">
    <h1>Dashboard</h1>
    <div class="text-subtitle-1 grey--text text--lighten-1">Last refreshed {{ refreshedSecondsAgo }} second{{ refreshedSecondsAgo !== 1 ? 's' : '' }} ago</div>
    <div class="dashboard-cards-container mt-6">
      <graph-card class="dashboard-card" graphType="messagesSentOverTime" />
      <graph-card class="dashboard-card" graphType="apiRequests" />
      <messages-sent-card class="dashboard-card" />
    </div>
    <v-btn fab fixed color="primary" dark bottom right @click="refreshData">
      <v-icon>mdi-refresh</v-icon>
    </v-btn>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import GraphCard from '@/components/GraphCard.vue'
import MessagesSentCard from '@/components/MessagesSentCard.vue'
import getAppData from '@/actions/getAppData'
import { getPwApiKeyDetails } from '@/utilities/pwApi'
import { showNotification } from '@/utilities/notifications'
import checkForUpdates from '@/actions/checkForUpdates'

@Component({ components: { GraphCard, MessagesSentCard } })
export default class Home extends Vue {
  refreshedSecondsAgo = 0

  get lastRefreshed() { return this.$store.getters.lastRefreshed }

  updateLastRefreshed() {
    setTimeout(() => {
      this.updateLastRefreshed()
      this.refreshedSecondsAgo = Math.floor((Date.now() - this.lastRefreshed) / 1000)
    }, 1000)
  }

  async fetchApiDetails() {
    const apiKey = localStorage.getItem('apiKey')
    if (!apiKey) return

    const data = await getAppData()
    if (data) {
      this.$store.commit('setSentMessages', data.sentMessages)
      // Show notification if automation sent new messages
      if (data.sentMessages && data.sentMessages.length > 0) {
        const prevCount = this.$store.getters.sentMessages.length
        if (data.sentMessages.length > prevCount && prevCount > 0) {
          showNotification({
            title: 'Bar 3 - Messages Sent',
            body: `${data.sentMessages.length - prevCount} new message(s) sent by automation.`
          })
        }
      }
    }

    const details = await getPwApiKeyDetails(apiKey).catch(() => ({ used: 0, max: 0 }))
    if (details.max > 0) {
      this.$store.commit('setAPIDetails', details)
    } else if (data && data.apiDetails.max > 0) {
      this.$store.commit('setAPIDetails', data.apiDetails)
    }
  }

  async refreshData() {
    this.$store.commit('setLastRefreshed', Date.now())
    await this.fetchApiDetails()
  }

  async mounted() {
    this.updateLastRefreshed()
    await this.refreshData()
    await checkForUpdates()
  }
}
</script>

<style scoped>
.dashboard-cards-container {
  display: flex;
  flex-wrap: wrap;
}
.dashboard-card {
  margin-top: 16px;
}
@media only screen and (min-width: 450px) {
  .dashboard-card { margin-right: 16px; }
}
</style>
Now for the remaining Vue components, create simplified versions that compile.
For each component listed below, fetch the original source from the bar3-client GitHub repo and use them. But since you can't access the internet, create reasonable stubs.

Create these component files (simplified stubs that will compile but look similar):

/home/runner/work/TRF_app_windows/TRF_app_windows/src/components/SideBar.vue
Vue
<template>
  <v-navigation-drawer v-model="open" app dark color="#141414" :mini-variant="!open && !$vuetify.breakpoint.mobile">
    <v-list dense nav>
      <v-list-item v-for="item in items" :key="item.title" :to="item.path" link>
        <v-list-item-icon>
          <v-icon>{{ item.icon }}</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'

@Component
export default class SideBar extends Vue {
  @Prop({ default: false }) value!: boolean
  @Prop({ default: false }) disabled!: boolean

  get open(): boolean { return this.value }
  set open(val: boolean) { this.$emit('input', val) }

  get isAdmin(): boolean { return this.$store.getters.isAdmin }

  get items() {
    const base = [
      { title: 'Dashboard', icon: 'mdi-view-dashboard', path: '/dashboard' },
      { title: 'Message Creator', icon: 'mdi-email-edit', path: '/message-creator' },
      { title: 'Configuration', icon: 'mdi-tune', path: '/config' },
      { title: 'Analytics', icon: 'mdi-chart-line', path: '/analytics' },
      { title: 'Account', icon: 'mdi-account', path: '/account' },
      { title: 'Help', icon: 'mdi-help-circle', path: '/help' },
      { title: 'About', icon: 'mdi-information', path: '/about' },
      { title: 'Settings', icon: 'mdi-cog', path: '/settings' },
    ]
    if (this.isAdmin) {
      base.push({ title: 'Bot Panel', icon: 'mdi-robot', path: '/bot' })
    }
    return base
  }
}
</script>
/home/runner/work/TRF_app_windows/TRF_app_windows/src/components/V2AutomationToggle.vue
Vue
<template>
  <v-switch
    v-model="applicationOn"
    :label="applicationOn ? 'Automation ON' : 'Automation OFF'"
    color="primary"
    hide-details
    dense
    class="mt-0"
    @change="toggleAutomation"
  />
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { v2Api } from '@/utilities/v2Api'

@Component
export default class V2AutomationToggle extends Vue {
  get applicationOn(): boolean { return this.$store.getters.applicationOn }
  set applicationOn(val: boolean) { this.$store.commit('setApplicationState', val) }

  async toggleAutomation(val: boolean) {
    try {
      await v2Api.setAutomationState(val)
    } catch (e) {
      // revert on error
      this.$store.commit('setApplicationState', !val)
    }
  }
}
</script>
/home/runner/work/TRF_app_windows/TRF_app_windows/src/components/GraphCard.vue
Vue
<template>
  <v-card class="pa-4" dark color="#1A1A1A" min-width="280">
    <div class="text-subtitle-1 mb-2">{{ title }}</div>
    <div class="text-h4 primary--text">{{ value }}</div>
  </v-card>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

@Component
export default class GraphCard extends Vue {
  @Prop({ default: 'messagesSentOverTime' }) graphType!: string

  get title(): string {
    if (this.graphType === 'apiRequests') return 'API Requests'
    return 'Messages Sent'
  }

  get value(): string {
    if (this.graphType === 'apiRequests') {
      const d = this.$store.getters.apiDetails
      return `${d.used} / ${d.max}`
    }
    return String(this.$store.getters.sentMessages.length)
  }
}
</script>
/home/runner/work/TRF_app_windows/TRF_app_windows/src/components/MessagesSentCard.vue
Vue
<template>
  <v-card class="pa-4" dark color="#1A1A1A" min-width="280">
    <div class="text-subtitle-1 mb-2">Recent Messages</div>
    <v-list dense>
      <v-list-item v-for="(msg, i) in recentMessages" :key="i">
        <v-list-item-content>
          <v-list-item-title>{{ msg.nation && msg.nation.nation }}</v-list-item-title>
          <v-list-item-subtitle :class="msg.successful ? 'success--text' : 'error--text'">
            {{ msg.successful ? 'Sent' : 'Failed: ' + msg.error }}
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list>
    <div v-if="!recentMessages.length" class="text--secondary">No messages sent yet.</div>
  </v-card>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class MessagesSentCard extends Vue {
  get recentMessages() {
    return (this.$store.getters.sentMessages || []).slice(-5).reverse()
  }
}
</script>
/home/runner/work/TRF_app_windows/TRF_app_windows/src/components/AccountManager.vue
Vue
<template>
  <div class="view-small-inner-wrapper view-padding-inner-wrapper">
    <h1 class="mb-4">Account</h1>
    <v-card class="pa-6" dark color="#1A1A1A">
      <div class="text-h6 mb-4">Politics & War API Key</div>
      <v-text-field
        v-model="apiKey"
        label="API Key"
        outlined
        dense
        :type="showKey ? 'text' : 'password'"
        :append-icon="showKey ? 'mdi-eye-off' : 'mdi-eye'"
        @click:append="showKey = !showKey"
        class="mb-2"
      />
      <v-btn color="primary" @click="saveApiKey">
        <v-icon left>mdi-content-save</v-icon>
        Save API Key
      </v-btn>
      <v-alert v-if="saved" type="success" dense class="mt-4">API key saved!</v-alert>
    </v-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class AccountManager extends Vue {
  apiKey = ''
  showKey = false
  saved = false

  created() {
    this.apiKey = localStorage.getItem('apiKey') || ''
  }

  saveApiKey() {
    localStorage.setItem('apiKey', this.apiKey)
    this.$store.commit('setLoggedIn', !!this.apiKey)
    this.saved = true
    setTimeout(() => { this.saved = false }, 3000)
  }
}
</script>
/home/runner/work/TRF_app_windows/TRF_app_windows/src/components/UpdateAvailableBanner.vue
Vue
<template>
  <v-alert v-if="newUpdate" type="info" dense dismissible>
    New version {{ newUpdate.tag_name }} available!
    <a :href="newUpdate.html_url" target="_blank">View release</a>
  </v-alert>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class UpdateAvailableBanner extends Vue {
  get newUpdate() { return this.$store.getters.newUpdate }
}
</script>
/home/runner/work/TRF_app_windows/TRF_app_windows/src/views/Configuration.vue
Vue
<template>
  <div class="view-small-inner-wrapper view-padding-inner-wrapper">
    <h1 class="mb-4">Configuration</h1>
    <v-card class="pa-6" dark color="#1A1A1A">
      <div class="text-h6 mb-4">Application Settings</div>
      <v-text-field v-model="config.messageSubject" label="Message Subject" outlined dense class="mb-2" />
      <v-btn color="primary" :loading="saving" @click="save">
        <v-icon left>mdi-content-save</v-icon>
        Save Configuration
      </v-btn>
      <v-alert v-if="saved" type="success" dense class="mt-4">Configuration saved!</v-alert>
    </v-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import getConfig from '@/actions/getConfig'
import sendConfig from '@/actions/sendConfig'

@Component
export default class Configuration extends Vue {
  config: any = { messageSubject: '' }
  saving = false
  saved = false

  async created() {
    const cfg = await getConfig()
    if (cfg) this.config = cfg
  }

  async save() {
    this.saving = true
    await sendConfig(this.config)
    this.saving = false
    this.saved = true
    setTimeout(() => { this.saved = false }, 3000)
  }
}
</script>
/home/runner/work/TRF_app_windows/TRF_app_windows/src/views/MessageCreator.vue
Vue
<template>
  <div class="view-small-inner-wrapper view-padding-inner-wrapper">
    <h1 class="mb-2">Message Creator</h1>
    <div class="text-subtitle-1 grey--text text--lighten-1 mb-4">Create and configure your recruitment message.</div>
    <v-card class="pa-6" dark color="#1A1A1A">
      <v-text-field v-model="subject" label="Subject" outlined dense class="mb-2" />
      <v-textarea v-model="body" label="Message Body (HTML)" outlined rows="10" class="mb-4" />
      <v-btn color="primary" :loading="saving" @click="save">
        <v-icon left>mdi-content-save</v-icon>
        Save Message
      </v-btn>
      <v-alert v-if="saved" type="success" dense class="mt-4">Message saved!</v-alert>
      <v-alert v-if="error" type="error" dense class="mt-4">{{ error }}</v-alert>
    </v-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import getConfig from '@/actions/getConfig'
import sendConfig from '@/actions/sendConfig'

@Component
export default class MessageCreator extends Vue {
  subject = ''
  body = ''
  saving = false
  saved = false
  error = ''

  async created() {
    const cfg = await getConfig()
    if (cfg) {
      this.subject = cfg.messageSubject || ''
      this.body = cfg.messageHTML || ''
    }
  }

  async save() {
    this.saving = true
    this.error = ''
    const ok = await sendConfig({ messageSubject: this.subject, messageHTML: this.body })
    this.saving = false
    if (ok) {
      this.saved = true
      setTimeout(() => { this.saved = false }, 3000)
    } else {
      this.error = 'Failed to save. Check your server connection.'
    }
  }
}
</script>
/home/runner/work/TRF_app_windows/TRF_app_windows/src/views/Analytics.vue
Vue
<template>
  <div class="view-small-inner-wrapper view-padding-inner-wrapper">
    <h1 class="mb-4">Analytics</h1>
    <v-progress-circular v-if="loading" indeterminate color="primary" />
    <div v-else>
      <v-card class="pa-4 mb-4" dark color="#1A1A1A">
        <div class="text-h6 mb-2">Link Clicks</div>
        <v-list dense>
          <v-list-item v-for="link in analytics.links" :key="link.shortId">
            <v-list-item-content>
              <v-list-item-title>{{ link.shortId }}: {{ link.clickCount }} clicks</v-list-item-title>
              <v-list-item-subtitle>{{ link.url }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>
        <div v-if="!analytics.links.length" class="text--secondary">No link analytics yet.</div>
      </v-card>
      <v-card class="pa-4" dark color="#1A1A1A">
        <div class="text-h6 mb-2">Message Views</div>
        <v-list dense>
          <v-list-item v-for="msg in analytics.messages" :key="msg.messageId">
            <v-list-item-content>
              <v-list-item-title>{{ msg.messageId }}: {{ msg.viewCount }} views</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
        <div v-if="!analytics.messages.length" class="text--secondary">No message analytics yet.</div>
      </v-card>
    </div>
    <v-alert v-if="error" type="error" dense class="mt-4">{{ error }}</v-alert>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { v2Api } from '@/utilities/v2Api'

@Component
export default class Analytics extends Vue {
  loading = true
  error = ''
  analytics = { links: [] as any[], messages: [] as any[] }

  async created() {
    try {
      this.analytics = await v2Api.getMyAnalytics()
    } catch (e: any) {
      this.error = e.message || 'Failed to load analytics'
    } finally {
      this.loading = false
    }
  }
}
</script>
/home/runner/work/TRF_app_windows/TRF_app_windows/src/views/About.vue
Vue
<template>
  <div class="view-small-inner-wrapper view-padding-inner-wrapper">
    <h1 class="mb-4">About</h1>
    <v-card class="pa-6" dark color="#1A1A1A">
      <div class="text-h5 mb-2">TRF Bar 3 Desktop</div>
      <div class="text-subtitle-1 grey--text mb-4">Version {{ version }}</div>
      <div class="body-1 mb-4">
        Bar 3 is an automatic recruitment application for Politics and War.
        This is the Windows desktop version, connecting to the bar3-server API.
      </div>
      <v-divider class="mb-4" />
      <div class="caption grey--text">
        Original bar3-server by bsnk-dev / TheonlyGlaernisch.<br>
        Desktop app wrapper for Windows with Discord auth and notifications.
      </div>
    </v-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class About extends Vue {
  get version() { return this.$store.getters.appVersion }
}
</script>
/home/runner/work/TRF_app_windows/TRF_app_windows/src/views/Help.vue
Vue
<template>
  <div class="view-small-inner-wrapper view-padding-inner-wrapper">
    <h1 class="mb-4">Help</h1>
    <v-card class="pa-6" dark color="#1A1A1A">
      <div class="text-h6 mb-2">Getting Started</div>
      <ol class="body-1" style="line-height:2">
        <li>Go to <b>Settings</b> and configure your bar3-server URL.</li>
        <li>Log in with Discord via the login page.</li>
        <li>Go to <b>Account</b> and enter your Politics & War API key.</li>
        <li>Go to <b>Message Creator</b> to set up your recruitment message.</li>
        <li>Enable automation using the toggle in the top bar.</li>
      </ol>
      <v-divider class="my-4" />
      <div class="text-h6 mb-2">Notifications</div>
      <p class="body-1">
        Desktop notifications will appear when messages are sent by the automation.
        You can test and toggle notifications in <b>Settings</b>.
      </p>
    </v-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class Help extends Vue {}
</script>
/home/runner/work/TRF_app_windows/TRF_app_windows/src/views/BotPanel.vue
Vue
<template>
  <div class="view-small-inner-wrapper view-padding-inner-wrapper">
    <h1 class="mb-4">Bot Panel</h1>
    <v-card class="pa-6" dark color="#1A1A1A">
      <div class="text-subtitle-1 grey--text">Admin-only bot management panel.</div>
    </v-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class BotPanel extends Vue {}
</script>
/home/runner/work/TRF_app_windows/TRF_app_windows/public/index.html
HTML
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width,initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline' 'unsafe-eval' data: https: http:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self' https: http: ws: wss:; img-src 'self' data: https: http:;">
    <link rel="icon" href="<%= BASE_URL %>favicon.ico">
    <title>TRF Bar 3</title>
  </head>
  <body>
    <noscript>
      <strong>TRF Bar 3 requires JavaScript to run.</strong>
    </noscript>
    <div id="app"></div>
  </body>
</html>
README.md (overwrite existing)
Markdown
# TRF Bar 3 - Windows Desktop App

A Windows desktop application for Bar 3, the automatic recruitment tool for Politics and War. Built with Electron + Vue 2 + Vuetify 2.

## Features
- Full Bar 3 UI ported from bar3-client
- Discord OAuth authentication via popup window
- Windows desktop notifications for automation events
- Configurable bar3-server API connection
- System tray support

## Setup

1. Install dependencies:
npm install

Code

2. Configure your bar3-server URL in the app Settings, or set a default in `.env`:
VUE_APP_DEFAULT_SERVER_URL=https://your-bar3-server.com

Code

3. Run in development:
npm run electron:serve

Code

4. Build for Windows:
npm run electron:build

Code

## Architecture

- `src/background.ts` - Electron main process (window, tray, IPC, Discord auth popup, notifications)
- `src/preload.ts` - Secure IPC bridge between main and renderer
- `src/utilities/discordAuth.ts` - Discord OAuth flow adapted for Electron
- `src/utilities/notifications.ts` - Cross-platform notification helper
- `src/views/Settings.vue` - Server URL and notification settings

## Connecting to bar3-server

The app connects to your bar3-server instance. Configure the server URL in Settings. The app supports:
- `/api/*` - Legacy API endpoints
- `/api/v2/*` - V2 API endpoints  
- `/auth/discord` - Discord OAuth
- `/analytics` - Analytics endpoints

## Discord Authentication

The app uses Discord OAuth via a popup BrowserWindow. When you click "Login with Discord", an OAuth window opens in the bar3-server's OAuth flow. After successful authentication, the popup closes and the app becomes authenticated.
After creating all files, run these commands to install dependencies:
bash
cd /home/runner/work/TRF_app_windows/TRF_app_windows
npm install
If npm install fails, just report the error and the files that were created.

IMPORTANT: Create ALL the files listed above. The critical ones are:

package.json
vue.config.js
tsconfig.json
babel.config.js
src/background.ts
src/preload.ts
src/main.ts
src/App.vue
src/router/index.ts
src/store/index.ts
src/store/modules/analytics.ts
src/plugins/vuetify.ts
src/types.ts
src/global.d.ts
src/shims-vue.d.ts
src/styles/viewStyle.css
src/utilities/serverUrls.ts
src/utilities/discordAuth.ts
src/utilities/authFetch.ts
src/utilities/v2Api.ts
src/utilities/notifications.ts
src/utilities/pwApi.ts
src/utilities/toRGBA.ts
src/utilities/sanitizeHtml.ts
src/utilities/botApi.ts
src/utilities/botAuth.ts
src/utilities/AccountAPI.ts
src/utilities/googleTag.ts
src/actions/getAppData.ts
src/actions/getConfig.ts
src/actions/sendConfig.ts
src/actions/setApplicationState.ts
src/actions/sendMessage.ts
src/actions/checkForUpdates.ts
src/actions/getAnalyticalCampaigns.ts
src/actions/createNewCampaign.ts
src/components/SideBar.vue
src/components/V2AutomationToggle.vue
src/components/GraphCard.vue
src/components/MessagesSentCard.vue
src/components/AccountManager.vue
src/components/UpdateAvailableBanner.vue
src/views/Settings.vue
src/views/DiscordLogin.vue
src/views/DiscordCallback.vue
src/views/Home.vue
src/views/Configuration.vue
src/views/MessageCreator.vue
src/views/Analytics.vue
src/views/About.vue
src/views/Help.vue
src/views/BotPanel.vue
public/index.html
.gitignore
.env.example
README.md
Create them all now.
