const express = require('express');
const router = express.Router();

const {
  getPatientAppointments,
  getUpcomingAppointments,
  bookAppointment,
  cancelAppointment,
  getAllAppointments,
  getAppointmentDetails,
} = require('../controllers/appointmentController');

const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken);

// ── Named routes first (MUST be before /:id wildcards) ───────────────────
router.get('/patient',   authorizeRoles('patient'),         getPatientAppointments);
router.get('/upcoming',  authorizeRoles('patient'),         getUpcomingAppointments);
router.post('/book',     authorizeRoles('patient'),         bookAppointment);

// ── Admin named route ─────────────────────────────────────────────────────
router.get('/',          authorizeRoles('admin'),           getAllAppointments);

// ── Parameterised routes last ─────────────────────────────────────────────
router.put('/:id/cancel', authorizeRoles('patient'),        cancelAppointment);
router.get('/:id',        authorizeRoles('admin', 'doctor'), getAppointmentDetails);

module.exports = router;
