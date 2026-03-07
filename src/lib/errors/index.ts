export type Result<T, E = AppError> = { ok: true; value: T } | { ok: false; error: E };
export function Ok<T>(value: T): Result<T, never> { return { ok: true, value }; }
export function Err<E>(error: E): Result<never, E> { return { ok: false, error }; }
export function unwrap<T>(result: Result<T>): T { if (result.ok) return result.value; throw result.error; }

export async function tryCatch<T>(fn: () => Promise<T>, mapError?: (e: unknown) => AppError): Promise<Result<T>> {
  try { return Ok(await fn()); }
  catch (e) { return Err(mapError ? mapError(e) : AppError.internal('Unexpected error', e)); }
}

export type ErrorCode = 'BAD_REQUEST' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'CONFLICT' | 'RATE_LIMITED' | 'USAGE_LIMIT' | 'VALIDATION' | 'EXTERNAL_SERVICE' | 'AI_ERROR' | 'INTERNAL';

export class AppError extends Error {
  constructor(public readonly code: ErrorCode, message: string, public readonly statusCode: number, public readonly details?: Record<string, unknown>, public readonly cause?: unknown) {
    super(message); this.name = 'AppError';
  }
  toJSON() { return { code: this.code, message: this.message, ...(this.details && { details: this.details }) }; }
  static badRequest(msg: string, details?: Record<string, unknown>) { return new AppError('BAD_REQUEST', msg, 400, details); }
  static unauthorized(msg = 'Authentication required') { return new AppError('UNAUTHORIZED', msg, 401); }
  static forbidden(msg = 'Insufficient permissions') { return new AppError('FORBIDDEN', msg, 403); }
  static notFound(resource: string, id?: string) { return new AppError('NOT_FOUND', `${resource}${id ? ` (${id})` : ''} not found`, 404); }
  static conflict(msg: string) { return new AppError('CONFLICT', msg, 409); }
  static rateLimited(msg = 'Rate limit exceeded') { return new AppError('RATE_LIMITED', msg, 429); }
  static usageLimit(msg: string, details?: Record<string, unknown>) { return new AppError('USAGE_LIMIT', msg, 402, details); }
  static validation(msg: string, fields?: Record<string, string[]>) { return new AppError('VALIDATION', msg, 422, fields ? { fields } : undefined); }
  static externalService(service: string, msg: string, cause?: unknown) { return new AppError('EXTERNAL_SERVICE', `${service}: ${msg}`, 502, { service }, cause); }
  static aiError(msg: string, cause?: unknown) { return new AppError('AI_ERROR', msg, 500, undefined, cause); }
  static internal(msg = 'Internal server error', cause?: unknown) { return new AppError('INTERNAL', msg, 500, undefined, cause); }
}

export function errorResponse(error: AppError): Response { return Response.json(error.toJSON(), { status: error.statusCode }); }
export function resultResponse<T>(result: Result<T>): Response { if (result.ok) return Response.json({ data: result.value }); return errorResponse(result.error); }
