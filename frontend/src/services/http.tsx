type JsonPrimitive = string | number | boolean | null;

type JsonObject = { readonly [key: string]: JsonValue };

type JsonValue = JsonPrimitive | readonly JsonValue[] | JsonObject;

const trimApi = (raw: string): string => raw.replace(/\/$/u, '');

const fromEnv = (): string => {
  const v = import.meta.env.VITE_API_URL;
  return typeof v === 'string' ? v : '';
};

export const apiBaseUrl = (): string => {
  const base = fromEnv();
  return base.length > 0 ? trimApi(base) : '/api';
};

export class ApiRequestError extends Error {
  public readonly status: number;

  public constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const parseJson = (text: string): JsonValue => {
  return JSON.parse(text) as JsonValue;
};

const tryParseJson = (text: string): JsonValue | null => {
  if (text.length === 0) return null;
  try {
    return parseJson(text);
  } catch {
    return null;
  }
};

const readMessage = (value: JsonValue): string => {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    const msg = Reflect.get(value, 'message');
    if (typeof msg === 'string') return msg;
  }
  return 'Erro na requisição';
};

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

const handleResponse = (res: Response, text: string): JsonValue | undefined => {
  if (res.status === 204) return undefined;
  const body = tryParseJson(text);
  if (!res.ok) {
    const msg =
      body === null ? `Erro HTTP ${String(res.status)}` : readMessage(body);
    throw new ApiRequestError(res.status, msg);
  }
  if (body === null) {
    throw new ApiRequestError(
      res.status,
      'Resposta inválida do servidor (não é JSON).'
    );
  }
  return body;
};

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

/** Upload multipart (ex.: imagens de produto). Não define Content-Type (boundary automático). */
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
      'Sem conexão com o servidor. Inicie o backend (ex.: porta 3333) e tente de novo.'
    );
  }
};

/** URL de arquivo servido pelo backend (`/uploads/...`). O Vite faz proxy de `/uploads`. */
export const mediaUrl = (path: string): string => {
  if (path.startsWith('http')) return path;
  return path.startsWith('/') ? path : `/${path}`;
};
