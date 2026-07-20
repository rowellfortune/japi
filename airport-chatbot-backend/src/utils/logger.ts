import winston from 'winston';
import { env } from '../config/env';

export const logger = winston.createLogger({
  level: env.logLevel,
  format: winston.format.json(),
  // Console only: Lambda's filesystem is ephemeral, and console output is captured by
  // CloudWatch automatically. File transports would write logs that vanish on each freeze.
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});
