const DEFAULT_BASE_URL = "http://localhost:3000/api/v1";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() || DEFAULT_BASE_URL;

interface ApiRequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string | null;
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function buildErrorMessage(status: number, messageFromServer?: string): string {
  if (status === 403) {
    return messageFromServer || "Access denied. Please sign in again.";
  }

  if (status === 429) {
    return (
      messageFromServer ||
      "Too many requests right now. Please wait a minute and retry."
    );
  }

  return messageFromServer || "Request failed. Please try again.";
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json"
  };

  if (options.token) {
    headers.token = options.token;
  }

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || "GET",
    credentials: "include",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined
  });

  const rawText = await response.text();
  let parsed: unknown = null;

  if (rawText) {
    try {
      parsed = JSON.parse(rawText);
    } catch {
      parsed = rawText;
    }
  }

  if (!response.ok) {
    const responseMessage =
      parsed && typeof parsed === "object" && "message" in parsed
        ? String(parsed.message)
        : undefined;

    throw new ApiError(
      response.status,
      buildErrorMessage(response.status, responseMessage)
    );
  }

  return parsed as T;
}
