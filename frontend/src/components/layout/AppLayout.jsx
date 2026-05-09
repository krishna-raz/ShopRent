import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';

const AppLayout = () => {
  return (
    <div className="flex bg-slate-50 min-h-screen">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 p-4 lg:p-8 lg:pb-8 overflow-y-auto">
          <div className="pb-24 lg:pb-0">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <BottomNav />
    </div>
  );
};

export default AppLayout;
