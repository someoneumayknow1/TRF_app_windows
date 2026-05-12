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
