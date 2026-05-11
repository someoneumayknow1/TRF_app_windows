import { resolveServerUrl } from '@/utilities/serverUrls';
import { getApiKey } from '@/utilities/apiKey';

export default async function sendConfig(config: any): Promise<boolean> {
  try {
    const serverUrl = await resolveServerUrl();
    const apiKey = await getApiKey();
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
