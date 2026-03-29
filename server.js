// SMARTCARE API — MAIN SERVER FILE
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const { connectDB, healthCheck } = require('./config/database');

// Routes
const authRoutes        = require('./routes/authRoutes');
const patientRoutes     = require('./routes/patientRoutes');
const doctorRoutes      = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const medicalRoutes     = require('./routes/medicalRoutes');
const adminRoutes       = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// ── MIDDLEWARE ────────────────────────────────────────────
app.use(helmet());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ── ROUTES ────────────────────────────────────────────────
app.get('/api/health', async (_req, res) => {
  const dbHealth = await healthCheck();
  res.json({
    status: 'running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: dbHealth,
    uptime: process.uptime(),
  });
});

app.use('/api/auth',         authRoutes);
app.use('/api/patients',     patientRoutes);
app.use('/api/doctors',      doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/medical',      medicalRoutes);
app.use('/api/admin',        adminRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.url} does not exist`,
  });
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    status: err.status || 500,
    timestamp: new Date().toISOString(),
  });
});

// SEED ROUTE — protected by secret key, remove after use
app.get('/api/seed/:key', async (req, res) => {
  if (req.params.key !== 'smartcare2026') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  try {
    const User = require('./models/User');
    const Doctor = require('./models/Doctor');
    const Appointment = require('./models/Appointment');
    const MedicalReport = require('./models/MedicalReport');

    await User.deleteMany({});
    await Doctor.deleteMany({});
    await Appointment.deleteMany({});
    await MedicalReport.deleteMany({});

    const doctors = await Doctor.insertMany([
      { name: "Michael O'Brien", email: 'm.obrien@smartcare.ie', specialty: 'General Practice', fee: 65, experience: '12 years', available: true },
      { name: 'Anna Walsh',       email: 'a.walsh@smartcare.ie',  specialty: 'Cardiology',       fee: 90, experience: '8 years',  available: true },
      { name: 'Patricia Nolan',   email: 'p.nolan@smartcare.ie',  specialty: 'Pediatrics',       fee: 55, experience: '15 years', available: true },
      { name: 'James Connell',    email: 'j.connell@smartcare.ie',specialty: 'Neurology',        fee: 110,experience: '10 years', available: true },
    ]);

    const patient = new User({ name: 'Sarah Murphy', email: 'sarah.murphy@gmail.com', password: 'SecurePass123!', role: 'patient', blood_type: 'A+', allergies: 'Penicillin', is_active: true });
    await patient.save();
    const admin = new User({ name: 'Admin User', email: 'admin@smartcare.ie', password: 'AdminPass123!', role: 'admin', is_active: true });
    await admin.save();

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    await Appointment.insertMany([
      { patient: patient._id, doctor: doctors[0]._id, date: tomorrow.toISOString().split('T')[0], time: '10:30', type: 'Video Call', fee: 65, status: 'Upcoming', notes: 'Recurring headaches' },
      { patient: patient._id, doctor: doctors[1]._id, date: tomorrow.toISOString().split('T')[0], time: '14:00', type: 'In-Person',  fee: 90, status: 'Upcoming', notes: 'Cardiac checkup' },
    ]);

    await MedicalReport.insertMany([
      { patient: patient._id, doctor: doctors[0]._id, title: 'Blood_Test_Jan2026.pdf', report_type: 'Blood Test', file_size: '1.2 MB', file_url: '#' },
      { patient: patient._id, doctor: doctors[1]._id, title: 'ECG_Report_Dec2025.pdf', report_type: 'ECG',        file_size: '0.9 MB', file_url: '#' },
    ]);

    res.json({ success: true, message: '✅ Database seeded!', doctors: doctors.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```
// ── START ─────────────────────────────────────────────────
async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log('========================================');
      console.log('🚀 SmartCare API Server Started');
      console.log(`📡 Port: ${PORT}`);
      console.log(`🌐 Env:  ${process.env.NODE_ENV}`);
      console.log(`🔗 Frontend allowed: ${process.env.FRONTEND_URL}`);
      console.log('========================================');
      console.log('Endpoints:');
      console.log('  POST /api/auth/register');
      console.log('  POST /api/auth/login');
      console.log('  GET  /api/auth/me');
      console.log('  GET  /api/patients/dashboard');
      console.log('  GET  /api/doctors');
      console.log('  GET  /api/doctors/:id/slots');
      console.log('  GET  /api/appointments/patient');
      console.log('  POST /api/appointments/book');
      console.log('  GET  /api/medical/reports');
      console.log('  GET  /api/admin/users');
      console.log('  GET  /api/admin/stats');
      console.log('  GET  /api/health');
      console.log('========================================');
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

startServer();

module.exports = app;
