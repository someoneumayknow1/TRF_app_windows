export async function getPwApiKeyDetails(apiKey: string): Promise<{ used: number; max: number }> {
  try {
    const response = await fetch(
      `https://api.politicsandwar.com/v3?api_key=${encodeURIComponent(apiKey)}&query={me{api_key_details{requests_today,max_requests_per_day}}}`,
    );
    if (!response.ok) return { used: 0, max: 0 };
    const data = await response.json();
    const details = data?.data?.me?.api_key_details;
    if (!details) return { used: 0, max: 0 };
    return {
      used: details.requests_today ?? 0,
      max: details.max_requests_per_day ?? 0,
    };
  } catch {
    return { used: 0, max: 0 };
  }
}
