function resolveApiBase(): string {
  const configured = import.meta.env.VITE_API_URL?.trim();
  if (!configured) return '/api';
  const base = configured.replace(/\/$/, '');
  return base.endsWith('/api') ? base : `${base}/api`;
}

const API_BASE = resolveApiBase();

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const text = await response.text();

  let data: unknown;
  try {
    data = text ? JSON.parse(text) : undefined;
  } catch {
    console.error(`Respuesta no JSON de ${path} (status ${response.status}):`, text);
    if (!response.ok) {
      throw new ApiError(
        `Error ${response.status}: ${text.slice(0, 200)}`,
        response.status
      );
    }
    // Si la respuesta fue exitosa pero no es JSON, devolver undefined
    // para que las operaciones de escritura no fallen innecesariamente.
    return undefined as T;
  }

  if (!response.ok) {
    const message =
      typeof data === 'object' && data !== null && 'message' in data
        ? String((data as { message?: unknown }).message)
        : `Error ${response.status}: ${text.slice(0, 200)}`;
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return data as T;
}
