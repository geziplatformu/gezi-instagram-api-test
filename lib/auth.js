import crypto from 'crypto';

function safeEqual(a, b) {
  const aBuf = Buffer.from(String(a || ''));
  const bBuf = Buffer.from(String(b || ''));
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

export function requireInternalKey(req, res) {
  const expected = process.env.INTERNAL_API_KEY;
  if (!expected) {
    res.status(503).json({ error: 'INTERNAL_API_KEY is not configured' });
    return false;
  }

  const headerKey = req.headers['x-api-key'];
  const auth = req.headers.authorization || '';
  const bearer = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  const supplied = headerKey || bearer;

  if (!safeEqual(supplied, expected)) {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }
  return true;
}

export function requireConfirmation(req, res, expectedAction) {
  if (req.headers['x-confirm-action'] !== expectedAction) {
    res.status(409).json({
      error: 'Confirmation required',
      required_header: 'x-confirm-action',
      required_value: expectedAction,
    });
    return false;
  }
  return true;
}
