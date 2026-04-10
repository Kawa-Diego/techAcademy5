import 'dotenv/config';
import { createApp } from './app';
import { getPort } from './config/env';

const app = createApp();
const port = getPort();

const server = app.listen(port, () => {
  process.stdout.write(`API em http://localhost:${port}\n`);
});

server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    process.stderr.write(`Porta ${port} já está em uso.\n`);
  } else {
    process.stderr.write(`Erro ao subir o servidor: ${err.message}\n`);
  }
  process.exit(1);
});
