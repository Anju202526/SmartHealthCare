import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import adminService from '../../services/adminService';
import { statusClasses, typeClasses } from '../../utils/helpers';

const DEMO = [
  { id: 'APT-1001', patient: 'Sarah Murphy', doctor: "Dr. O'Brien", date: 'Mon 3 Mar', type: 'Video Call',  status: 'upcoming',  fee: '€65' },
  { id: 'APT-1002', patient: 'Sarah Murphy', doctor: 'Dr. Walsh',   date: 'Thu 6 Mar', type: 'In-Person',   status: 'upcoming',  fee: '€90' },
  { id: 'APT-1003', patient: 'James Foley',  doctor: "Dr. O'Brien", date: 'Mon 3 Mar', type: 'In-Person',   status: 'upcoming',  fee: '€65' },
  { id: 'APT-0998', patient: 'Ciara Daly',   doctor: "Dr. O'Brien", date: 'Mon 3 Mar', type: 'In-Person',   status: 'completed', fee: '€65' },
  { id: 'APT-0997', patient: 'Niamh Byrne',  doctor: 'Dr. Nolan',   date: 'Fri 7 Mar', type: 'Video Call',  status: 'cancelled', fee: '—'   },
];

const AppointmentsManagement = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [filter,       setFilter]       = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await adminService.getAllAppointments();
        setAppointments(data?.length ? data : DEMO);
      } catch {
        setAppointments(DEMO);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = appointments.filter((a) =>
    !filter || (a.status || '').toLowerCase() === filter.toLowerCase()
  );

  if (loading) return <LoadingSpinner />;

  return (
    <Layout title="All Appointments">
      <Card>
        <div className="flex justify-between items-start mb-5 flex-wrap gap-3">
          <div>
            <h2 className="font-semibold">All Appointments ({appointments.length})</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              GET /api/appointments · Azure SQL
            </p>
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 text-sm border-2 border-gray-200 rounded-lg
              focus:border-teal-500 outline-none bg-white"
          >
            <option value="">All statuses</option>
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full min-w-[680px]">
            <thead>
              <tr className="border-b border-gray-200">
                {['ID','Patient','Doctor','Date','Type','Status','Fee'].map((h) => (
                  <th key={h}
                    className="text-left pb-3 pr-4 text-xs font-bold text-gray-400 uppercase">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((a, i) => (
                <tr key={i}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 pr-4 text-xs font-mono text-gray-500">
                    {a.id || a.appointment_code}
                  </td>
                  <td className="py-3 pr-4 text-sm font-medium">{a.patient}</td>
                  <td className="py-3 pr-4 text-sm text-gray-500">{a.doctor}</td>
                  <td className="py-3 pr-4 text-sm">{a.date}</td>
                  <td className="py-3 pr-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold
                      ${typeClasses(a.type)}`}>
                      {a.type}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold
                      ${statusClasses(a.status)}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="py-3 font-semibold text-sm">{a.fee}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </Layout>
  );
};

export default AppointmentsManagement;
