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
