const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getPool, sql } = require('../config/database');

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

const generateToken = (userId, email, role) => {
  return jwt.sign({ userId, email, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });
};

// ── REGISTER ──────────────────────────────────────────────
async function register(req, res) {
  const {
    email,
    password,
    role,
    first_name,
    last_name,
    phone,
    dob,
    gender,
    address,
  } = req.body;

  const pool = getPool();
  const transaction = pool.transaction();

  try {
    await transaction.begin();

    const existingUser = await transaction
      .request()
      .input('email', sql.NVarChar, email)
      .query('SELECT user_id FROM Users WHERE email = @email');

    if (existingUser.recordset.length > 0) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await hashPassword(password);

    const userResult = await transaction
      .request()
      .input('email', sql.NVarChar, email)
      .input('password_hash', sql.NVarChar, hashedPassword)
      .input('role', sql.NVarChar, role || 'patient')
      .input('is_active', sql.Bit, true)
      .query(`
        INSERT INTO Users (email, password_hash, role, is_active, created_at, updated_at)
        OUTPUT INSERTED.user_id
        VALUES (@email, @password_hash, @role, @is_active, GETUTCDATE(), GETUTCDATE())
      `);

    const userId = userResult.recordset[0].user_id;

    if (!role || role === 'patient') {
      await transaction
        .request()
        .input('user_id', sql.Int, userId)
        .input('first_name', sql.NVarChar, first_name)
        .input('last_name', sql.NVarChar, last_name)
        .input('email', sql.NVarChar, email)
        .input('phone', sql.NVarChar, phone || null)
        .input('dob', sql.Date, dob || null)
        .input('gender', sql.NVarChar, gender || null)
        .input('address', sql.NVarChar, address || null)
        .query(`
          INSERT INTO Patients
            (user_id, first_name, last_name, email, phone, dob, gender, address, created_at, updated_at)
          VALUES
            (@user_id, @first_name, @last_name, @email, @phone, @dob, @gender, @address, GETUTCDATE(), GETUTCDATE())
        `);
    }

    if (role === 'doctor') {
      await transaction
        .request()
        .input('user_id', sql.Int, userId)
        .input('first_name', sql.NVarChar, first_name)
        .input('last_name', sql.NVarChar, last_name)
        .input('email', sql.NVarChar, email)
        .input('phone', sql.NVarChar, phone || null)
        .input('specialty', sql.NVarChar, req.body.specialty || 'General Practice')
        .input('license_no', sql.NVarChar, req.body.license_no || null)
        .query(`
          INSERT INTO Doctors
            (user_id, first_name, last_name, email, phone, specialty, license_no, created_at)
          VALUES
            (@user_id, @first_name, @last_name, @email, @phone, @specialty, @license_no, GETUTCDATE())
        `);
    }

    const token = generateToken(userId, email, role || 'patient');

    await transaction
      .request()
      .input('user_id', sql.Int, userId)
      .input('action', sql.NVarChar, 'REGISTER')
      .input('table_name', sql.NVarChar, 'Users')
      .input('record_id', sql.Int, userId)
      .input('ip_address', sql.NVarChar, req.ip || null)
      .query(`
        INSERT INTO AuditLogs (user_id, action, table_name, record_id, ip_address, timestamp)
        VALUES (@user_id, @action, @table_name, @record_id, @ip_address, GETUTCDATE())
      `);

    await transaction.commit();

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: { user_id: userId, email, role: role || 'patient', first_name, last_name },
    });
  } catch (err) {
    await transaction.rollback();
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed', details: err.message });
  }
}

// ── LOGIN ─────────────────────────────────────────────────
async function login(req, res) {
  const { email, password } = req.body;
  const pool = getPool();

  try {
    const userResult = await pool
      .request()
      .input('email', sql.NVarChar, email)
      .query(`
        SELECT u.user_id, u.email, u.password_hash, u.role, u.is_active,
               p.patient_id, p.first_name AS p_first, p.last_name AS p_last,
               d.doctor_id, d.first_name AS d_first, d.last_name AS d_last
        FROM Users u
        LEFT JOIN Patients p ON u.user_id = p.user_id
        LEFT JOIN Doctors  d ON u.user_id = d.user_id
        WHERE u.email = @email
      `);

    if (userResult.recordset.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = userResult.recordset[0];

    if (!user.is_active) {
      return res.status(401).json({ error: 'Account is deactivated. Contact admin.' });
    }

    const isValid = await comparePassword(password, user.password_hash);
    if (!isValid) {
      await pool
        .request()
        .input('user_id', sql.Int, user.user_id)
        .input('action', sql.NVarChar, 'LOGIN_FAILED')
        .input('ip_address', sql.NVarChar, req.ip || null)
        .query(
          'INSERT INTO AuditLogs (user_id, action, ip_address, timestamp) VALUES (@user_id, @action, @ip_address, GETUTCDATE())'
        );
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    await pool
      .request()
      .input('user_id', sql.Int, user.user_id)
      .query('UPDATE Users SET last_login = GETUTCDATE() WHERE user_id = @user_id');

    const token = generateToken(user.user_id, user.email, user.role);

    await pool
      .request()
      .input('user_id', sql.Int, user.user_id)
      .input('action', sql.NVarChar, 'LOGIN_SUCCESS')
      .input('ip_address', sql.NVarChar, req.ip || null)
      .query(
        'INSERT INTO AuditLogs (user_id, action, ip_address, timestamp) VALUES (@user_id, @action, @ip_address, GETUTCDATE())'
      );

    const firstName = user.p_first || user.d_first || (user.role === 'admin' ? 'Admin' : '');
    const lastName  = user.p_last  || user.d_last  || (user.role === 'admin' ? 'User'  : '');

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        user_id: user.user_id,
        email: user.email,
        role: user.role,
        name: `${firstName} ${lastName}`.trim(),
        patient_id: user.patient_id || null,
        doctor_id: user.doctor_id || null,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
}

// ── GET CURRENT USER ──────────────────────────────────────
async function getCurrentUser(req, res) {
  const pool = getPool();
  try {
    const result = await pool
      .request()
      .input('user_id', sql.Int, req.user.user_id)
      .query(`
        SELECT u.user_id, u.email, u.role, u.is_active, u.last_login,
               p.patient_id, p.first_name, p.last_name, p.phone, p.dob, p.gender, p.address,
               d.doctor_id, d.specialty, d.license_no
        FROM Users u
        LEFT JOIN Patients p ON u.user_id = p.user_id
        LEFT JOIN Doctors  d ON u.user_id = d.user_id
        WHERE u.user_id = @user_id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
}

// ── CHANGE PASSWORD ───────────────────────────────────────
async function changePassword(req, res) {
  const { current_password, new_password } = req.body;
  const pool = getPool();

  try {
    const userResult = await pool
      .request()
      .input('user_id', sql.Int, req.user.user_id)
      .query('SELECT password_hash FROM Users WHERE user_id = @user_id');

    const isValid = await comparePassword(
      current_password,
      userResult.recordset[0].password_hash
    );
    if (!isValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const newHash = await hashPassword(new_password);

    await pool
      .request()
      .input('user_id', sql.Int, req.user.user_id)
      .input('password_hash', sql.NVarChar, newHash)
      .query(
        'UPDATE Users SET password_hash = @password_hash, updated_at = GETUTCDATE() WHERE user_id = @user_id'
      );

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Failed to change password' });
  }
}

module.exports = { register, login, getCurrentUser, changePassword };
