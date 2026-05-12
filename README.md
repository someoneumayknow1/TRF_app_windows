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
   ```
   npm install
   ```

2. Configure your bar3-server URL in the app Settings, or set a default in `.env`:
   ```
   VUE_APP_DEFAULT_SERVER_URL=https://your-bar3-server.com
   ```

3. Run in development:
   ```
   npm run electron:serve
   ```

4. Build for Windows:
   ```
   npm run electron:build
   ```

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
