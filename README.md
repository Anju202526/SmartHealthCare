# SmartCare Healthcare Platform

Full-stack healthcare system with a React frontend and Node.js/Express backend,
connected to Azure SQL Database.

---

## Project Structure

```
smartcare/
├── backend/          ← Express API (Node.js)
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── appointmentController.js
│   │   ├── authController.js
│   │   ├── doctorController.js
│   │   ├── medicalController.js
│   │   └── patientController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── appointmentRoutes.js
│   │   ├── authRoutes.js
│   │   ├── doctorRoutes.js
│   │   ├── medicalRoutes.js
│   │   └── patientRoutes.js
│   ├── .env
│   ├── package.json
│   └── server.js
│
└── frontend/         ← React app (Create React App + Tailwind CSS)
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── common/   (Button, Card, LoadingSpinner, Modal, ProtectedRoute, Toast)
    │   │   ├── forms/    (Input, Select, TextArea)
    │   │   └── layout/   (Header, Layout, Sidebar)
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── hooks/
    │   │   └── useAuth.js
    │   ├── pages/
    │   │   ├── Admin/    (AdminDashboard, AppointmentsManagement, AzureServices, UsersManagement)
    │   │   ├── Doctor/   (Availability, DoctorDashboard, MyPatients, MySchedule)
    │   │   ├── Patient/  (BookAppointment, MedicalReports, MyAppointments, PatientDashboard, Profile)
    │   │   └── login.jsx
    │   ├── services/     (adminService, api, appointmentService, authService, doctorService, patientService)
    │   ├── utils/
    │   │   └── helpers.js
    │   ├── App.js
    │   ├── index.css
    │   └── index.js
    ├── .env
    ├── package.json
    ├── postcss.config.js
    └── tailwind.config.js
```

---

## Setup & Run

### 1 — Backend

```bash
cd backend
npm install
```

Edit `backend/.env` and confirm your Azure SQL credentials are correct:
```
DB_SERVER=smart-care-db.database.windows.net
DB_NAME=SmartCareDB
DB_USER=SmartCareDB
DB_PASSWORD=your_password_here
FRONTEND_URL=http://localhost:3001
```

Then start:
```bash
npm run dev       # development (nodemon, auto-restart)
# or
npm start         # production
```
Backend runs on **http://localhost:3000**

---

### 2 — Frontend

```bash
cd frontend
npm install
npm start
```

Frontend runs on **http://localhost:3001**  
All `/api/*` requests are automatically proxied to `localhost:3000`
(configured via `"proxy"` in `frontend/package.json`).

---

## API Endpoints

| Method | Endpoint                        | Role     | Description                  |
|--------|---------------------------------|----------|------------------------------|
| POST   | /api/auth/register              | Public   | Register new user            |
| POST   | /api/auth/login                 | Public   | Login, returns JWT           |
| GET    | /api/auth/me                    | Any      | Get current user profile     |
| GET    | /api/patients/dashboard         | Patient  | Dashboard stats              |
| GET    | /api/patients/profile           | Patient  | Get profile                  |
| PUT    | /api/patients/profile           | Patient  | Update profile               |
| GET    | /api/patients/health-metrics    | Patient  | Latest health metrics        |
| GET    | /api/appointments/patient       | Patient  | All patient appointments     |
| GET    | /api/appointments/upcoming      | Patient  | Next 5 upcoming appointments |
| POST   | /api/appointments/book          | Patient  | Book new appointment         |
| PUT    | /api/appointments/:id/cancel    | Patient  | Cancel appointment           |
| GET    | /api/doctors                    | Any auth | List all doctors             |
| GET    | /api/doctors/:id/slots          | Any auth | Available time slots         |
| GET    | /api/doctors/dashboard          | Doctor   | Doctor dashboard stats       |
| GET    | /api/doctors/appointments/today | Doctor   | Today's appointments         |
| GET    | /api/doctors/schedule           | Doctor   | Schedule for a date          |
| GET    | /api/doctors/patients           | Doctor   | Doctor's patient list        |
| GET    | /api/doctors/availability       | Doctor   | Get availability settings    |
| PATCH  | /api/doctors/availability       | Doctor   | Update availability          |
| GET    | /api/medical/reports            | Patient  | Patient's medical reports    |
| GET    | /api/medical/reports/:id/download | Patient | Get download URL           |
| POST   | /api/medical/reports/upload     | Patient  | Save uploaded report record  |
| GET    | /api/admin/users                | Admin    | All users                    |
| PUT    | /api/admin/users/:id            | Admin    | Update user                  |
| PATCH  | /api/admin/users/:id/deactivate | Admin    | Deactivate user              |
| GET    | /api/admin/stats                | Admin    | System statistics            |
| GET    | /api/appointments               | Admin    | All appointments (filtered)  |
| GET    | /api/health                     | Public   | Server + DB health check     |

---

## Authentication

All protected routes require:
```
Authorization: Bearer <jwt_token>
```

The token is returned from `/api/auth/login` and stored in `localStorage` by the frontend.

### Demo Credentials
These must exist in your Azure SQL database:

| Role    | Email                        | Password         |
|---------|------------------------------|------------------|
| Patient | sarah.murphy@gmail.com       | SecurePass123!   |
| Doctor  | dr.obrien@beaumont.ie        | DoctorPass123!   |
| Admin   | admin@smartcare.ie           | AdminPass123!    |

---

## Azure SQL Tables Required

The backend expects these tables to exist in your Azure SQL database:

- `Users` — user_id, email, password_hash, role, is_active, last_login, created_at, updated_at
- `Patients` — patient_id, user_id, first_name, last_name, email, phone, dob, gender, address, allergies, blood_type, primary_condition, created_at, updated_at
- `Doctors` — doctor_id, user_id, first_name, last_name, email, phone, specialty, license_no, experience, consultation_fee, created_at
- `Appointments` — appointment_id, patient_id, doctor_id, appointment_date, appointment_time, consultation_type, reason, fee, status, doctor_notes, cancel_reason, created_at, updated_at
- `DoctorAvailability` — doctor_id, start_time, end_time, slot_duration_mins, max_patients, days_available, updated_at
- `MedicalReports` — report_id, patient_id, doctor_id, report_name, report_type, file_size, blob_url, upload_date
- `HealthMetrics` — metric_id, patient_id, blood_pressure_sys, blood_pressure_dia, heart_rate, glucose, oxygen_saturation, cholesterol, recorded_at
- `AuditLogs` — log_id, user_id, action, table_name, record_id, ip_address, timestamp
