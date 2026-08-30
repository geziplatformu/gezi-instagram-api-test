const BASE_URL = 'https://graph.instagram.com';

export function getInstagramToken() {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) throw new Error('INSTAGRAM_ACCESS_TOKEN is not configured');
  return token;
}

export async function instagramRequest(path, { method = 'GET', params = {}, body } = {}) {
  const token = getInstagramToken();
  const url = new URL(`${BASE_URL}${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value));
  }

  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data?.error?.message || `Instagram API request failed (${response.status})`);
    error.status = response.status;
    error.details = data?.error || data;
    throw error;
  }
  return data;
}

export async function getOwnProfile() {
  return instagramRequest('/me', { params: { fields: 'id,username' } });
}
