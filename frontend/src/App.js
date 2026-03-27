import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Auth
import Login from './pages/login';
import Register from '../src/pages/Register';

// Patient
import PatientDashboard   from './pages/Patient/PatientDashboard';
import BookAppointment    from './pages/Patient/BookAppointment';
import MyAppointments     from './pages/Patient/MyAppointments';
import MedicalReports     from './pages/Patient/MedicalReports';
import PatientProfile     from './pages/Patient/Profile';

// Doctor
import DoctorDashboard    from './pages/Doctor/DoctorDashboard';
import MySchedule         from './pages/Doctor/MySchedule';
import MyPatients         from './pages/Doctor/MyPatients';
import DoctorAvailability from './pages/Doctor/Availability';

// Admin
import AdminDashboard          from './pages/Admin/AdminDashboard';
import UsersManagement         from './pages/Admin/UsersManagement';
import AppointmentsManagement  from './pages/Admin/AppointmentsManagement';
import AzureServices           from './pages/Admin/AzureServices';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} />
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/"      element={<Navigate to="/login" replace />} />

          {/* Patient */}
          <Route path="/patient" element={<Navigate to="/patient/dashboard" replace />} />
          <Route path="/patient/dashboard"
            element={<ProtectedRoute allowedRoles={['patient']}><PatientDashboard /></ProtectedRoute>} />
          <Route path="/patient/book"
            element={<ProtectedRoute allowedRoles={['patient']}><BookAppointment /></ProtectedRoute>} />
          <Route path="/patient/appointments"
            element={<ProtectedRoute allowedRoles={['patient']}><MyAppointments /></ProtectedRoute>} />
          <Route path="/patient/reports"
            element={<ProtectedRoute allowedRoles={['patient']}><MedicalReports /></ProtectedRoute>} />
          <Route path="/patient/profile"
            element={<ProtectedRoute allowedRoles={['patient']}><PatientProfile /></ProtectedRoute>} />

          {/* Doctor */}
          <Route path="/doctor" element={<Navigate to="/doctor/dashboard" replace />} />
          <Route path="/doctor/dashboard"
            element={<ProtectedRoute allowedRoles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
          <Route path="/doctor/schedule"
            element={<ProtectedRoute allowedRoles={['doctor']}><MySchedule /></ProtectedRoute>} />
          <Route path="/doctor/patients"
            element={<ProtectedRoute allowedRoles={['doctor']}><MyPatients /></ProtectedRoute>} />
          <Route path="/doctor/availability"
            element={<ProtectedRoute allowedRoles={['doctor']}><DoctorAvailability /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard"
            element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users"
            element={<ProtectedRoute allowedRoles={['admin']}><UsersManagement /></ProtectedRoute>} />
          <Route path="/admin/appointments"
            element={<ProtectedRoute allowedRoles={['admin']}><AppointmentsManagement /></ProtectedRoute>} />
          <Route path="/admin/azure"
            element={<ProtectedRoute allowedRoles={['admin']}><AzureServices /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
