import { ErrorResponse } from "../model/errorResponse";

export function createErrorResponse(error: string): ErrorResponse {
  return { error };
}
