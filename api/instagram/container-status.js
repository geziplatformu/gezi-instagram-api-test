import { requireInternalKey } from '../../lib/auth.js';
import { instagramRequest } from '../../lib/instagram.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!requireInternalKey(req, res)) return;
  const containerId = req.query.container_id;
  if (!containerId) return res.status(400).json({ error: 'container_id is required' });

  try {
    const data = await instagramRequest(`/${containerId}`, { params: { fields: 'status_code,status' } });
    return res.status(200).json(data);
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message });
  }
}
