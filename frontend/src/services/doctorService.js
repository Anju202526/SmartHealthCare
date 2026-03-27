import api from './api';

const doctorService = {
  getDashboard: async () => {
    const response = await api.get('/doctors/dashboard');
    return response.data;
  },

  getTodayAppointments: async () => {
    const response = await api.get('/doctors/appointments/today');
    return response.data;
  },

  getSchedule: async (date) => {
    const response = await api.get(`/doctors/schedule${date ? `?date=${date}` : ''}`);
    return response.data;
  },

  getPatients: async () => {
    const response = await api.get('/doctors/patients');
    return response.data;
  },

  getAvailability: async () => {
    const response = await api.get('/doctors/availability');
    return response.data;
  },

  updateAvailability: async (data) => {
    const response = await api.patch('/doctors/availability', data);
    return response.data;
  },

  updateAppointmentStatus: async (appointmentId, status, notes) => {
    const response = await api.put(`/doctors/appointments/${appointmentId}/status`, {
      status,
      notes,
    });
    return response.data;
  },
};

export default doctorService;
