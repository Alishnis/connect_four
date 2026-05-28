/**
 * Convert ISO 3166-1 alpha-2 country code to emoji flag.
 * e.g. "KZ" → "🇰🇿", "US" → "🇺🇸"
 */
export function countryToFlag(countryCode: string | null | undefined): string {
  if (!countryCode || countryCode.length !== 2) return "🌐";
  const code = countryCode.toUpperCase();
  const offset = 0x1F1E6 - 65; // 'A' char code = 65
  const first = code.charCodeAt(0) + offset;
  const second = code.charCodeAt(1) + offset;
  return String.fromCodePoint(first, second);
}
