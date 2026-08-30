import { requireConfirmation, requireInternalKey } from '../../lib/auth.js';
import { instagramRequest } from '../../lib/instagram.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!requireInternalKey(req, res)) return;
  if (!requireConfirmation(req, res, 'REPLY_COMMENT')) return;

  const { comment_id, message } = req.body || {};
  if (!comment_id || !message) return res.status(400).json({ error: 'comment_id and message are required' });

  try {
    const data = await instagramRequest(`/${comment_id}/replies`, {
      method: 'POST',
      params: { message },
    });
    return res.status(200).json(data);
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message });
  }
}
