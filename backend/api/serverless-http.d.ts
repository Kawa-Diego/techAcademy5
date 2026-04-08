declare module 'serverless-http' {
  import type { IncomingMessage, ServerResponse } from 'http';

  type Handler = (req: IncomingMessage, res: ServerResponse) => void;

  function serverless(
    app: Handler,
    options?: Record<string, unknown>
  ): (req: unknown, res: unknown) => Promise<unknown>;

  export default serverless;
}
