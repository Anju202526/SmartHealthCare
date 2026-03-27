import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import adminService from '../../services/adminService';

const ROLE_PILL = {
  patient: 'bg-blue-50 text-blue-600',
  doctor:  'bg-teal-50 text-teal-600',
  admin:   'bg-gray-100 text-gray-600',
};

const DEMO = [
  { user_id: 1, name: 'Sarah Murphy',    role: 'patient', email: 'sarah.murphy@gmail.com',  status: 'Active' },
  { user_id: 2, name: "Dr. M. O'Brien",  role: 'doctor',  email: 'm.obrien@beaumont.ie',     status: 'Active' },
  { user_id: 3, name: 'Dr. A. Walsh',    role: 'doctor',  email: 'a.walsh@mater.ie',         status: 'Active' },
  { user_id: 4, name: 'Admin User',      role: 'admin',   email: 'admin@smartcare.ie',       status: 'Active' },
];

const UsersManagement = () => {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await adminService.getAllUsers();
        setUsers(data?.length ? data : DEMO);
      } catch {
        setUsers(DEMO);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = users.filter((u) =>
    (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <Layout title="User Management">
      <Card>
        <div className="flex justify-between items-start mb-5 flex-wrap gap-3">
          <div>
            <h2 className="font-semibold">User Management ({users.length})</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              GET /api/admin/users · Azure SQL + Azure AD B2C
            </p>
          </div>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Search users…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-2 text-sm border-2 border-gray-200 rounded-lg
                focus:border-teal-500 outline-none"
            />
            <Button size="sm" onClick={() => toast.info('Add user form — coming soon')}>
              + Add User
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full min-w-[520px]">
            <thead>
              <tr className="border-b border-gray-200">
                {['Name','Role','Email','Status','Actions'].map((h) => (
                  <th key={h}
                    className="text-left pb-3 pr-4 text-xs font-bold text-gray-400 uppercase">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.user_id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 pr-4 font-semibold text-sm">{u.name}</td>
                  <td className="py-3 pr-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold
                      ${ROLE_PILL[u.role] || ROLE_PILL.admin}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-sm text-gray-500">{u.email}</td>
                  <td className="py-3 pr-4">
                    <span className="px-2 py-0.5 bg-green-50 text-green-600
                      text-xs font-semibold rounded-full">
                      {u.status || 'Active'}
                    </span>
                  </td>
                  <td className="py-3">
                    <Button size="sm" variant="outline"
                      onClick={() => toast.info(`Editing ${u.name}`)}>
                      Edit
                    </Button>
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

export default UsersManagement;
