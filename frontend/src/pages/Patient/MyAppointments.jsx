import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import patientService from '../../services/patientService';
import { statusClasses, typeClasses } from '../../utils/helpers';

const DEMO = [
  { id: 1, doctor: "Dr. M. O'Brien", specialty: 'General Practice',
    date: 'Mon 3 Mar 2026',  time: '10:30 AM', type: 'Video Call',  status: 'upcoming',  fee: '€65' },
  { id: 2, doctor: 'Dr. A. Walsh',   specialty: 'Cardiology',
    date: 'Thu 6 Mar 2026',  time: '2:00 PM',  type: 'In-Person',   status: 'upcoming',  fee: '€90' },
  { id: 3, doctor: 'Dr. P. Nolan',   specialty: 'Pediatrics',
    date: 'Fri 7 Mar 2026',  time: '11:00 AM', type: 'Video Call',  status: 'upcoming',  fee: '€55' },
  { id: 4, doctor: "Dr. M. O'Brien", specialty: 'General Practice',
    date: '18 Jan 2026',     time: '9:30 AM',  type: 'Video Call',  status: 'completed', fee: '€65' },
  { id: 5, doctor: 'Dr. A. Walsh',   specialty: 'Cardiology',
    date: '5 Dec 2025',      time: '2:00 PM',  type: 'In-Person',   status: 'cancelled', fee: '—'  },
];

const MyAppointments = () => {
  const navigate             = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await patientService.getAppointments();
        setAppointments(data?.length ? data : DEMO);
      } catch {
        setAppointments(DEMO);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await patientService.cancelAppointment(id, 'Patient requested cancellation');
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: 'cancelled' } : a))
      );
      toast.success('Appointment cancelled');
    } catch {
      toast.error('Failed to cancel appointment');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Layout title="My Appointments">
      <Card>
        <div className="flex justify-between items-start mb-5">
          <div>
            <h2 className="font-semibold text-gray-900">All Appointments</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              GET /api/appointments/patient · Azure SQL
            </p>
          </div>
          <Button size="sm" onClick={() => navigate('/patient/book')}>
            + New
          </Button>
        </div>

        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-gray-200">
                {['Doctor', 'Date', 'Time', 'Type', 'Status', 'Fee', 'Actions'].map((h) => (
                  <th key={h} className="text-left pb-3 pr-4 text-xs font-bold text-gray-400 uppercase">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {appointments.map((appt) => (
                <tr key={appt.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 pr-4">
                    <p className="font-semibold text-sm">{appt.doctor}</p>
                    <p className="text-xs text-gray-400">{appt.specialty}</p>
                  </td>
                  <td className="py-3 pr-4 text-sm">{appt.date}</td>
                  <td className="py-3 pr-4 text-sm">{appt.time}</td>
                  <td className="py-3 pr-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${typeClasses(appt.type)}`}>
                      {appt.type}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusClasses(appt.status)}`}>
                      {appt.status}
                    </span>
                  </td>
                  <td className="py-3 pr-4 font-semibold text-sm">{appt.fee}</td>
                  <td className="py-3">
                    <div className="flex gap-2 flex-wrap">
                      {appt.status === 'upcoming' && appt.type?.toLowerCase().includes('video') && (
                        <Button size="sm" onClick={() => toast.info('Joining video call…')}>
                          Join Call
                        </Button>
                      )}
                      {appt.status === 'upcoming' && (
                        <Button size="sm" variant="outline"
                          onClick={() => handleCancel(appt.id)}>
                          Cancel
                        </Button>
                      )}
                      {appt.status === 'completed' && (
                        <Button size="sm" variant="outline"
                          onClick={() => toast.info('Loading report…')}>
                          Report
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </Layout>
  );
};

export default MyAppointments;
