export interface GeoResult {
  city: string | null;
  country: string | null;
}

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function detectCity(): Promise<GeoResult> {
  const empty: GeoResult = { city: null, country: null };

  // Try ipapi.co first (free, 1000 req/day, no key needed)
  try {
    const res = await fetchWithTimeout("https://ipapi.co/json/", 3000);
    if (res.ok) {
      const data = await res.json();
      if (data.city && data.country_code) {
        return { city: data.city, country: data.country_code };
      }
    }
  } catch {
    // Timeout or network error — try fallback
  }

  // Fallback: ip-api.com (free for non-commercial, 45 req/min)
  try {
    const res = await fetchWithTimeout("http://ip-api.com/json/?fields=city,countryCode", 3000);
    if (res.ok) {
      const data = await res.json();
      if (data.city && data.countryCode) {
        return { city: data.city, country: data.countryCode };
      }
    }
  } catch {
    // Both APIs failed — return empty
  }

  return empty;
}
