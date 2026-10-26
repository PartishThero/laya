// services/api/client.js
// Standard HTTP fetch client with token handling, JSON support, error normalization

// Determine base API URL:
// 1. Bound service URL (injected as process.env.SERVER_URL by Vercel service bindings in runtime environments)
// 2. Client build/environment variable (import.meta.env.VITE_API_BASE_URL)
// 3. Same-origin fallback ('/api') routed to the server service via top-level Vercel rewrites
const getApiBaseUrl = () => {
  if (typeof process !== 'undefined' && process.env?.SERVER_URL) {
    const serverUrl = process.env.SERVER_URL.replace(/\/+$/, '');
    return `${serverUrl}/api`;
  }
  return import.meta.env?.VITE_API_BASE_URL || '/api';
};

export class ApiError extends Error {
  constructor(message, status = 500, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export async function request(endpoint, options = {}) {
  const baseUrl = getApiBaseUrl();
  let url;

  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    url = endpoint;
  } else if (baseUrl.startsWith('http://') || baseUrl.startsWith('https://')) {
    const cleanEndpoint = endpoint.replace(/^\/+/, '');
    const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    url = new URL(cleanEndpoint, cleanBase).toString();
  } else {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const cleanBase = baseUrl.replace(/\/+$/, '');
    url = `${cleanBase}${cleanEndpoint}`;
  }
  
  const headers = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers || {})
  };

  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('laya_token') : null;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
    credentials: 'include'
  };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  try {
    const res = await fetch(url, config);
    const contentType = res.headers.get('content-type') || '';
    let data = null;

    if (contentType.includes('application/json')) {
      data = await res.json();
    } else {
      data = await res.text();
    }

    if (!res.ok) {
      const errorMsg = data?.message || data?.error || res.statusText || 'Request failed';
      throw new ApiError(errorMsg, res.status, data);
    }

    return data;
  } catch (err) {
    if (err.name === 'AbortError') {
      throw err;
    }
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(err.message || 'Network error', 0, null);
  }
}

export const api = {
  get: (endpoint, options) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options) => request(endpoint, { ...options, method: 'POST', body }),
  put: (endpoint, body, options) => request(endpoint, { ...options, method: 'PUT', body }),
  patch: (endpoint, body, options) => request(endpoint, { ...options, method: 'PATCH', body }),
  delete: (endpoint, options) => request(endpoint, { ...options, method: 'DELETE' })
};
