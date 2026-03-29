const User = require('../models/User');
const Appointment = require('../models/Appointment');

// GET /api/admin/users
async function getAllUsers(req, res) {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ created_at: -1 });

    const formatted = users.map(u => ({
      user_id:    u._id,
      name:       u.name,
      email:      u.email,
      role:       u.role,
      status:     u.is_active ? 'Active' : 'Inactive',
      last_login: u.last_login,
    }));

    res.json(formatted);
  } catch (err) {
    console.error('getAllUsers error:', err);
    res.status(500).json({ error: 'Failed to load users', details: err.message });
  }
}

// PUT /api/admin/users/:id
async function updateUser(req, res) {
  const { id } = req.params;
  const { role, is_active } = req.body;

  try {
    const updates = {};
    if (role      !== undefined) updates.role      = role;
    if (is_active !== undefined) updates.is_active = is_active;

    await User.findByIdAndUpdate(id, updates);

    res.json({ success: true, message: 'User updated' });
  } catch (err) {
    console.error('updateUser error:', err);
    res.status(500).json({ error: 'Failed to update user', details: err.message });
  }
}

// PATCH /api/admin/users/:id/deactivate
async function deactivateUser(req, res) {
  const { id } = req.params;

  try {
    await User.findByIdAndUpdate(id, { is_active: false });
    res.json({ success: true, message: 'User deactivated' });
  } catch (err) {
    console.error('deactivateUser error:', err);
    res.status(500).json({ error: 'Failed to deactivate user', details: err.message });
  }
}

// GET /api/admin/stats
async function getStats(req, res) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0];

    const [totalPatients, activeDoctors, apptsToday, apptsThisWeek] =
      await Promise.all([
        User.countDocuments({ role: 'patient', is_active: true }),
        User.countDocuments({ role: 'doctor',  is_active: true }),
        Appointment.countDocuments({
          date:   today,
          status: { $in: ['Upcoming', 'Confirmed'] },
        }),
        Appointment.countDocuments({
          date:   { $gte: weekAgo },
          status: { $in: ['Upcoming', 'Confirmed', 'Completed'] },
        }),
      ]);

    res.json({
      totalPatients,
      activeDoctors,
      apptsToday,
      apptsThisWeek,
      uptime: '99.8%',
    });
  } catch (err) {
    console.error('getStats error:', err);
    res.status(500).json({ error: 'Failed to load stats', details: err.message });
  }
}

module.exports = { getAllUsers, updateUser, deactivateUser, getStats };
