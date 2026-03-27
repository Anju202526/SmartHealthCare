const jwt = require('jsonwebtoken');
const { getPool, sql } = require('../config/database');

async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const pool = getPool();
    const result = await pool
      .request()
      .input('userId', sql.Int, decoded.userId)
      .query(
        'SELECT user_id, email, role, is_active FROM Users WHERE user_id = @userId'
      );

    if (result.recordset.length === 0 || !result.recordset[0].is_active) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    req.user = result.recordset[0];
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(403).json({ error: 'Invalid token' });
  }
}

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Required role: ${allowedRoles.join(', ')}`,
      });
    }
    next();
  };
}

module.exports = { authenticateToken, authorizeRoles };
