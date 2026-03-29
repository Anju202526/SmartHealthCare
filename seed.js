require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Doctor = require('./models/Doctor');
const Appointment = require('./models/Appointment');
const MedicalReport = require('./models/MedicalReport');

const uri = `mongodb://${process.env.DB_USER}:${encodeURIComponent(process.env.DB_PASSWORD)}@${process.env.DB_SERVER}:${process.env.DB_PORT}/${process.env.DB_NAME}?ssl=true&replicaSet=globaldb&retrywrites=false`;

async function seed() {
  await mongoose.connect(uri);
  console.log('✅ Connected to Cosmos DB');

  // Clear existing data
  await User.deleteMany({});
  await Doctor.deleteMany({});
  await Appointment.deleteMany({});
  await MedicalReport.deleteMany({});
  console.log('🗑️  Cleared existing data');

  // ── CREATE DOCTORS ──────────────────────────────
  const doctors = await Doctor.insertMany([
    {
      name:         'Michael O\'Brien',
      email:        'm.obrien@smartcare.ie',
      specialty:    'General Practice',
      phone:        '+353 1 234 5678',
      fee:          65,
      experience:   '12 years',
      available:    true,
      availability: ['Mon','Tue','Wed','Thu'],
    },
    {
      name:         'Anna Walsh',
      email:        'a.walsh@smartcare.ie',
      specialty:    'Cardiology',
      phone:        '+353 1 234 5679',
      fee:          90,
      experience:   '8 years',
      available:    true,
      availability: ['Mon','Wed','Thu','Fri'],
    },
    {
      name:         'Patricia Nolan',
      email:        'p.nolan@smartcare.ie',
      specialty:    'Pediatrics',
      phone:        '+353 1 234 5680',
      fee:          55,
      experience:   '15 years',
      available:    true,
      availability: ['Tue','Wed','Thu','Fri'],
    },
    {
      name:         'James Connell',
      email:        'j.connell@smartcare.ie',
      specialty:    'Neurology',
      phone:        '+353 1 234 5681',
      fee:          110,
      experience:   '10 years',
      available:    true,
      availability: ['Mon','Tue','Wed'],
    },
  ]);
  console.log(`✅ Created ${doctors.length} doctors`);

  // ── CREATE USERS ────────────────────────────────
  const patient = new User({
    name:       'Sarah Murphy',
    email:      'sarah.murphy@gmail.com',
    password:   'SecurePass123!',
    role:       'patient',
    phone:      '+353 87 123 4567',
    dob:        new Date('1990-03-15'),
    gender:     'Female',
    address:    '14 Oak Street, Dublin 4',
    blood_type: 'A+',
    allergies:  'Penicillin, Pollen',
    is_active:  true,
  });
  await patient.save();

  const patient2 = new User({
    name:       'James Foley',
    email:      'james.foley@gmail.com',
    password:   'SecurePass123!',
    role:       'patient',
    phone:      '+353 87 234 5678',
    dob:        new Date('1985-07-22'),
    gender:     'Male',
    address:    '28 Elm Road, Cork',
    blood_type: 'O+',
    allergies:  'None',
    is_active:  true,
  });
  await patient2.save();

  const doctorUser = new User({
    name:      'Michael O\'Brien',
    email:     'm.obrien@smartcare.ie',
    password:  'DoctorPass123!',
    role:      'doctor',
    is_active: true,
  });
  await doctorUser.save();

  const admin = new User({
    name:      'Admin User',
    email:     'admin@smartcare.ie',
    password:  'AdminPass123!',
    role:      'admin',
    is_active: true,
  });
  await admin.save();
  console.log('✅ Created 4 users');

  // ── CREATE APPOINTMENTS ─────────────────────────
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const appointments = await Appointment.insertMany([
    {
      patient: patient._id,
      doctor:  doctors[0]._id,
      date:    tomorrow.toISOString().split('T')[0],
      time:    '10:30',
      type:    'Video Call',
      fee:     65,
      status:  'Upcoming',
      notes:   'Recurring headaches for 2 weeks',
    },
    {
      patient: patient._id,
      doctor:  doctors[1]._id,
      date:    nextWeek.toISOString().split('T')[0],
      time:    '14:00',
      type:    'In-Person',
      fee:     90,
      status:  'Upcoming',
      notes:   'Annual cardiac checkup',
    },
    {
      patient: patient._id,
      doctor:  doctors[0]._id,
      date:    '2026-01-18',
      time:    '09:30',
      type:    'Video Call',
      fee:     65,
      status:  'Completed',
      notes:   'Blood pressure review',
    },
    {
      patient: patient2._id,
      doctor:  doctors[0]._id,
      date:    tomorrow.toISOString().split('T')[0],
      time:    '11:00',
      type:    'In-Person',
      fee:     65,
      status:  'Upcoming',
      notes:   'Annual checkup',
    },
  ]);
  console.log(`✅ Created ${appointments.length} appointments`);

  // ── CREATE MEDICAL REPORTS ──────────────────────
  await MedicalReport.insertMany([
    {
      patient:     patient._id,
      doctor:      doctors[0]._id,
      title:       'Blood_Test_Jan2026.pdf',
      report_type: 'Blood Test',
      file_size:   '1.2 MB',
      file_url:    'https://smartcarestorage.blob.core.windows.net/patient-reports/blood-test-jan2026.pdf',
    },
    {
      patient:     patient._id,
      doctor:      doctors[1]._id,
      title:       'ECG_Report_Dec2025.pdf',
      report_type: 'ECG',
      file_size:   '0.9 MB',
      file_url:    'https://smartcarestorage.blob.core.windows.net/patient-reports/ecg-dec2025.pdf',
    },
    {
      patient:     patient._id,
      doctor:      doctors[1]._id,
      title:       'Chest_Xray_Nov2025.pdf',
      report_type: 'X-Ray',
      file_size:   '3.8 MB',
      file_url:    'https://smartcarestorage.blob.core.windows.net/patient-reports/chest-xray-nov2025.pdf',
    },
  ]);
  console.log('✅ Created 3 medical reports');

  console.log('========================================');
  console.log('🎉 Database seeded successfully!');
  console.log('========================================');
  console.log('Demo login credentials:');
  console.log('  Patient:  sarah.murphy@gmail.com / SecurePass123!');
  console.log('  Patient2: james.foley@gmail.com  / SecurePass123!');
  console.log('  Doctor:   m.obrien@smartcare.ie  / DoctorPass123!');
  console.log('  Admin:    admin@smartcare.ie      / AdminPass123!');
  console.log('========================================');

  await mongoose.connection.close();
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
