import { resolveServerUrl } from '@/utilities/serverUrls';
import { getApiKey } from '@/utilities/apiKey';

export default async function setApplicationState(applicationOn: boolean): Promise<boolean> {
  try {
    const serverUrl = await resolveServerUrl();
    const apiKey = await getApiKey();
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
