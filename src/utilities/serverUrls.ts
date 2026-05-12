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
