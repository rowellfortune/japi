import dotenv from 'dotenv';

dotenv.config();

const required = ['MONGODB_URI', 'OPENAI_API_KEY', 'JWT_SECRET'] as const;

for (const key of required) {
  if (!process.env[key]) {
    // eslint-disable-next-line no-console
    console.warn(`Warning: environment variable ${key} is not set`);
  }
}

// JWT_SECRET has no other safety net (unlike MONGODB_URI, which connectDB refuses to run
// without): silently falling back to a hardcoded string would let anyone forge admin tokens,
// so fail startup instead of warning.
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required and was not set');
}

export const env = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || '',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  jwtSecret: process.env.JWT_SECRET,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  logLevel: process.env.LOG_LEVEL || 'info',
  // Optional: the live Arrivals/Departures sync (src/jobs/fr24Sync.ts) no-ops without it instead
  // of failing startup, since the chatbot/admin CRUD features don't depend on it.
  fr24ApiToken: process.env.FR24_API_TOKEN || '',
};
