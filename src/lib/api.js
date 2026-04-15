import { beginNetworkRequest, endNetworkRequest } from "./networkActivity";

export class ApiError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = "ApiError";
    this.code = options.code ?? null;
    this.status = options.status ?? 0;
    this.payload = options.payload ?? null;
  }
}

const JSON_HEADERS = {
  "Content-Type": "application/json",
};

// Tries JSON first and falls back to plain text for non-JSON errors.
async function parseResponseBody(response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function toApiError(response, payload) {
  const fallback = response.statusText || "Request failed";

  if (!payload) {
    return new ApiError(fallback, { status: response.status });
  }

  if (typeof payload === "string") {
    return new ApiError(payload, { status: response.status, payload });
  }

  const detail = payload.detail;

  if (Array.isArray(detail) && detail.length > 0) {
    const firstMessage = detail[0]?.msg || fallback;
    return new ApiError(firstMessage, {
      status: response.status,
      payload,
    });
  }

  if (detail && typeof detail === "object") {
    return new ApiError(detail.message || fallback, {
      code: detail.code || null,
      status: response.status,
      payload,
    });
  }

  if (typeof detail === "string") {
    return new ApiError(detail, {
      status: response.status,
      payload,
    });
  }

  return new ApiError(fallback, {
    status: response.status,
    payload,
  });
}

export async function apiFetch(path, options = {}) {
  // `credentials: include` is required for HttpOnly access/refresh cookies.
  const silent = Boolean(options.silent);
  if (!silent) beginNetworkRequest();

  let response;
  try {
    response = await fetch(path, {
      credentials: "include",
      ...options,
    });
  } finally {
    if (!silent) endNetworkRequest();
  }

  const payload = await parseResponseBody(response);
  if (!response.ok) {
    throw toApiError(response, payload);
  }

  return payload;
}

export function apiPostJson(path, body, options = {}) {
  return apiFetch(path, {
    method: "POST",
    headers: {
      ...JSON_HEADERS,
      ...(options.headers || {}),
    },
    body: JSON.stringify(body),
    ...options,
  });
}

export function apiPatchJson(path, body, options = {}) {
  return apiFetch(path, {
    method: "PATCH",
    headers: {
      ...JSON_HEADERS,
      ...(options.headers || {}),
    },
    body: JSON.stringify(body),
    ...options,
  });
}

export function apiPostForm(path, formData, options = {}) {
  // Used by OAuth2PasswordRequestForm-compatible endpoints.
  return apiFetch(path, {
    method: "POST",
    body: new URLSearchParams(formData),
    ...options,
  });
}
