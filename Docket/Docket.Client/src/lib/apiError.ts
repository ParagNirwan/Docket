export interface ApiErrorResponse {
  code?: string;
  message: string;
  errors?: Record<string, string[]>;
  details?: string;
  traceId?: string;
}

export function getStatusFallbackMessage(status: number): string {
  switch (status) {
    case 400:
      return "The request was invalid. Please review the form and try again.";
    case 401:
      return "Invalid credentials or session expired. Please log in.";
    case 403:
      return "You do not have permission to perform this action.";
    case 404:
      return "The requested resource could not be found.";
    case 409:
      return "A conflict occurred with an existing resource.";
    case 422:
      return "One or more fields could not be processed.";
    case 500:
      return "A server error occurred. Please try again later.";
    default:
      return "An unexpected error occurred. Please try again.";
  }
}

export async function parseApiError(response: Response): Promise<ApiErrorResponse> {
  try {
    const text = await response.text();
    if (!text) {
      return {
        code: `HTTP_${response.status}`,
        message: getStatusFallbackMessage(response.status),
      };
    }

    try {
      const data = JSON.parse(text);
      if (typeof data === "object" && data !== null) {
        return {
          code: data.code || data.errorCode || `HTTP_${response.status}`,
          message: data.message || data.title || getStatusFallbackMessage(response.status),
          errors: data.errors,
          details: data.details,
          traceId: data.traceId,
        };
      }
    } catch {
      // Response is plain text
      return {
        code: `HTTP_${response.status}`,
        message: text,
      };
    }
  } catch {
    return {
      code: "NETWORK_ERROR",
      message: "Network request failed. Please check your internet connection.",
    };
  }

  return {
    code: `HTTP_${response.status}`,
    message: getStatusFallbackMessage(response.status),
  };
}

export function getFieldError(
  errors: Record<string, string[]> | undefined,
  field: string,
): string | undefined {
  if (!errors) return undefined;

  // Check direct match or lowercase/camelCase match
  const match = Object.entries(errors).find(
    ([key]) => key.toLowerCase() === field.toLowerCase(),
  );

  if (match && Array.isArray(match[1]) && match[1].length > 0) {
    return match[1][0];
  }

  return undefined;
}

