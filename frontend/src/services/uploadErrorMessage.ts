import { ApiRequestError } from './http';

const GENERIC =
  'Não foi possível enviar as imagens. Verifique sua conexão e se o backend está em execução.';

const BY_STATUS: Readonly<Record<number, string>> = {
  401: 'Sessão expirada ou não autenticado. Faça login novamente.',
  403: 'Apenas administradores podem enviar imagens. Confira se está logado como ADMIN.',
  404:
    'Upload não encontrado. Em desenvolvimento, deixe VITE_API_URL vazio no .env ou use http://localhost:3333 (sem /api no final). O backend precisa estar em execução.',
};

function messageForApiError(e: ApiRequestError): string {
  if (e.status === 0) return e.message;
  const line = BY_STATUS[e.status];
  return line ?? e.message;
}

export function describeUploadError(e: unknown): string {
  if (!(e instanceof ApiRequestError)) return GENERIC;
  return messageForApiError(e);
}
