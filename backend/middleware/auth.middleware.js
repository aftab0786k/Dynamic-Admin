// backend/middleware/auth.middleware.js
// No-op auth middleware kept for compatibility with imports.
// Token system removed — this middleware simply allows all requests.
export default function authMiddleware(req, res, next) {
  return next();
}
