export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INVALID_STATE_TRANSITION"
  | "SLOT_UNAVAILABLE"
  | "BUSINESS_RULE_VIOLATION"
  | "INTERNAL_SERVER_ERROR";

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(
    message: string,
    code: ErrorCode = "INTERNAL_SERVER_ERROR",
    statusCode = 500,
    details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Credenciais inválidas ou token de autenticação ausente.") {
    super(message, "UNAUTHORIZED", 401);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Você não tem permissão para realizar esta ação.") {
    super(message, "FORBIDDEN", 403);
    this.name = "ForbiddenError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, "VALIDATION_ERROR", 400, details);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(
      id ? `${resource} com ID '${id}' não encontrado.` : `${resource} não encontrado.`,
      "NOT_FOUND",
      404,
    );
    this.name = "NotFoundError";
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, "CONFLICT", 409, details);
    this.name = "ConflictError";
  }
}

export class InvalidStateTransitionError extends AppError {
  constructor(fromStatus: string, toStatus: string, reason?: string) {
    const msg = reason
      ? `Transição de status inválida: de '${fromStatus}' para '${toStatus}'. Motivo: ${reason}`
      : `Transição de status inválida: de '${fromStatus}' para '${toStatus}'.`;
    super(msg, "INVALID_STATE_TRANSITION", 422);
    this.name = "InvalidStateTransitionError";
  }
}

export class BusinessRuleError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, "BUSINESS_RULE_VIOLATION", 422, details);
    this.name = "BusinessRuleError";
  }
}
