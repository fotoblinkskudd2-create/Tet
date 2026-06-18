export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const data = response.status === 204 ? null : await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || 'Noe gikk feil');
  }

  return data as T;
}
