import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children, title }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile]       = useState(window.innerWidth < 1024);

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full z-30 transition-transform duration-300
          ${sidebarOpen || !isMobile ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0`}
      >
        <Sidebar />
      </div>

      {/* Mobile backdrop */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div className="lg:ml-56 flex-1 flex flex-col min-h-screen">
        <Header title={title} onMenuClick={() => setSidebarOpen((o) => !o)} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
