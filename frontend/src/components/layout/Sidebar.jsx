import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/helpers';
import {
  FaHome, FaCalendarAlt, FaUserMd, FaUsers, FaFileAlt,
  FaUserCircle, FaSignOutAlt, FaPlusCircle, FaClock,
  FaChartLine, FaCloud,
} from 'react-icons/fa';

// Cross icon used as logo mark
const CrossIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="white" strokeWidth="2.2" strokeLinecap="round">
    <path d="M19 9h-4V5a2 2 0 00-4 0v4H7a2 2 0 000 4h4v4a2 2 0 004 0v-4h4a2 2 0 000-4z" />
  </svg>
);

const navByRole = {
  patient: [
    { path: '/patient/dashboard',     icon: <FaHome />,        label: 'Dashboard' },
    { path: '/patient/book',          icon: <FaPlusCircle />,  label: 'Book Appointment' },
    { path: '/patient/appointments',  icon: <FaCalendarAlt />, label: 'My Appointments' },
    { path: '/patient/reports',       icon: <FaFileAlt />,     label: 'Medical Reports' },
    { path: '/patient/profile',       icon: <FaUserCircle />,  label: 'Profile' },
  ],
  doctor: [
    { path: '/doctor/dashboard',      icon: <FaHome />,        label: 'Overview' },
    { path: '/doctor/schedule',       icon: <FaCalendarAlt />, label: 'My Schedule' },
    { path: '/doctor/patients',       icon: <FaUsers />,       label: 'My Patients' },
    { path: '/doctor/availability',   icon: <FaClock />,       label: 'Availability' },
  ],
  admin: [
    { path: '/admin/dashboard',       icon: <FaChartLine />,   label: 'Overview' },
    { path: '/admin/users',           icon: <FaUsers />,       label: 'Users' },
    { path: '/admin/appointments',    icon: <FaCalendarAlt />, label: 'Appointments' },
    { path: '/admin/azure',           icon: <FaCloud />,       label: 'Azure Services' },
  ],
};

const avatarColour = {
  patient: 'bg-teal-500',
  doctor:  'bg-gradient-to-br from-teal-500 to-teal-700',
  admin:   'bg-gradient-to-br from-gray-700 to-teal-700',
};

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = navByRole[user?.role] || [];

  return (
    <div className="w-56 bg-ink min-h-screen flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-6">
        <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <CrossIcon />
        </div>
        <span className="font-serif text-white text-lg font-semibold">SmartCare</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider px-2 mb-2">
          Menu
        </p>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm font-medium
               transition-all duration-150 ${
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
              }`
            }
          >
            <span className="text-sm flex-shrink-0">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User block */}
      <div className="p-3 border-t border-gray-800">
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center
            text-white text-xs font-bold flex-shrink-0 ${avatarColour[user?.role] || 'bg-teal-500'}`}>
            {getInitials(user?.name || 'U')}
          </div>
          <div className="overflow-hidden">
            <p className="text-white text-sm font-semibold truncate">{user?.name || 'User'}</p>
            <p className="text-gray-500 text-xs capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400
            hover:bg-white/5 hover:text-white transition-all text-sm"
        >
          <FaSignOutAlt />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
