import { resolveServerUrl } from '@/utilities/serverUrls';
import { getApiKey } from '@/utilities/apiKey';

export async function getAccount(): Promise<any> {
  const serverUrl = await resolveServerUrl();
  const apiKey = await getApiKey();
  const res = await fetch(`${serverUrl}/account`, {
    credentials: 'include',
    headers: { 'x-api-key': apiKey },
  });
  if (!res.ok) throw new Error('Failed to get account');
  return res.json();
}
