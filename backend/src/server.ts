import 'dotenv/config';
import { createApp } from './app';
import { getPort } from './config/env';

const app = createApp();
const port = getPort();

app.listen(port, () => {
  process.stdout.write(`API em http://localhost:${port}\n`);
});
