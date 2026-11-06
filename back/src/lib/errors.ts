export class AppError extends Error {
  constructor(public status: number, public code: string, message: string, public details?: unknown) {
    super(message)
  }
}
export const badRequest = (code: string, msg: string, d?: unknown) => new AppError(400, code, msg, d)
export const unauthorized = (msg = 'Não autenticado.') => new AppError(401, 'UNAUTHORIZED', msg)
export const forbidden = (msg = 'Sem permissão para esta ação.') => new AppError(403, 'FORBIDDEN', msg)
/** 404 também para recurso de outra pessoa: evita enumerar IDs (IDOR). */
export const notFound = (msg = 'Não encontrado.') => new AppError(404, 'NOT_FOUND', msg)
export const conflict = (code: string, msg: string, d?: unknown) => new AppError(409, code, msg, d)
export const unprocessable = (code: string, msg: string, d?: unknown) => new AppError(422, code, msg, d)
