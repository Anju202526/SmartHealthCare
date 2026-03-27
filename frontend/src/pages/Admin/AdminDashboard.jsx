import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import adminService from '../../services/adminService';
import { statusClasses } from '../../utils/helpers';

const DEMO_APPTS = [
  { patient: 'Sarah Murphy', doctor: "Dr. O'Brien", date: '3 Mar', status: 'upcoming'  },
  { patient: 'James Foley',  doctor: "Dr. O'Brien", date: '3 Mar', status: 'upcoming'  },
  { patient: 'Ciara Daly',   doctor: "Dr. O'Brien", date: '3 Mar', status: 'completed' },
  { patient: 'Patrick Ryan', doctor: 'Dr. Walsh',   date: '6 Mar', status: 'upcoming'  },
  { patient: 'Niamh Byrne',  doctor: 'Dr. Nolan',   date: '7 Mar', status: 'cancelled' },
];

const AZURE = [
  { name: 'Azure SQL Database',        status: 'Online',   detail: 'SmartCareDB · West Europe' },
  { name: 'App Service',               status: 'Running',  detail: 'smartcare-api.azurewebsites.net' },
  { name: 'Blob Storage',              status: 'Active',   detail: 'patient-reports container' },
  { name: 'Azure AD B2C',             status: 'Active',   detail: 'SmartCareB2C tenant' },
  { name: 'Communication Services',   status: 'Ready',    detail: 'Video + Email + SMS' },
];

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPatients: 142, activeDoctors: 12, apptsToday: 38, uptime: '99.8%',
  });
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [appts, systemStats] = await Promise.all([
          adminService.getAllAppointments({ limit: 5 }),
          adminService.getSystemStats(),
        ]);
        setAppointments(appts?.length ? appts : DEMO_APPTS);
        if (systemStats) {
          setStats({
            totalPatients: systemStats.totalPatients  ?? 142,
            activeDoctors: systemStats.activeDoctors  ?? 12,
            apptsToday:    systemStats.apptsToday     ?? 38,
            uptime:        systemStats.uptime         ?? '99.8%',
          });
        }
      } catch {
        setAppointments(DEMO_APPTS);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <LoadingSpinner />;

  const statCards = [
    { emoji: '👥', value: stats.totalPatients, label: 'Total Patients',   colour: 'text-teal-600'  },
    { emoji: '🩺', value: stats.activeDoctors, label: 'Active Doctors',   colour: 'text-green-600' },
    { emoji: '📅', value: stats.apptsToday,    label: 'Appointments Today',colour: 'text-blue-600'  },
    { emoji: '☁️', value: stats.uptime,         label: 'Azure Uptime',     colour: 'text-amber-600' },
  ];

  return (
    <Layout title="System Overview">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((s, i) => (
          <Card key={i} className="text-center">
            <div className="text-2xl mb-2">{s.emoji}</div>
            <p className={`font-serif text-2xl font-bold ${s.colour}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            <p className="text-[10px] text-blue-500 font-semibold mt-1.5">⚡ Azure SQL</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointments */}
        <Card title="Recent Appointments"
          subtitle="GET /api/appointments · Azure SQL">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                {['Patient','Doctor','Date','Status'].map((h) => (
                  <th key={h}
                    className="text-left pb-2 pr-3 text-xs font-bold text-gray-400 uppercase">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {appointments.map((a, i) => (
                <tr key={i} className="border-b border-gray-100 last:border-0">
                  <td className="py-2.5 pr-3">{a.patient}</td>
                  <td className="py-2.5 pr-3 text-gray-500">{a.doctor}</td>
                  <td className="py-2.5 pr-3 text-gray-500">{a.date}</td>
                  <td className="py-2.5">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold
                      ${statusClasses(a.status)}`}>
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Azure status */}
        <Card title="Azure Services Status">
          <div className="space-y-2">
            {AZURE.map((svc) => (
              <div key={svc.name}
                className="flex justify-between items-center p-3
                  bg-gray-50 rounded-xl border border-gray-100">
                <div>
                  <p className="text-sm font-semibold">{svc.name}</p>
                  <p className="text-xs text-gray-400">{svc.detail}</p>
                </div>
                <span className="px-2 py-0.5 bg-green-50 text-green-600
                  text-xs font-semibold rounded-full">
                  {svc.status}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
