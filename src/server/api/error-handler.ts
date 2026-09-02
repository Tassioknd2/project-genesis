import { ZodError } from "zod";
import { AppError } from "../domain/errors";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export function jsonResponse<T>(data: T, status = 200): Response {
  const body: ApiResponse<T> = {
    success: true,
    data,
  };
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

export function handleApiError(error: unknown): Response {
  if (error instanceof ZodError) {
    const formatted = error.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    const body: ApiResponse = {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Dados de entrada inválidos.",
        details: formatted,
      },
    };
    return new Response(JSON.stringify(body), {
      status: 400,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }

  if (error instanceof AppError) {
    const body: ApiResponse = {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    };
    return new Response(JSON.stringify(body), {
      status: error.statusCode,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }

  // Erro inesperado
  console.error("[InternalServerError]", error);
  const body: ApiResponse = {
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: error instanceof Error ? error.message : "Ocorreu um erro interno no servidor.",
      details: error instanceof Error ? error.stack : undefined,
    },
  };
  return new Response(JSON.stringify(body), {
    status: 500,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}
