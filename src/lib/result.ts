export const Errors = {
  BAD_REQUEST: "BAD_REQUEST",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
} as const;

export type ErrorCode = keyof typeof Errors;

export const ErrorHttpStatus: Record<ErrorCode, number> = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
}

export type ResultError = {
  code: ErrorCode;
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: ResultError };

export const ResultHandler = {
  success: <T>(data: T): Result<T> => ({ ok: true, data }),

  failure: <T = never>(
    message: string,
    code: ErrorCode = Errors.INTERNAL_SERVER_ERROR,
    fieldErrors?: ResultError["fieldErrors"],
  ): Result<T> => ({ ok: false, error: { code, message, fieldErrors } }),
};

export async function executeDbOperation<T>(
  operation: () => Promise<T>,
): Promise<Result<T>> {
  try {
    return ResultHandler.success(await operation());
  } catch (error) {
    console.error("Databasekall feilet:", error);
    return ResultHandler.failure("Noe gikk galt i databasen");
  }
}

export function toResponse<T>(
  result: Result<T>,
  successStatus = 200
): Response {
  return Response.json(result, {
    status: result.ok
      ? successStatus
      : ErrorHttpStatus[result.error.code],
  });
}

export async function parseJson(
  request: Request
): Promise<Result<unknown>> {
  try {
    return ResultHandler.success(await request.json());
  } catch {
    return ResultHandler.failure(
      "Body må være gyldig JSON",
      Errors.BAD_REQUEST
    );
  }
}
