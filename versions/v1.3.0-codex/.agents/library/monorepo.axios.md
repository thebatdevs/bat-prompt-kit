# Monorepo package `axios`

- **Import:** `@motforex-monorepo-packages/axios`
- **Version:** 1.1.0
- **Source:**
  [packages/axios](/Users/thedashpuntsag/Documents/Repositories/motforex/serverless/stock-finance-sls-monorepo/packages/axios)
- **Entry:** `src/index.ts`; all functions below are available from the package root.
- **Verified snapshot:** 2026-11-21; see [package index](./monorepo.index.md) for provenance and refresh rules.

Use for HTTP requests, authentication headers, Axios error conversion, and best-effort Google Chat alerts.

## Functions

| Function                                                                     | Input                                                                      | Output                                      | Behavior / source                                                                                                                   |
| ---------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `sendRequest<Response = unknown, Request = Record<string, unknown>>`         | `params: AxiosRequestConfig<Request>`                                      | `Promise<AxiosResponse<Response>>`          | Sends `axios.request`; logs failures and rethrows the original error. `src/request.ts`.                                             |
| `sendRequestSilently<Response = unknown, Request = Record<string, unknown>>` | `params: AxiosRequestConfig<Request>`                                      | Declared `Promise<AxiosResponse<Response>>` | On an Axios error returns `error.response`; rethrows non-Axios errors. `src/request.ts`.                                            |
| `parseAxiosError`                                                            | `error: unknown`                                                           | `never`                                     | Throws `ParsedAxiosError` for Axios errors; otherwise rethrows unchanged. `src/error.ts`.                                           |
| `createBearerAuthHeader`                                                     | `token: string`, `contentType = 'application/json'`                        | `CustomHeader`                              | Builds `Authorization: Bearer <token>` and `Content-Type`. `src/headers.ts`.                                                        |
| `createBasicAuthHeader`                                                      | `username: string`, `password: string`, `contentType = 'application/json'` | `CustomHeader`                              | Base64-encodes `username:password` into a Basic header. `src/headers.ts`.                                                           |
| `sendGoogleChatWebhook`                                                      | `webhookUrl: string`, `message: GoogleChatMessage \| string`               | `Promise<void>`                             | POSTs text as `{ text }` or an existing message object; logs non-200 responses and catches delivery failures. `src/google-chat.ts`. |

## Other public exports

- `ParsedAxiosError(message, statusCode: number | null, data: unknown)` extends `Error`; response status and data
  default to `null` when converted from Axios errors.
- `CustomHeader` has `Authorization` and `Content-Type` string properties.
- `GoogleChatMessage` accepts text, `cardsV2`, and extra fields.

## Reuse details

- `sendRequestSilently` can resolve to `undefined` when Axios fails without a response, despite its declared return
  type. Check for a response before accessing `.status` or `.data`.
- Neither request wrapper applies a default timeout, retries, or application error conversion. Pass request settings
  explicitly; invoke `parseAxiosError` separately when needed.
- `sendRequest` logs the response body on Axios failures. Account for sensitive response content when selecting it.
