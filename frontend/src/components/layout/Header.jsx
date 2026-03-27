import React, { useState } from 'react';
import { FaBell, FaBars } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/helpers';

const Header = ({ title, onMenuClick }) => {
  const { user } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);

  const handleNotif = () => {
    setNotifOpen(!notifOpen);
    toast.info('3 new notifications');
  };

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center
      justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Toggle sidebar"
        >
          <FaBars className="text-gray-600" />
        </button>
        <h1 className="font-serif text-lg font-semibold text-ink">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <button
          onClick={handleNotif}
          className="relative w-9 h-9 rounded-lg border border-gray-200 bg-white
            flex items-center justify-center hover:bg-gray-50 transition-colors"
          aria-label="Notifications"
        >
          <FaBell className="text-gray-600 text-sm" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
        </button>

        {/* User avatar */}
        <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center
          text-white text-xs font-bold select-none">
          {getInitials(user?.name || 'U')}
        </div>
      </div>
    </header>
  );
};

export default Header;
