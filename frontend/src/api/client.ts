// API Base URL - uses Vite proxy in dev or direct host
const getApiBase = () => {
  if (typeof window !== 'undefined') {
    // If running on dev port 5173 without proxy or with proxy, fallback cleanly
    return '/api';
  }
  return 'http://localhost:5000/api';
};

const API_BASE = getApiBase();

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('craftverse_token');

  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (netErr: any) {
    throw new Error(
      `Network error connecting to API server at ${url}. Please ensure the backend is running on port 5000.`
    );
  }

  const text = await response.text();
  let data: ApiResponse<T>;
  try {
    data = JSON.parse(text);
  } catch (jsonErr) {
    throw new Error(
      `Invalid server response (${response.status}): ${text.substring(0, 120) || 'Empty body'}`
    );
  }

  if (!response.ok || !data.success) {
    const errorMessage = data.error?.message || `Request failed with status ${response.status}`;
    const err = new Error(errorMessage);
    (err as any).code = data.error?.code || 'REQUEST_FAILED';
    (err as any).status = response.status;
    throw err;
  }

  return data.data as T;
}
