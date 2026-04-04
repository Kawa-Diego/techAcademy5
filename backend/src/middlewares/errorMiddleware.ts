import { Prisma } from '@prisma/client';
import type { ErrorRequestHandler } from 'express';
import multer from 'multer';
import { AppError } from '../errors/AppError';

const prismaMessage = (err: Prisma.PrismaClientKnownRequestError): string => {
  if (err.code === 'P2003') return 'Não é possível remover: há vínculos ativos';
  if (err.code === 'P2025') return 'Recurso não encontrado';
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
      ? `Coluna ausente no banco (${col}). Execute: npx prisma migrate deploy ou npx prisma db push (na pasta backend).`
      : 'Esquema do banco desatualizado. Execute as migrações do Prisma na pasta backend (migrate deploy ou db push).';
  }
  if (err.code === 'P2021') {
    return 'Tabela ausente no banco. Execute: npx prisma migrate deploy ou npx prisma db push (na pasta backend).';
  }
  return `Erro de persistência (${err.code})`;
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
        .json({ message: 'Cada imagem deve ter no máximo 8 MB.' });
      return;
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      res
        .status(400)
        .json({ message: 'No máximo 12 imagens por envio.' });
      return;
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      res.status(400).json({
        message:
          'Campo de arquivo incorreto. O formulário deve usar o nome de campo "images".',
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
  res.status(500).json({ message: 'Erro interno' });
};
