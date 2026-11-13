// FinWise Mobile API Service Layer
// When you deploy your backend to the cloud (Render/Railway), paste the URL into CLOUD_API_URL.
// The app will automatically use the global cloud URL, allowing any phone on cellular networks to connect!

export const CLOUD_API_URL = 'https://finwise-backend-gbece5ewe9e4czf7.centralindia-01.azurewebsites.net/api';
export const LOCAL_API_URL = 'http://10.198.47.115:5001/api';

export const API_BASE_URL = CLOUD_API_URL || LOCAL_API_URL;

// In-memory or AsyncStorage token storage
let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getAuthToken(): string | null {
  return authToken;
}

// Generic API request helper
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Network request failed');
  }

  return data;
}

// Authentication API
export const authApi = {
  register: (payload: { name: string; email: string; password: string; monthly_budget?: number }) =>
    request<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: (credentials: { email: string; password: string }) =>
    request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  getProfile: () => request<{ user: any }>('/auth/me'),
};

// Transactions API
export const transactionsApi = {
  getAll: () => request<{ transactions: any[] }>('/transactions'),

  create: (payload: {
    title: string;
    amount: number;
    type: 'income' | 'expense';
    category_name?: string;
    notes?: string;
    transaction_date?: string;
  }) =>
    request<{ message: string; transactionId: number }>('/transactions', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  delete: (id: string | number) =>
    request<{ message: string }>(`/transactions/${id}`, {
      method: 'DELETE',
    }),

  getSummary: () =>
    request<{ totalIncome: number; totalExpense: number; netBalance: number }>('/transactions/summary'),
};

// Budgets API
export const budgetsApi = {
  getAll: () => request<{ budgets: any[] }>('/budgets'),

  update: (categoryId: number, allocatedAmount: number) =>
    request<{ message: string }>('/budgets', {
      method: 'POST',
      body: JSON.stringify({ category_id: categoryId, allocated_amount: allocatedAmount }),
    }),
};

