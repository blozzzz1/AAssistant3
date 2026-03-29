import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileTabBar } from './MobileTabBar';
import { MAIN_MOBILE_NAV_PB_CLASS } from '../constants/mobileNavLayout';

export const AppLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-[#0d0d0f]">
      <Sidebar />
      <main
        className={`flex flex-1 min-h-screen min-w-0 flex-col overflow-auto lg:min-h-screen ${MAIN_MOBILE_NAV_PB_CLASS} lg:pb-0`}
      >
        <Outlet />
      </main>
      <MobileTabBar />
    </div>
  );
};
