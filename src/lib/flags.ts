// Country code to flag emoji (Unicode Regional Indicator Symbols)
// Works on most modern systems; falls back to emoji natively
export function getFlag(country: string): string {
  if (!country || country.length !== 2) return '🌍';
  const code = country.toUpperCase();

  // Special cases
  if (code === 'GB') return '🇬🇧';
  if (code === 'SC') return '🏴󠁧󠁢󠁳󠁣󠁴󠁿';
  if (code === 'WC' || code === 'WO') return '🌍';

  // Convert 2-letter code to Regional Indicator Symbols (bayrak emoji)
  const A = 0x1f1e6; // Regional Indicator Symbol Letter A
  const cp1 = A + (code.charCodeAt(0) - 65);
  const cp2 = A + (code.charCodeAt(1) - 65);
  if (cp1 < A || cp2 < A) return '🏳️';
  return String.fromCodePoint(cp1, cp2);
}

// Alternative: returns flag as SVG image URL (for environments without flag emoji support like Windows)
export function getFlagImageUrl(country: string): string {
  if (!country || country.length !== 2) return '';
  const code = country.toLowerCase();
  if (code === 'wc' || code === 'wo') return '';
  if (code === 'sc') return 'https://flagcdn.com/w40/gb-sct.png';
  return `https://flagcdn.com/w40/${code}.png`;
}
