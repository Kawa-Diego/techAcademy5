import path from 'node:path';
import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';

const prismaRuntimeMjs = path.resolve(
  __dirname,
  '../node_modules/@prisma/client/runtime/client.mjs'
);

/** Vitest/Vite does not resolve Prisma 7's deep import without this. */
const resolvePrismaRuntime = (): Plugin => ({
  name: 'resolve-prisma-client-runtime',
  enforce: 'pre',
  resolveId(source) {
    if (source === '@prisma/client/runtime/client') {
      return prismaRuntimeMjs;
    }
    return undefined;
  },
});

export default defineConfig({
  plugins: [resolvePrismaRuntime()],
  test: {
    globals: false,
    environment: 'node',
    include: ['test/**/*.test.ts'],
    setupFiles: ['test/setup.ts'],
  },
  resolve: {
    alias: [
      {
        find: '@ecommerce/shared',
        replacement: path.resolve(__dirname, 'src/shared/index.ts'),
      },
      {
        find: /^@prisma\/client$/,
        replacement: path.resolve(__dirname, 'src/generated/prisma/client.ts'),
      },
    ],
  },
});
