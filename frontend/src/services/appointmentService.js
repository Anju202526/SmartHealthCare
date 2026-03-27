import api from './api';

const appointmentService = {
  getAllAppointments: async (filters = {}) => {
    const response = await api.get('/appointments', { params: filters });
    return response.data;
  },

  getAppointmentDetails: async (appointmentId) => {
    const response = await api.get(`/appointments/${appointmentId}`);
    return response.data;
  },

  getAvailableSlots: async (doctorId, date) => {
    const response = await api.get(`/doctors/${doctorId}/slots`, { params: { date } });
    return response.data;
  },

  getAllDoctors: async () => {
    const response = await api.get('/doctors');
    return response.data;
  },
};

export default appointmentService;
