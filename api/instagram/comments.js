import { requireInternalKey } from '../../lib/auth.js';
import { instagramRequest } from '../../lib/instagram.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!requireInternalKey(req, res)) return;
  const mediaId = req.query.media_id;
  if (!mediaId) return res.status(400).json({ error: 'media_id is required' });

  try {
    const data = await instagramRequest(`/${mediaId}/comments`, {
      params: { fields: 'id,from,text,timestamp', limit: Math.min(Number(req.query.limit || 50), 100) },
    });
    return res.status(200).json(data);
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message });
  }
}
