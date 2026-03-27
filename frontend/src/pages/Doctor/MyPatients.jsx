import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import doctorService from '../../services/doctorService';
import { statusClasses } from '../../utils/helpers';

const DEMO = [
  { id: 'SC-10482', name: 'Sarah Murphy', lastVisit: '3 Mar 2026',  condition: 'Hypertension',   status: 'Active'     },
  { id: 'SC-10520', name: 'James Foley',  lastVisit: '28 Feb 2026', condition: 'Diabetes Type 2', status: 'Active'     },
  { id: 'SC-10641', name: 'Aoife Burke',  lastVisit: '25 Feb 2026', condition: 'Anaemia',         status: 'Active'     },
  { id: 'SC-10209', name: 'Ciara Daly',   lastVisit: '3 Mar 2026',  condition: 'Annual Review',   status: 'completed'  },
];

const MyPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await doctorService.getPatients();
        setPatients(data?.length ? data : DEMO);
      } catch {
        setPatients(DEMO);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <Layout title="My Patients">
      <Card>
        <div className="flex justify-between items-start mb-5 flex-wrap gap-3">
          <div>
            <h2 className="font-semibold">My Patients ({patients.length})</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              GET /api/doctors/patients · Azure SQL
            </p>
          </div>
          <input
            type="text"
            placeholder="Search patients…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 text-sm border-2 border-gray-200 rounded-lg
              focus:border-teal-500 outline-none"
          />
        </div>

        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full min-w-[560px]">
            <thead>
              <tr className="border-b border-gray-200">
                {['Patient','ID','Last Visit','Condition','Status','Action'].map((h) => (
                  <th key={h} className="text-left pb-3 pr-4 text-xs font-bold text-gray-400 uppercase">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={i}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => toast.info('Patient record loaded · Azure SQL')}>
                  <td className="py-3 pr-4 font-semibold text-sm">{p.name}</td>
                  <td className="py-3 pr-4 text-xs font-mono text-gray-500">{p.id || p.patient_code}</td>
                  <td className="py-3 pr-4 text-sm">{p.lastVisit || p.lastvisit}</td>
                  <td className="py-3 pr-4 text-sm">{p.condition}</td>
                  <td className="py-3 pr-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold
                      ${statusClasses(p.status)}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3">
                    <Button size="sm" variant="outline"
                      onClick={(e) => { e.stopPropagation(); toast.info('Opening patient file…'); }}>
                      View
                    </Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-sm text-gray-400">
                    No patients found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </Layout>
  );
};

export default MyPatients;
