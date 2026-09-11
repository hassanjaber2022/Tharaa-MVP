import app from "./app";
import { logger } from "./lib/logger";
import { connectDatabase } from "./lib/database";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function start(): Promise<void> {
  await connectDatabase();
  app.listen(port, () => {
    logger.info({ port }, "Server listening");
  });
}

start().catch((error: unknown) => {
  logger.error({ err: error }, "Failed to start server");
  process.exit(1);
});
