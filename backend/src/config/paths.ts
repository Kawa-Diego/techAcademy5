import fs from 'node:fs';
import path from 'node:path';

/** Writable uploads root: /tmp on Vercel serverless; ./uploads locally. */
export const getUploadsRoot = (): string => {
  if (process.env['VERCEL'] === '1') {
    return '/tmp/uploads';
  }
  return path.join(process.cwd(), 'uploads');
};

export const ensureUploadsDirs = (): void => {
  const root = getUploadsRoot();
  fs.mkdirSync(path.join(root, 'products'), { recursive: true });
};
