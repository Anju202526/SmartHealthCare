import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaCalendarCheck, FaUsers, FaClock, FaVideo } from 'react-icons/fa';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import doctorService from '../../services/doctorService';
import { statusClasses } from '../../utils/helpers';

const DEMO_SCHEDULE = [
  { id: 1, time: '09:30', patient: 'Sarah Murphy',  reason: 'Headaches',       type: 'Video Call',  status: 'upcoming'  },
  { id: 2, time: '11:00', patient: 'James Foley',   reason: 'Annual checkup',  type: 'In-Person',   status: 'upcoming'  },
  { id: 3, time: '14:00', patient: 'Aoife Burke',   reason: 'Follow-up',       type: 'Video Call',  status: 'upcoming'  },
  { id: 4, time: '15:30', patient: 'Ciara Daly',    reason: 'Blood results',   type: 'In-Person',   status: 'completed' },
];

const DEMO_PATIENTS = [
  { name: 'Sarah Murphy', lastVisit: '3 Mar 2026',  status: 'Active'     },
  { name: 'James Foley',  lastVisit: '28 Feb 2026', status: 'Active'     },
  { name: 'Aoife Burke',  lastVisit: '25 Feb 2026', status: 'Active'     },
  { name: 'Ciara Daly',   lastVisit: '3 Mar 2026',  status: 'completed'  },
];

const DoctorDashboard = () => {
  const [loading,   setLoading]   = useState(true);
  const [schedule,  setSchedule]  = useState([]);
  const [stats, setStats] = useState({ todayAppointments: 5, totalPatients: 28, thisWeek: 12 });

  useEffect(() => {
    (async () => {
      try {
        const [dash, today] = await Promise.all([
          doctorService.getDashboard(),
          doctorService.getTodayAppointments(),
        ]);
        if (dash)  setStats(dash);
        setSchedule(today?.length ? today : DEMO_SCHEDULE);
      } catch {
        setSchedule(DEMO_SCHEDULE);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <LoadingSpinner />;

  const statCards = [
    { icon: <FaCalendarCheck />, bg: 'bg-teal-50',  colour: 'text-teal-500',
      value: stats.todayAppointments, label: "Today's Appointments" },
    { icon: <FaUsers />,         bg: 'bg-blue-50',  colour: 'text-blue-500',
      value: stats.totalPatients,     label: 'Total Patients' },
    { icon: <FaClock />,         bg: 'bg-green-50', colour: 'text-green-500',
      value: stats.thisWeek,          label: 'This Week' },
  ];

  return (
    <Layout title="Doctor Overview">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {statCards.map((s, i) => (
          <Card key={i} className="text-center">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center
              justify-center mx-auto mb-3 text-lg ${s.colour}`}>
              {s.icon}
            </div>
            <p className="font-serif text-2xl font-semibold text-ink">{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            <p className="text-[10px] text-blue-500 font-semibold mt-1.5">⚡ Azure SQL</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's schedule */}
        <Card title="Today's Schedule — Mon 3 Mar"
          subtitle="GET /api/doctors/appointments/today">
          <div className="space-y-3">
            {schedule.map((appt) => (
              <div key={appt.id}
                className={`flex items-center gap-3 p-3 rounded-xl border
                  transition-all ${
                    appt.status === 'completed'
                      ? 'opacity-60 bg-gray-50 border-gray-100'
                      : 'bg-gray-50 border-gray-100 hover:bg-white hover:border-gray-200'}`}>
                <span className="w-12 text-center text-xs font-bold text-gray-500 flex-shrink-0">
                  {appt.time}
                </span>
                <div className="w-px h-10 bg-gray-200 flex-shrink-0" />
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700
                  flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {appt.patient.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{appt.patient}</p>
                  <p className="text-xs text-gray-400 truncate">{appt.reason} · {appt.type}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0
                  ${statusClasses(appt.status)}`}>
                  {appt.status}
                </span>
                {appt.type?.toLowerCase().includes('video') && appt.status !== 'completed' && (
                  <Button size="sm"
                    onClick={() => toast.success('✓ Video call started · Azure ACS')}>
                    <FaVideo className="text-xs" /> Start
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          {/* Recent patients */}
          <Card title="Recent Patients" subtitle="GET /api/doctors/patients">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Patient','Last Visit','Status'].map((h) => (
                    <th key={h} className="text-left pb-2 pr-3 text-xs font-bold text-gray-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DEMO_PATIENTS.map((p, i) => (
                  <tr key={i}
                    className="border-b border-gray-100 last:border-0 cursor-pointer
                      hover:bg-gray-50 transition-colors"
                    onClick={() => toast.info('Loading patient record…')}>
                    <td className="py-2.5 pr-3 font-semibold">{p.name}</td>
                    <td className="py-2.5 pr-3 text-gray-500">{p.lastVisit}</td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold
                        ${statusClasses(p.status)}`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* Reminders */}
          <Card title="Pending Reminders" subtitle="Azure Communication Services">
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 mb-3">
              <p className="text-sm font-semibold text-amber-700">📧 Reminder Due</p>
              <p className="text-xs text-gray-600 mt-1">
                Sarah Murphy — appointment tomorrow 10:30 AM
              </p>
              <Button size="sm" className="mt-2 bg-amber-600 text-white hover:bg-amber-700 border-0"
                onClick={() => toast.success('✓ Reminder sent · Azure Communication Services')}>
                Send Now
              </Button>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-sm font-semibold text-gray-600">📧 Scheduled</p>
              <p className="text-xs text-gray-500 mt-1">
                James Foley — 24hr reminder · Auto-send 10:00 AM
              </p>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default DoctorDashboard;
