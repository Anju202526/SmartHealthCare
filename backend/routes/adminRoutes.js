const express = require('express');
const router  = express.Router();

const {
  getAllUsers,
  updateUser,
  deactivateUser,
  getStats,
} = require('../controllers/adminController');

const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All admin routes require authentication + admin role
router.use(authenticateToken);
router.use(authorizeRoles('admin'));

router.get('/users',                  getAllUsers);
router.put('/users/:id',              updateUser);
router.patch('/users/:id/deactivate', deactivateUser);
router.get('/stats',                  getStats);

module.exports = router;
