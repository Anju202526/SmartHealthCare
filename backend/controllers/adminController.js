const { getPool, sql } = require('../config/database');

// GET /api/admin/users
async function getAllUsers(req, res) {
  const pool = getPool();
  try {
    const result = await pool.request().query(`
      SELECT
        u.user_id,
        u.email,
        u.role,
        u.is_active,
        u.last_login,
        u.created_at,
        COALESCE(p.first_name, d.first_name, 'Admin') AS first_name,
        COALESCE(p.last_name,  d.last_name,  'User')  AS last_name,
        CONCAT(
          COALESCE(p.first_name, d.first_name, 'Admin'),
          ' ',
          COALESCE(p.last_name,  d.last_name,  'User')
        ) AS name
      FROM Users u
      LEFT JOIN Patients p ON u.user_id = p.user_id
      LEFT JOIN Doctors  d ON u.user_id = d.user_id
      ORDER BY u.created_at DESC
    `);

    // Shape for frontend
    const users = result.recordset.map((u) => ({
      user_id: u.user_id,
      name:    u.name.trim(),
      email:   u.email,
      role:    u.role,
      status:  u.is_active ? 'Active' : 'Inactive',
      last_login: u.last_login,
    }));

    res.json(users);
  } catch (err) {
    console.error('getAllUsers error:', err);
    res.status(500).json({ error: 'Failed to load users', details: err.message });
  }
}

// PUT /api/admin/users/:id
async function updateUser(req, res) {
  const { id } = req.params;
  const { role, is_active } = req.body;
  const pool = getPool();

  try {
    const request = pool.request().input('user_id', sql.Int, id);

    let setParts = ['updated_at = GETUTCDATE()'];
    if (role      !== undefined) { setParts.push('role = @role');           request.input('role',      sql.NVarChar, role); }
    if (is_active !== undefined) { setParts.push('is_active = @is_active'); request.input('is_active', sql.Bit,      is_active); }

    await request.query(
      `UPDATE Users SET ${setParts.join(', ')} WHERE user_id = @user_id`
    );

    res.json({ success: true, message: 'User updated' });
  } catch (err) {
    console.error('updateUser error:', err);
    res.status(500).json({ error: 'Failed to update user', details: err.message });
  }
}

// PATCH /api/admin/users/:id/deactivate
async function deactivateUser(req, res) {
  const { id } = req.params;
  const pool = getPool();

  try {
    await pool
      .request()
      .input('user_id', sql.Int, id)
      .query(
        'UPDATE Users SET is_active = 0, updated_at = GETUTCDATE() WHERE user_id = @user_id'
      );

    res.json({ success: true, message: 'User deactivated' });
  } catch (err) {
    console.error('deactivateUser error:', err);
    res.status(500).json({ error: 'Failed to deactivate user', details: err.message });
  }
}

// GET /api/admin/stats — dashboard summary numbers
async function getStats(req, res) {
  const pool = getPool();
  try {
    const [patients, doctors, todayAppts, weekAppts] = await Promise.all([
      pool.request().query(
        "SELECT COUNT(*) AS cnt FROM Users WHERE role = 'patient' AND is_active = 1"
      ),
      pool.request().query(
        "SELECT COUNT(*) AS cnt FROM Users WHERE role = 'doctor'  AND is_active = 1"
      ),
      pool.request().query(
        `SELECT COUNT(*) AS cnt FROM Appointments
         WHERE appointment_date = CAST(GETUTCDATE() AS DATE)
           AND status IN ('upcoming','confirmed')`
      ),
      pool.request().query(
        `SELECT COUNT(*) AS cnt FROM Appointments
         WHERE appointment_date >= CAST(DATEADD(DAY, -6, GETUTCDATE()) AS DATE)
           AND status IN ('upcoming','confirmed','completed')`
      ),
    ]);

    res.json({
      totalPatients:  patients.recordset[0].cnt,
      activeDoctors:  doctors.recordset[0].cnt,
      apptsToday:     todayAppts.recordset[0].cnt,
      apptsThisWeek:  weekAppts.recordset[0].cnt,
      uptime:         '99.8%', // could pull from Azure Monitor in production
    });
  } catch (err) {
    console.error('getStats error:', err);
    res.status(500).json({ error: 'Failed to load stats', details: err.message });
  }
}

module.exports = { getAllUsers, updateUser, deactivateUser, getStats };
