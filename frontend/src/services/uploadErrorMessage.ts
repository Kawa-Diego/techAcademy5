// Upload error message for upload error 
import { ApiRequestError } from './http';

// Generic upload error message for upload error 
const GENERIC =
  'Could not upload images. Check your connection and that the backend is running.';

// By status upload error message for upload error 
const BY_STATUS: Readonly<Record<number, string>> = {
  401: 'Session expired or not signed in. Please log in again.',
  403: 'Only administrators can upload images. Make sure you are logged in as ADMIN.',
  404:
    'Upload not found. In development, leave VITE_API_URL empty in .env or use http://localhost:3333 (no /api suffix). The backend must be running.',
};

// Message for api error for upload error 
function messageForApiError(e: ApiRequestError): string {
  if (e.status === 0) return e.message;
  const line = BY_STATUS[e.status];
  return line ?? e.message;
}

// Describe upload error for upload error 
export function describeUploadError(e: unknown): string {
  if (!(e instanceof ApiRequestError)) return GENERIC;
  return messageForApiError(e);
}
