const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();

const { register, login, getCurrentUser, changePassword } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Middleware that returns 422 if express-validator found errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  next();
};

// POST /api/auth/register
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('first_name').notEmpty().withMessage('First name required'),
    body('last_name').notEmpty().withMessage('Last name required'),
  ],
  validate,
  register
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
  ],
  validate,
  login
);

// GET /api/auth/me
router.get('/me', authenticateToken, getCurrentUser);

// POST /api/auth/change-password
router.post('/change-password', authenticateToken, changePassword);

module.exports = router;
