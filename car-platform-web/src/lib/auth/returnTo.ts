/** Only known browsing destinations may be used after authentication. */
export function safeReturnTo(value: string | null): string | null {
  if (!value || /[\\\x00-\x20]/.test(value) || !value.startsWith('/') || value.startsWith('//')) return null;
  try {
    const url = new URL(value, 'https://carvia.invalid');
    if (value.split(/[?#]/, 1)[0] !== url.pathname) return null;
    if (url.origin !== 'https://carvia.invalid' || !/^\/(cars(?:\/[a-f0-9]{24})?|buyer\/(?:favorites|enquiries)|dealer(?:\/(?:enquiries|onboarding|pending|cars(?:\/(?:new|[a-f0-9]{24}(?:\/(?:edit|images))?))?)?)?|admin(?:\/(?:dealers|cars)(?:\/[a-f0-9]{24})?)?|account)$/.test(url.pathname)) return null;
    return url.pathname + url.search + (url.hash === "#vehicle-enquiry" ? url.hash : "");
  } catch { return null; }
}
export function signInHref(destination: string) {
  return `/login?next=${encodeURIComponent(safeReturnTo(destination) || '/cars')}`;
}
