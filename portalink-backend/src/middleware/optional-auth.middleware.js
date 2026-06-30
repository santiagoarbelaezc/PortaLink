/**
 * Middleware de autenticación opcional.
 * Si hay un JWT válido en el header, decodifica y adjunta req.user.
 * Si no hay token o es inválido, simplemente continúa (req.user = null).
 * Útil para endpoints públicos que también tienen comportamiento especial para logueados.
 */
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      // Token inválido o expirado: no bloqueamos, solo ignoramos
      req.user = null;
    } else {
      req.user = user;
    }
    next();
  });
};
