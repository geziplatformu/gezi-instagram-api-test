import { instagramRequest } from '../../lib/instagram.js';

const ALLOWED_ORIGINS = new Set([
  'https://www.geziplatformuu.com',
  'https://geziplatformuu.com',
]);

function applyCors(req, res) {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

async function getProfile() {
  try {
    return await instagramRequest('/me', {
      params: {
        fields: 'id,username,name,biography,profile_picture_url,followers_count,follows_count,media_count',
      },
    });
  } catch (error) {
    return instagramRequest('/me', {
      params: { fields: 'id,username,followers_count,follows_count,media_count' },
    });
  }
}

async function getVerifiedStatus() {
  try {
    const data = await instagramRequest('/me', { params: { fields: 'is_verified' } });
    return data?.is_verified === true;
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  applyCors(req, res);

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const [profile, verified, media] = await Promise.all([
      getProfile(),
      getVerifiedStatus(),
      instagramRequest('/me/media', {
        params: {
          fields: 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp',
          limit: 9,
        },
      }),
    ]);

    const posts = (media?.data || []).slice(0, 9).map((item) => ({
      id: item.id,
      caption: item.caption || '',
      media_type: item.media_type,
      image_url: item.thumbnail_url || item.media_url || '',
      permalink: item.permalink || 'https://www.instagram.com/geziplatformuu/',
      timestamp: item.timestamp || null,
    }));

    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=900');
    return res.status(200).json({
      username: profile.username || 'geziplatformuu',
      name: profile.name || 'GEZİ PLATFORMU',
      biography: profile.biography || '',
      profile_picture_url: profile.profile_picture_url || '',
      followers_count: profile.followers_count ?? null,
      follows_count: profile.follows_count ?? null,
      media_count: profile.media_count ?? null,
      is_verified: verified,
      posts,
      refreshed_at: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(error.status || 500).json({ error: 'Instagram public feed unavailable' });
  }
}
