// Json value type for http
type JsonPrimitive = string | number | boolean | null;

// Json object type for http
type JsonObject = { readonly [key: string]: JsonValue };

// Json value type for http
type JsonValue = JsonPrimitive | readonly JsonValue[] | JsonObject;

// Trim api url for http
const trimApi = (raw: string): string => raw.replace(/\/$/u, '');

// From env for http
const fromEnv = (): string => {
  const v = import.meta.env.VITE_API_URL;
  return typeof v === 'string' ? v : '';
};

// Api base url for http
export const apiBaseUrl = (): string => {
  const base = fromEnv();
  return base.length > 0 ? trimApi(base) : '/api';
};

// Api request error for http
export class ApiRequestError extends Error {
  public readonly status: number;
  // Status for api request error
  public constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// Parse json for http
const parseJson = (text: string): JsonValue => {
  return JSON.parse(text) as JsonValue;
};

// Try parse json for http
const tryParseJson = (text: string): JsonValue | null => {
  if (text.length === 0) return null;
  try {
    return parseJson(text);
  } catch {
    return null;
  }
};

// Read message for http
const readMessage = (value: JsonValue): string => {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    const msg = Reflect.get(value, 'message');
    if (typeof msg === 'string') return msg;
  }
  return 'Request error';
};

// Merge headers for http
const mergeHeaders = (
  base: RequestInit,
  token: string | null
): Headers => {
  const headers = new Headers(base.headers);
  headers.set('Accept', 'application/json');
  if (base.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (token !== null && token.length > 0) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return headers;
};

// Handle response for http
const handleResponse = (res: Response, text: string): JsonValue | undefined => {
  if (res.status === 204) return undefined;
  const body = tryParseJson(text);
  if (!res.ok) {
    const msg =
      body === null ? `HTTP error ${String(res.status)}` : readMessage(body);
    throw new ApiRequestError(res.status, msg);
  }
  if (body === null) {
    throw new ApiRequestError(
      res.status,
      'Invalid server response (not JSON).'
    );
  }
  return body;
};

// Http json for http
export const httpJson = async <T,>(
  path: string,
  init: RequestInit,
  token: string | null
): Promise<T> => {
  const url = `${apiBaseUrl()}${path}`;
  const headers = mergeHeaders(init, token);
  const res = await fetch(url, { ...init, headers });
  const text = await res.text();
  return handleResponse(res, text) as T;
};

// Http form data for http multipart
export const httpFormData = async <T,>(
  path: string,
  formData: FormData,
  token: string | null
): Promise<T> => {
  const url = `${apiBaseUrl()}${path}`;
  const headers = new Headers();
  headers.set('Accept', 'application/json');
  if (token !== null && token.length > 0) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  try {
    const res = await fetch(url, { method: 'POST', body: formData, headers });
    const text = await res.text();
    return handleResponse(res, text) as T;
  } catch {
    throw new ApiRequestError(
      0,
      'No connection to the server. Start the backend (e.g. port 3333) and try again.'
    );
  }
};

// Media url for http media url
export const mediaUrl = (path: string): string => {
  if (path.startsWith('http')) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const base = fromEnv();
  if (base.length > 0) {
    return `${trimApi(base)}${normalized}`;
  }
  return normalized;
};
