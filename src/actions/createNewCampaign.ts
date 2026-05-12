import { resolveServerUrl } from '@/utilities/serverUrls';

export default async function createNewCampaign(name: string): Promise<any> {
  const serverUrl = await resolveServerUrl();
  const res = await fetch(`${serverUrl}/analytics/campaigns`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error('Failed to create campaign');
  return res.json();
}
