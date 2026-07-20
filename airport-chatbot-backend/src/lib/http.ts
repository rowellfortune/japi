import type { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';

export type ApiEvent = APIGatewayProxyEventV2;
export type ApiResult = APIGatewayProxyStructuredResultV2;

// CORS response headers are added by API Gateway (configured in sst.config.ts), so handlers
// only set content-type here.
export const json = (statusCode: number, body: unknown): ApiResult => ({
  statusCode,
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(body),
});

// Parse a JSON request body, transparently handling API Gateway's base64 encoding. Returns
// {} for an empty/absent body so callers can destructure without guarding.
export const parseBody = <T = Record<string, unknown>>(event: ApiEvent): T => {
  if (!event.body) return {} as T;
  const raw = event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf8') : event.body;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return {} as T;
  }
};

export const pathParam = (event: ApiEvent, name: string): string =>
  event.pathParameters?.[name] ? decodeURIComponent(event.pathParameters[name] as string) : '';

export const queryParam = (event: ApiEvent, name: string): string | undefined =>
  event.queryStringParameters?.[name];

// Wraps a handler so any thrown error becomes a 500 (mirrors the try/catch every Express
// controller repeated) and logs to CloudWatch via console.error.
export const handler =
  (fn: (event: ApiEvent) => Promise<ApiResult>) =>
  async (event: ApiEvent): Promise<ApiResult> => {
    try {
      return await fn(event);
    } catch (error) {
      console.error('Handler error:', error);
      return json(500, { error: 'Internal server error' });
    }
  };
