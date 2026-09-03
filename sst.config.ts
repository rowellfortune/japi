/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: 'japi',
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      protect: ['production'].includes(input?.stage),
      home: 'aws',
      providers: { aws: { region: 'us-east-1' } },
    };
  },
  async run() {
    // Secrets — set once with `sst secret set <Name> <value>`. Never committed.
    const mongoUri = new sst.Secret('MongoUri');
    const openAiKey = new sst.Secret('OpenAiKey');
    const jwtSecret = new sst.Secret('JwtSecret');
    const fr24ApiToken = new sst.Secret('Fr24ApiToken');

    // Inject the secrets into EVERY Lambda under the exact env-var names the existing backend
    // code already reads (config/env.ts, config/openai.ts, config/fr24.ts, lib/auth.ts,
    // lib/db.ts). This is what lets the services and OpenAI/FR24 clients run unchanged.
    $transform(sst.aws.Function, (args) => {
      args.runtime = 'nodejs22.x';
      args.environment = {
        ...args.environment,
        MONGODB_URI: mongoUri.value,
        OPENAI_API_KEY: openAiKey.value,
        JWT_SECRET: jwtSecret.value,
        FR24_API_TOKEN: fr24ApiToken.value,
        NODE_ENV: 'production',
      };
    });

    // API Gateway v2 (HTTP API). CORS is "*" because the frontend authenticates with a Bearer
    // token (no cookies), so allowCredentials isn't needed and the site's CloudFront origin
    // isn't known at config time (that would create a StaticSite<->Api dependency cycle).
    // Public flight/gate boards are meant to be world-readable; admin mutations are gated by
    // JWT, not CORS. Tighten allowOrigins to the real origin once a custom domain is added.
    const api = new sst.aws.ApiGatewayV2('Api', {
      cors: {
        allowOrigins: ['*'],
        allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
        allowHeaders: ['content-type', 'authorization'],
      },
      // Default per-route request throttling replaces the in-memory express-rate-limit, which
      // can't work across stateless Lambda invocations. Account-wide per route (not per-IP);
      // add AWS WAF later if per-IP limits are needed.
      transform: {
        stage: (args) => {
          args.defaultRouteSettings = {
            throttlingBurstLimit: 20,
            throttlingRateLimit: 10,
          };
        },
      },
    });

    const h = (name: string) => `airport-chatbot-backend/src/handlers/${name}`;

    // Public (unauthenticated) — same paths the frontend's lib/api.ts calls.
    api.route('GET /api/public/flights', h('public.listFlights'));
    api.route('GET /api/public/flights/{flightNumber}', h('public.getFlight'));
    api.route('GET /api/public/gates', h('public.listGates'));

    // Auth
    api.route('POST /api/auth/register', h('auth.register'));
    api.route('POST /api/auth/login', h('auth.login'));

    // Chat
    api.route('POST /api/chat/message', h('chat.postMessage'));
    api.route('GET /api/chat/history/{sessionId}', h('chat.getHistory'));

    // Flights (admin — enforced inside each handler via requireAdmin)
    api.route('GET /api/flights', h('flights.list'));
    api.route('GET /api/flights/{flightNumber}', h('flights.get'));
    api.route('POST /api/flights', h('flights.create'));
    api.route('PATCH /api/flights/{flightNumber}', h('flights.update'));
    api.route('DELETE /api/flights/{flightNumber}', h('flights.remove'));

    // Gates (admin)
    api.route('GET /api/gates', h('gates.list'));
    api.route('GET /api/gates/{gateNumber}', h('gates.get'));
    api.route('POST /api/gates', h('gates.create'));
    api.route('PATCH /api/gates/{gateNumber}', h('gates.update'));
    api.route('DELETE /api/gates/{gateNumber}', h('gates.remove'));

    // Baggage (public tag lookup + admin management)
    api.route('GET /api/baggage/flight/{flightNumber}', h('baggage.getByFlight'));
    api.route('GET /api/baggage/{tagId}', h('baggage.getByTag'));
    api.route('POST /api/baggage', h('baggage.create'));
    api.route('PATCH /api/baggage/{tagId}', h('baggage.update'));
    api.route('DELETE /api/baggage/{tagId}', h('baggage.remove'));

    // Live Arrivals/Departures — pulls actual takeoff/landing data from Flightradar24 for PBM
    // and ORG and upserts it into the Flight collection, so the public board (and admin CRUD)
    // reflect real traffic instead of the one-off seed. Runs outside API Gateway; no route.
    new sst.aws.Cron('Fr24Sync', {
      schedule: 'rate(5 minutes)',
      job: h('fr24Sync.run'),
    });

    // Frontend — reuse the verified Next.js static export (output: "export" -> out/).
    // SST injects NEXT_PUBLIC_API_URL at build time so no manual rebuild step is needed.
    const site = new sst.aws.StaticSite('Web', {
      path: 'airport-chatbot-frontend',
      build: { command: 'npm run build', output: 'out' },
      errorPage: '404.html',
      environment: { NEXT_PUBLIC_API_URL: api.url },
    });

    return { api: api.url, web: site.url, mongoUri: mongoUri.value, openAiKey: openAiKey.value, jwtSecret: jwtSecret.value };
  },
});
