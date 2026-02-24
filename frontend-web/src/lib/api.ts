const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/v1";

interface RequestOptions {
  method?: string;
  body?: unknown;
  token?: string;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, token } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Nettverksfeil" }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  auth: {
    register: (data: { email: string; password: string; name: string }) =>
      request<{ user: any; accessToken: string; refreshToken: string }>("/auth/register", { method: "POST", body: data }),
    login: (data: { email: string; password: string }) =>
      request<{ user: any; accessToken: string; refreshToken: string }>("/auth/login", { method: "POST", body: data }),
    me: (token: string) =>
      request<any>("/auth/me", { token }),
  },
  profile: {
    get: (token: string) =>
      request<any>("/profile", { token }),
    update: (token: string, data: any) =>
      request<any>("/profile", { method: "PUT", body: data, token }),
  },
  food: {
    search: (token: string, query: string) =>
      request<any[]>(`/food/search?q=${encodeURIComponent(query)}`, { token }),
    log: (token: string, data: any) =>
      request<any>("/food/log", { method: "POST", body: data, token }),
    getLog: (token: string, date: string) =>
      request<any>(`/food/log?date=${date}`, { token }),
    deleteLog: (token: string, id: string) =>
      request<any>(`/food/log/${id}`, { method: "DELETE", token }),
  },
  weight: {
    log: (token: string, data: { weightKg: number; date: string; note?: string }) =>
      request<any>("/weight", { method: "POST", body: data, token }),
    getEntries: (token: string, from?: string, to?: string) => {
      const params = new URLSearchParams();
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      return request<any[]>(`/weight?${params}`, { token });
    },
    getStats: (token: string) =>
      request<any>("/weight/stats", { token }),
  },
  meals: {
    getPlan: (token: string, week?: string) =>
      request<any>(`/meals/plan${week ? `?week=${week}` : ""}`, { token }),
    generate: (token: string) =>
      request<any>("/meals/generate", { method: "POST", token }),
  },
  exercise: {
    getSuggestions: (token: string) =>
      request<any[]>("/exercise/suggest", { token }),
    log: (token: string, data: any) =>
      request<any>("/exercise/log", { method: "POST", body: data, token }),
    getLog: (token: string, date: string) =>
      request<any>(`/exercise/log?date=${date}`, { token }),
  },
};
