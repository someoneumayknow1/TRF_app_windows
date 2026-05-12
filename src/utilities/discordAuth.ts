import { resolveServerUrl, normalizeReturnTo } from '@/utilities/serverUrls';

interface SessionData {
  authenticated: boolean;
  isAdmin: boolean;
  roles: {
    verified: boolean;
    bar3Client: boolean;
    bar3Server: boolean;
    memberGuild: boolean;
  };
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
      } else {
        throw new Error(result.error || 'Authentication failed');
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
        const legacyRoles = Array.isArray(data?.roles) ? data.roles : [];
        const roleBasedAdmin = legacyRoles.some((role: unknown) => {
          if (typeof role === 'string') return role.toLowerCase() === 'admin';
          if (role && typeof role === 'object' && 'name' in role) {
            const name = (role as { name?: unknown }).name;
            return typeof name === 'string' && name.toLowerCase() === 'admin';
          }
          return false;
        });
        const rolesPayload = data?.roles && typeof data.roles === 'object'
          ? data.roles
          : {};
        sessionCache = {
          authenticated: data?.authenticated === true,
          isAdmin: data?.isAdmin === true || roleBasedAdmin,
          roles: {
            verified: rolesPayload.verified === true,
            bar3Client: rolesPayload.bar3_client === true,
            bar3Server: rolesPayload.bar3_server === true,
            memberGuild: rolesPayload.member_guild === true,
          },
        };
      } else {
        sessionCache = {
          authenticated: false,
          isAdmin: false,
          roles: { verified: false, bar3Client: false, bar3Server: false, memberGuild: false },
        };
      }
    } catch {
      sessionCache = {
        authenticated: false,
        isAdmin: false,
        roles: { verified: false, bar3Client: false, bar3Server: false, memberGuild: false },
      };
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
