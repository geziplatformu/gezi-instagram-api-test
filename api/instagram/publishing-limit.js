import { requireInternalKey } from '../../lib/auth.js';
import { getOwnProfile, instagramRequest } from '../../lib/instagram.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!requireInternalKey(req, res)) return;

  try {
    const profile = await getOwnProfile();
    const data = await instagramRequest(`/${profile.id}/content_publishing_limit`, { params: { fields: 'config,quota_usage' } });
    return res.status(200).json(data);
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message });
  }
}
