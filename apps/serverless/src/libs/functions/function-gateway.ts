import middy, { MiddlewareObj, MiddyfiedHandler } from '@middy/core';
import middyJsonBodyParser from '@middy/http-json-body-parser';
import type { APIGatewayProxyResult } from 'aws-lambda';
import { handleApiFuncError } from '../error';
import { formatApiResponse } from '../utility';
import { ValidatedAPIGatewayProxyEvent } from './api-function.types';

/**
 * Type definition for HTTP handlers created by createHttpHandler.
 * Use this to annotate your handler exports to avoid TypeScript portability issues.
 */
export type HttpHandler<S> = ReturnType<typeof createHttpHandler<S>>;

/**
 * Creates an HTTP handler function with middleware support by middy.
 *
 * ### Note:
 * This function wraps the provided callback with error handling and JSON body parsing middleware.
 *
 * @param callback - The main handler function to process the event.
 * @returns {MiddyfiedHandler<ValidatedAPIGatewayProxyEvent<S>>} A middy-wrapped handler function that processes API Gateway events.
 */
export function createHttpHandler<S>(
  callback: (_event: ValidatedAPIGatewayProxyEvent<S>) => Promise<object>,
): MiddyfiedHandler<ValidatedAPIGatewayProxyEvent<S>, APIGatewayProxyResult> {
  const jsonBodyParserMiddleware = middyJsonBodyParser({
    disableContentTypeError: true, // Don't throw error if Content-Type is missing or unsupported
  }) as MiddlewareObj<ValidatedAPIGatewayProxyEvent<S>, APIGatewayProxyResult>;

  return middy(async (event: ValidatedAPIGatewayProxyEvent<S>): Promise<APIGatewayProxyResult> => {
    try {
      const result = await callback(event);
      return formatApiResponse(result);
    } catch (error: unknown) {
      return handleApiFuncError(error);
    }
  })
    .use(jsonBodyParserMiddleware)
    .onError((request) => {
      const error = request.error;
      if (error && 'statusCode' in error && (error.statusCode === 400 || error.statusCode === 415)) {
        return formatApiResponse({ message: error.message }, error.statusCode);
      }
      return handleApiFuncError(error);
    });
}
