import pino from "pino";
import { pinoHttp } from "pino-http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import dotenv from "dotenv";
dotenv.config();

const isProd = process.env.APP_ENV == "production";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure logs directory exists
const logDir = path.resolve(__dirname, "../logs");
if (isProd && !fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const destination = isProd
  ? pino.destination({ dest: path.join(logDir, "app.log"), sync: false }) // non-blocking file write
  : undefined;

export const logger = pino(
  {
    level: "info",
    timestamp: () => `,"time":"${new Date().toISOString()}"`,
    ...(isProd
      ? {} // No transport for production — raw JSON
      : {
          transport: {
            target: "pino-pretty",
            options: {
              colorize: true,
              translateTime: "SYS:standard",
              ignore: "pid,hostname",
            },
          },
        }),
  },
  destination // Only used in production
);

// HTTP request logger for Express
export const httpLogger = pinoHttp({
  logger,
});
