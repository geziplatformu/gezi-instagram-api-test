import { requireConfirmation, requireInternalKey } from '../../lib/auth.js';
import { getOwnProfile, instagramRequest } from '../../lib/instagram.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!requireInternalKey(req, res)) return;
  if (!requireConfirmation(req, res, 'SEND_MESSAGE')) return;

  const { recipient_id, text } = req.body || {};
  if (!recipient_id || !text) return res.status(400).json({ error: 'recipient_id and text are required' });

  try {
    const profile = await getOwnProfile();
    const data = await instagramRequest(`/${profile.id}/messages`, {
      method: 'POST',
      body: { recipient: { id: recipient_id }, message: { text } },
    });
    return res.status(200).json(data);
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message });
  }
}
