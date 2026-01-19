// API client for GraveAI backend

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ApiOptions extends RequestInit {
  token?: string;
}

async function request<T = any>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const { token, headers, ...fetchOptions } = options;

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers: {
      ...defaultHeaders,
      ...headers,
    },
    credentials: 'include', // Send cookies
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: `HTTP ${response.status}: ${response.statusText}`,
    }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

// Auth API
export const auth = {
  async signup(email: string, username: string, password: string) {
    return request('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, username, password }),
    });
  },

  async login(email: string, password: string) {
    return request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async logout() {
    return request('/api/auth/logout', { method: 'POST' });
  },

  async me(token?: string) {
    return request('/api/auth/me', { token });
  },
};

// Deceased persons API
export const deceased = {
  async list(token: string) {
    return request('/api/deceased', { token });
  },

  async get(id: string, token: string) {
    return request(`/api/deceased/${id}`, { token });
  },

  async create(data: any, token: string) {
    return request('/api/deceased', {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    });
  },

  async update(id: string, data: any, token: string) {
    return request(`/api/deceased/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      token,
    });
  },

  async delete(id: string, token: string) {
    return request(`/api/deceased/${id}`, {
      method: 'DELETE',
      token,
    });
  },

  async getStats(id: string, token: string) {
    return request(`/api/deceased/${id}/stats`, { token });
  },
};

// Chat API
export const chat = {
  async sendMessage(data: {
    deceasedPersonId: string;
    message: string;
    conversationId?: string;
    temperature?: number;
  }, token: string) {
    return request('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ ...data, stream: false }),
      token,
    });
  },

  // Streaming chat with Server-Sent Events
  async streamMessage(
    data: {
      deceasedPersonId: string;
      message: string;
      conversationId?: string;
      temperature?: number;
    },
    token: string,
    onChunk: (chunk: string) => void,
    onDone: (result: any) => void,
    onError: (error: string) => void
  ) {
    const response = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ ...data, stream: true }),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to start stream');
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('No response body');
    }

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n\n');

        for (const line of lines) {
          if (!line.trim() || !line.startsWith('data: ')) continue;

          const data = JSON.parse(line.replace('data: ', ''));

          if (data.type === 'chunk') {
            onChunk(data.content);
          } else if (data.type === 'done') {
            onDone(data);
          } else if (data.type === 'error') {
            onError(data.error);
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  },

  async getConversations(deceasedPersonId: string | undefined, token: string) {
    const query = deceasedPersonId ? `?deceasedPersonId=${deceasedPersonId}` : '';
    return request(`/api/chat/conversations${query}`, { token });
  },

  async getConversation(id: string, token: string) {
    return request(`/api/chat/conversations/${id}`, { token });
  },

  async deleteConversation(id: string, token: string) {
    return request(`/api/chat/conversations/${id}`, {
      method: 'DELETE',
      token,
    });
  },
};
