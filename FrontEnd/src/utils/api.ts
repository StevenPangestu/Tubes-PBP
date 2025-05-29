export const API_BASE_URL = 'http://localhost:3000';

async function request<T>(
  path: string,
  options: RequestInit = {},
  useAuth: boolean = true
): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers || {}) as Record<string, string>,
  };

  // Tambah token Authorization jika perlu
  if (useAuth) {
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  // Tambahkan Content-Type default jika body bukan FormData
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error('Invalid JSON response');
  }

  if (!response.ok) {
    const message = (payload as any)?.message || response.statusText;
    throw new Error(message);
  }

  return payload as T;
}

export const api = {
  // GET request
  get: <T>(path: string, useAuth = true) =>
    request<T>(path, { method: 'GET' }, useAuth),

  // POST JSON
  post: <T>(path: string, body: any, useAuth = true) =>
    request<T>(
      path,
      {
        method: 'POST',
        body: JSON.stringify(body),
      },
      useAuth
    ),

  // PUT JSON
  put: <T>(path: string, body: any, useAuth = true) =>
    request<T>(
      path,
      {
        method: 'PUT',
        body: JSON.stringify(body),
      },
      useAuth
    ),

  // DELETE
  delete: <T>(path: string, useAuth = true) =>
    request<T>(path, { method: 'DELETE' }, useAuth),

  // POST multipart/form-data (FormData)
  postFormData: <T>(path: string, formData: FormData, useAuth = true) =>
    request<T>(
      path,
      {
        method: 'POST',
        body: formData,
      },
      useAuth
    ),

  // PUT multipart/form-data (FormData)
  putFormData: <T>(path: string, formData: FormData, useAuth = true) =>
    request<T>(
      path,
      {
        method: 'PUT',
        body: formData,
      },
      useAuth
    ),

  // GET dengan query parameters
  getWithQuery: <T>(path: string, params: Record<string, any> = {}, useAuth = true) => {
    const url = new URL(`${API_BASE_URL}${path}`);
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key].toString());
      }
    });
    return request<T>(url.pathname + url.search, { method: 'GET' }, useAuth);
  },
};
