// backend/middleware/auth.middleware.js
// ESM-friendly admin auth middleware (default export)

export default function authMiddleware(req, res, next) {
  const token = req.headers['x-admin-token'] || req.headers['authorization'];
  const expected = process.env.ADMIN_TOKEN;

  // If ADMIN_TOKEN is not set in .env we allow access but log a warning.
  if (!expected) {
    console.warn('ADMIN_TOKEN not set in .env - admin routes are NOT protected');
    return next();
  }

  if (!token) {
    return res.status(401).json({ error: 'Missing admin token' });
  }

  // support Bearer token or raw token
  const raw = typeof token === 'string' && token.startsWith('Bearer ') ? token.slice(7) : token;
  if (raw !== expected) {
    return res.status(401).json({ error: 'Invalid admin token' });
  }

  next();
}
