import api from './api';

const patientService = {
  getDashboard: async () => {
    const response = await api.get('/patients/dashboard');
    return response.data;
  },

  getUpcomingAppointments: async () => {
    const response = await api.get('/appointments/upcoming');
    return response.data;
  },

  getAppointments: async () => {
    const response = await api.get('/appointments/patient');
    return response.data;
  },

  bookAppointment: async (data) => {
    const response = await api.post('/appointments/book', data);
    return response.data;
  },

  cancelAppointment: async (appointmentId, reason) => {
    const response = await api.put(`/appointments/${appointmentId}/cancel`, { reason });
    return response.data;
  },

  getMedicalReports: async () => {
    const response = await api.get('/medical/reports');
    return response.data;
  },

  downloadReport: async (reportId) => {
    const response = await api.get(`/medical/reports/${reportId}/download`);
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/patients/profile', profileData);
    return response.data;
  },

  getHealthMetrics: async () => {
    const response = await api.get('/patients/health-metrics');
    return response.data;
  },
};

export default patientService;
