import { requireInternalKey } from '../../lib/auth.js';
import { getOwnProfile, instagramRequest } from '../../lib/instagram.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!requireInternalKey(req, res)) return;

  const { video_url, caption = '', share_to_feed = true } = req.body || {};
  if (!video_url) return res.status(400).json({ error: 'video_url is required' });

  try {
    const profile = await getOwnProfile();
    const data = await instagramRequest(`/${profile.id}/media`, {
      method: 'POST',
      params: {
        media_type: 'REELS',
        video_url,
        caption,
        share_to_feed: share_to_feed ? 'true' : 'false',
      },
    });
    return res.status(200).json(data);
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message });
  }
}
