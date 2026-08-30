async function ig(path, token) {
  const url = new URL(`https://graph.instagram.com${path}`);
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  const data = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, data };
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) return res.status(500).json({ error: 'Token missing' });

  const profile = await ig('/me?fields=id,username', token);
  if (!profile.ok) return res.status(200).json({ profile: { ok: false, status: profile.status } });

  const userId = profile.data.id;
  const media = await ig('/me/media?fields=id,media_type,timestamp&limit=1', token);
  const mediaId = media.data?.data?.[0]?.id;

  const insights = await ig(`/${userId}/insights?metric=reach,profile_views&period=day`, token);
  const conversations = await ig('/me/conversations?limit=1', token);
  const comments = mediaId ? await ig(`/${mediaId}/comments?fields=id&limit=1`, token) : { ok: null, status: null };

  return res.status(200).json({
    profile: { ok: profile.ok, status: profile.status },
    media: { ok: media.ok, status: media.status, has_media: Boolean(mediaId) },
    insights: { ok: insights.ok, status: insights.status, error: insights.ok ? null : insights.data?.error?.message },
    comments: { ok: comments.ok, status: comments.status, error: comments.ok ? null : comments.data?.error?.message },
    messages: { ok: conversations.ok, status: conversations.status, error: conversations.ok ? null : conversations.data?.error?.message },
  });
}
