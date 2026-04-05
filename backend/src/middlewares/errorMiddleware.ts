import { Prisma } from '@prisma/client';
import type { ErrorRequestHandler } from 'express';
import multer from 'multer';
import { AppError } from '../errors/AppError';

const prismaMessage = (err: Prisma.PrismaClientKnownRequestError): string => {
  if (err.code === 'P2003') return 'Cannot remove: there are active references';
  if (err.code === 'P2025') return 'Resource not found';
  if (err.code === 'P2022') {
    const meta = err.meta;
    const col =
      meta !== undefined &&
      typeof meta === 'object' &&
      meta !== null &&
      'column' in meta &&
      typeof (meta as { column?: string }).column === 'string'
        ? (meta as { column: string }).column
        : '';
    return col.length > 0
      ? `Missing column in the database (${col}). Run: npx prisma migrate deploy or npx prisma db push (in the backend folder).`
      : 'Database schema is out of date. Run Prisma migrations in the backend folder (migrate deploy or db push).';
  }
  if (err.code === 'P2021') {
    return 'Missing table in the database. Run: npx prisma migrate deploy or npx prisma db push (in the backend folder).';
  }
  return `Persistence error (${err.code})`;
};

export const errorMiddleware: ErrorRequestHandler = (
  err,
  _req,
  res,
  _next
) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res
        .status(400)
        .json({ message: 'Each image must be at most 8 MB.' });
      return;
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      res
        .status(400)
        .json({ message: 'At most 12 images per upload.' });
      return;
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      res.status(400).json({
        message:
          'Wrong file field. The form must use the field name "images".',
      });
      return;
    }
    res.status(400).json({ message: err.message });
    return;
  }
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const status = err.code === 'P2025' ? 404 : 400;
    res.status(status).json({ message: prismaMessage(err) });
    return;
  }
  res.status(500).json({ message: 'Internal server error' });
};
