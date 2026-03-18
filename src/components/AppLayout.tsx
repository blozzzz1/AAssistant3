import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export const AppLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-[#0d0d0f]">
      <Sidebar />
      <main className="flex-1 min-h-screen overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};
