import { requireInternalKey } from '../../lib/auth.js';
import { instagramRequest } from '../../lib/instagram.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!requireInternalKey(req, res)) return;

  const limit = Math.min(Math.max(Number(req.query.limit || 25), 1), 50);
  try {
    const data = await instagramRequest('/me/media', {
      params: {
        fields: 'id,caption,media_type,permalink,timestamp,comments_count,like_count,thumbnail_url',
        limit,
      },
    });
    return res.status(200).json(data);
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message });
  }
}
