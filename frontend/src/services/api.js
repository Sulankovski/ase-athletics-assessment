const API_BASE = import.meta.env.VITE_BACKEND_URL || '/api';

const getAuthToken = () => localStorage.getItem('token');

const getHeaders = (options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  const token = getAuthToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.detail || data.message || 'Request failed');
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
};

export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint}`;
  const config = { ...options, headers: getHeaders(options) };
  const response = await fetch(url, config);
  return handleResponse(response);
};

export const api = {
  get: (endpoint) => apiRequest(endpoint, { method: 'GET' }),
  post: (endpoint, body) =>
    apiRequest(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint, body) =>
    apiRequest(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (endpoint) => apiRequest(endpoint, { method: 'DELETE' }),
};
