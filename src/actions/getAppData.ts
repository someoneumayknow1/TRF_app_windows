import { resolveServerUrl } from '@/utilities/serverUrls';
import { getApiKey } from '@/utilities/apiKey';

export default async function getAppData(): Promise<{
  applicationOn: boolean;
  isSetup: boolean;
  sentMessages: any[];
  apiDetails: { used: number; max: number };
  serverVersion: string;
} | null> {
  try {
    const serverUrl = await resolveServerUrl();
    const apiKey = await getApiKey();
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
