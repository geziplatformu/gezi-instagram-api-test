export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!token) {
    return res.status(500).json({ error: 'INSTAGRAM_ACCESS_TOKEN is not configured' });
  }

  try {
    const url = new URL('https://graph.instagram.com/me');
    url.searchParams.set('fields', 'id,username');
    url.searchParams.set('access_token', token);

    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
    });
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'Instagram API request failed',
        details: data?.error?.message || 'Unknown Instagram API error',
      });
    }

    return res.status(200).json({
      connected: true,
      id: data.id,
      username: data.username,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Instagram API request failed' });
  }
}
