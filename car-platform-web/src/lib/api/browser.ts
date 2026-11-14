export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
type RequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  signal?: AbortSignal;
};

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

function joinUrl(base: string, p: string) {
  const b = base.replace(/\/+$/, '');
  const s = p.startsWith('/') ? p : `/${p}`;
  return `${b}${s}`;
}

export async function api<T>(
  path: string,
  opts: RequestOptions = {}
): Promise<T> {
  if (!BASE_URL) {
    throw new Error(
      'Missing NEXT_PUBLIC_API_BASE_URL (client). Restart dev server after setting .env.local'
    );
  }

  const { method = 'GET', body, signal } = opts;

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const url = joinUrl(BASE_URL, path);

  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(12000)]) : AbortSignal.timeout(12000),
    credentials: 'include',
  });

  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await res.json()
    : await res.text();

  if (!res.ok) {
    const errorData = data && typeof data === 'object' ? data as Record<string, unknown> : {};
    const msg = typeof errorData.message === 'string' ? errorData.message
      : typeof errorData.error === 'string' ? errorData.error
      : `Request failed (${res.status})`;
    throw new ApiError(msg, res.status, data);
  }

  return data as T;
}
