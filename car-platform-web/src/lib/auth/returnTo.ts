/** Only known browsing destinations may be used after authentication. */
export function safeReturnTo(value: string | null): string | null {
  if (!value || /[\\\x00-\x20]/.test(value) || !value.startsWith('/') || value.startsWith('//')) return null;
  try {
    const url = new URL(value, 'https://carvia.invalid');
    if (url.origin !== 'https://carvia.invalid' || !/^\/(cars(?:\/[a-f0-9]{24})?|buyer\/favorites)$/.test(url.pathname)) return null;
    return url.pathname + url.search;
  } catch { return null; }
}
export function signInHref(destination: string) {
  return `/login?next=${encodeURIComponent(safeReturnTo(destination) || '/cars')}`;
}
