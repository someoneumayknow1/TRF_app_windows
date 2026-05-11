import { resolveServerUrl } from '@/utilities/serverUrls';

export default async function getAnalyticalCampaigns(): Promise<any[]> {
  try {
    const serverUrl = await resolveServerUrl();
    const res = await fetch(`${serverUrl}/analytics/campaigns`, { credentials: 'include' });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}
