import { resolveServerUrl } from '@/utilities/serverUrls';
import { getApiKey } from '@/utilities/apiKey';

export default async function sendMessage(params: {
  nationID: number;
  nationName: string;
  leaderName: string;
}): Promise<boolean> {
  try {
    const serverUrl = await resolveServerUrl();
    const apiKey = await getApiKey();
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
