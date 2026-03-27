import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaCalendarAlt, FaHeartbeat, FaFileAlt, FaUserMd } from 'react-icons/fa';

import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import patientService from '../../services/patientService';
import { statusClasses, typeClasses, getInitials } from '../../utils/helpers';

// ── Demo fallback ────────────────────────────────────────
const DEMO_APPOINTMENTS = [
  { id: 1, doctor: "Dr. Michael O'Brien", specialty: 'General Practitioner',
    date: 'Mon 3 Mar 2026', time: '10:30 AM', type: 'Video Call', status: 'upcoming' },
  { id: 2, doctor: 'Dr. Anna Walsh',      specialty: 'Cardiologist',
    date: 'Thu 6 Mar 2026', time: '2:00 PM',  type: 'In-Person',  status: 'upcoming' },
  { id: 3, doctor: 'Dr. Patricia Nolan',  specialty: 'Pediatrician',
    date: 'Fri 7 Mar 2026', time: '11:00 AM', type: 'Video Call', status: 'upcoming' },
];

const DEMO_METRICS = [
  { label: 'Blood Pressure', value: '118/76',   status: 'Normal',  warning: false },
  { label: 'Glucose',        value: '5.4 mmol', status: 'Normal',  warning: false },
  { label: 'O₂ Saturation',  value: '98%',      status: 'Normal',  warning: false },
  { label: 'Cholesterol',    value: '5.9 mmol', status: 'Monitor', warning: true  },
];

const DEMO_DOCTORS = [
  { name: "Dr. M. O'Brien", specialty: 'General Practice', avail: 'Today', dot: 'bg-green-500', text: 'text-green-600' },
  { name: 'Dr. A. Walsh',   specialty: 'Cardiology',       avail: 'Thu',   dot: 'bg-amber-500', text: 'text-amber-600' },
  { name: 'Dr. P. Nolan',   specialty: 'Pediatrics',       avail: 'Fri',   dot: 'bg-amber-500', text: 'text-amber-600' },
];
// ─────────────────────────────────────────────────────────

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [loading,      setLoading]      = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [stats,        setStats]        = useState({
    upcomingAppointments: 3,
    heartRate:  72,
    reports:    7,
    lastVisit: '18 Jan 2026',
  });

  useEffect(() => {
    (async () => {
      try {
        const [apptData, dashData] = await Promise.all([
          patientService.getUpcomingAppointments(),
          patientService.getDashboard(),
        ]);
        setAppointments(apptData?.length ? apptData : DEMO_APPOINTMENTS);
        if (dashData) {
          setStats((prev) => ({
            ...prev,
            upcomingAppointments: dashData.upcomingAppointments ?? prev.upcomingAppointments,
            lastVisit:            dashData.lastVisit            ?? prev.lastVisit,
          }));
        }
      } catch {
        setAppointments(DEMO_APPOINTMENTS);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const statCards = [
    { icon: <FaCalendarAlt className="text-teal-500" />, bg: 'bg-teal-50',
      value: stats.upcomingAppointments, label: 'Upcoming Appointments',
      onClick: () => navigate('/patient/appointments') },
    { icon: <FaHeartbeat className="text-green-600" />,  bg: 'bg-green-50',
      value: `${stats.heartRate} bpm`,   label: 'Heart Rate' },
    { icon: <FaFileAlt className="text-blue-600" />,     bg: 'bg-blue-50',
      value: stats.reports,              label: 'Medical Reports',
      onClick: () => navigate('/patient/reports') },
    { icon: <FaUserMd className="text-amber-600" />,     bg: 'bg-amber-50',
      value: stats.lastVisit,            label: 'Last Visit' },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <Layout title="Dashboard">
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((card, i) => (
          <Card key={i} onClick={card.onClick}>
            <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center mb-3 text-lg`}>
              {card.icon}
            </div>
            <p className="font-serif text-2xl font-semibold text-ink">{card.value}</p>
            <p className="text-xs text-gray-400 font-medium mt-0.5">{card.label}</p>
            <p className="text-[10px] text-blue-500 font-semibold mt-1.5">⚡ Azure SQL</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming appointments */}
        <Card title="Upcoming Appointments" subtitle="Azure SQL · appointments table">
          <div className="space-y-3">
            {appointments.map((appt) => (
              <div
                key={appt.id}
                className="flex items-center gap-3 p-3 rounded-xl border border-gray-100
                  bg-gray-50 hover:bg-white hover:border-gray-200 transition-all cursor-pointer"
              >
                {/* Avatar — uses getInitials for safety */}
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700
                  flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {getInitials(appt.doctor || 'Dr')}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{appt.doctor}</p>
                  <p className="text-xs text-gray-400">{appt.specialty}</p>
                  <div className="flex gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                    <span>{appt.date}</span>
                    <span>{appt.time}</span>
                    <span className={`px-1.5 py-0.5 rounded-full font-semibold ${typeClasses(appt.type)}`}>
                      {appt.type}
                    </span>
                  </div>
                </div>

                <span className={`px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0
                  ${statusClasses(appt.status)}`}>
                  {appt.status}
                </span>

                {appt.type?.toLowerCase().includes('video') && (
                  <Button size="sm" onClick={() => toast.info('Joining video call…')}>
                    Join
                  </Button>
                )}
              </div>
            ))}

            {appointments.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-6">No upcoming appointments.</p>
            )}
          </div>

          <Button
            variant="outline"
            fullWidth
            className="mt-4"
            onClick={() => navigate('/patient/appointments')}
          >
            View All Appointments
          </Button>
        </Card>

        <div className="space-y-6">
          {/* Health metrics */}
          <Card title="Health Metrics" subtitle="Azure SQL · health_metrics">
            <div className="grid grid-cols-2 gap-3">
              {DEMO_METRICS.map((m) => (
                <div
                  key={m.label}
                  className={`p-3 rounded-xl border ${
                    m.warning ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-100'
                  }`}
                >
                  <p className="text-[10px] uppercase tracking-wide text-gray-400 font-bold mb-1">
                    {m.label}
                  </p>
                  <p className="font-serif text-xl font-semibold text-ink">{m.value}</p>
                  <p className={`text-xs font-semibold mt-1 ${m.warning ? 'text-amber-600' : 'text-green-600'}`}>
                    ● {m.status}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* My doctors */}
          <Card title="My Doctors">
            <div className="space-y-1">
              {DEMO_DOCTORS.map((doc) => (
                <div
                  key={doc.name}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50
                    cursor-pointer transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-500 to-teal-700
                    flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {getInitials(doc.name)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{doc.name}</p>
                    <p className="text-xs text-gray-400">{doc.specialty}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${doc.dot}`} />
                    <span className={`text-xs font-semibold ${doc.text}`}>{doc.avail}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default PatientDashboard;
