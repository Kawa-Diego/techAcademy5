/**
 * Vercel Serverless entry: Express API behind /api (browser uses origin + /api + /auth/...).
 * Strips the /api prefix so existing routes (/auth, /upload, ...) match.
 */
import express from 'express';
import serverless from 'serverless-http';
import { createApp } from '../backend/dist/app';

const inner = createApp();
const root = express();
root.use((req, _res, next) => {
  let u = req.url ?? '/';
  if (u.startsWith('/api')) {
    u = u === '/api' ? '/' : u.slice(4);
    if (u.length === 0) u = '/';
    req.url = u;
  }
  next();
});
root.use(inner);

export default serverless(root);
