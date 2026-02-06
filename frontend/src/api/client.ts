const BASE_URL = '/api';

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;

  const config: RequestInit = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  };

  // Don't set Content-Type for FormData
  if (options.body instanceof FormData) {
    delete (config.headers as Record<string, string>)['Content-Type'];
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    let errorMessage = 'En feil oppstod';
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch {}
    throw new ApiError(errorMessage, response.status);
  }

  // Handle empty responses
  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    return response.json();
  }

  return response as unknown as T;
}

// Auth
export const auth = {
  login: (email: string, password: string) =>
    request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (email: string, name: string, password: string) =>
    request<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, name, password }),
    }),
  logout: () =>
    request<any>('/auth/logout', { method: 'POST' }),
  me: () =>
    request<any>('/auth/me'),
  google: (data: { googleToken: string; email: string; name: string; googleId: string }) =>
    request<any>('/auth/google', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Dashboard
export const dashboard = {
  get: () => request<any>('/dashboard'),
};

// Accounts
export const accounts = {
  list: () => request<any[]>('/accounts'),
  get: (id: string) => request<any>(`/accounts/${id}`),
  create: (data: any) =>
    request<any>('/accounts', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    request<any>(`/accounts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    request<any>(`/accounts/${id}`, { method: 'DELETE' }),
};

// Categories
export const categories = {
  list: () => request<any[]>('/categories'),
  create: (data: any) =>
    request<any>('/categories', { method: 'POST', body: JSON.stringify(data) }),
  suggest: (description: string) =>
    request<any[]>(`/categories/suggest?description=${encodeURIComponent(description)}`),
};

// Transactions
export const transactions = {
  list: (params?: Record<string, string | number>) => {
    const query = params
      ? '?' + new URLSearchParams(
          Object.entries(params).map(([k, v]) => [k, String(v)])
        ).toString()
      : '';
    return request<any>(`/transactions${query}`);
  },
  create: (data: any) =>
    request<any>('/transactions', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    request<any>(`/transactions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    request<any>(`/transactions/${id}`, { method: 'DELETE' }),
  split: (data: any) =>
    request<any>('/transactions/split', { method: 'POST', body: JSON.stringify(data) }),
  suggestCategory: (description: string) =>
    request<any>(`/transactions/suggest-category?description=${encodeURIComponent(description)}`),
  uploadReceipt: (id: string, file: File) => {
    const formData = new FormData();
    formData.append('receipt', file);
    return request<any>(`/transactions/upload-receipt/${id}`, {
      method: 'POST',
      body: formData,
    });
  },
  importCsv: (accountId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('account_id', accountId);
    return request<any>('/transactions/import-csv', {
      method: 'POST',
      body: formData,
    });
  },
};

// Budgets
export const budgets = {
  list: (year?: number, month?: number) => {
    const params: string[] = [];
    if (year) params.push(`year=${year}`);
    if (month) params.push(`month=${month}`);
    const query = params.length ? `?${params.join('&')}` : '';
    return request<any[]>(`/budgets${query}`);
  },
  create: (data: any) =>
    request<any>('/budgets', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    request<any>(`/budgets/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    request<any>(`/budgets/${id}`, { method: 'DELETE' }),
};

// Recurring
export const recurring = {
  list: () => request<any[]>('/recurring'),
  upcoming: (days?: number) =>
    request<any[]>(`/recurring/upcoming${days ? `?days=${days}` : ''}`),
  create: (data: any) =>
    request<any>('/recurring', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    request<any>(`/recurring/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    request<any>(`/recurring/${id}`, { method: 'DELETE' }),
};

// Reports
export const reports = {
  monthly: (year: number, month: number) =>
    request<any>(`/reports/monthly?year=${year}&month=${month}`),
  annual: (year: number) =>
    request<any>(`/reports/annual?year=${year}`),
  netWorth: () => request<any>('/reports/net-worth'),
  forecast: (months?: number) =>
    request<any>(`/reports/forecast${months ? `?months=${months}` : ''}`),
  exportCsv: (year?: number, month?: number) => {
    const params: string[] = ['format=csv'];
    if (year) params.push(`year=${year}`);
    if (month) params.push(`month=${month}`);
    window.location.href = `${BASE_URL}/reports/export?${params.join('&')}`;
  },
};
