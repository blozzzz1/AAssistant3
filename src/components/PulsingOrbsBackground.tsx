import React from 'react';

/** Фиксированный фон с пульсирующими шарами — подключается на страницах, контент должен иметь relative z-10 */
export const PulsingOrbsBackground: React.FC = () => (
  <div
    className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
    aria-hidden
  >
    <div className="absolute inset-0 bg-primary-900/5" />
    <div
      className="absolute top-[10%] left-[5%] w-72 h-72 bg-primary-500/10 rounded-full blur-3xl animate-pulse"
      style={{ animationDuration: '4s' }}
    />
    <div
      className="absolute bottom-[15%] right-[5%] w-96 h-96 bg-accent-pink/10 rounded-full blur-3xl animate-pulse"
      style={{ animationDelay: '1s', animationDuration: '4s' }}
    />
    <div
      className="absolute top-[60%] left-[15%] w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
      style={{ animationDelay: '0.5s', animationDuration: '5s' }}
    />
    <div
      className="absolute top-[20%] right-[20%] w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"
      style={{ animationDelay: '2s', animationDuration: '3.5s' }}
    />
    <div
      className="absolute bottom-[40%] right-[30%] w-80 h-80 bg-amber-500/5 rounded-full blur-3xl animate-pulse"
      style={{ animationDelay: '1.5s', animationDuration: '4.5s' }}
    />
    <div
      className="absolute top-[40%] left-[50%] w-56 h-56 bg-primary-400/5 rounded-full blur-3xl animate-pulse"
      style={{ animationDelay: '2.5s', animationDuration: '5s' }}
    />
    <div
      className="absolute bottom-[25%] left-[35%] w-40 h-40 bg-rose-500/10 rounded-full blur-3xl animate-pulse"
      style={{ animationDelay: '0.8s', animationDuration: '3s' }}
    />
    <div
      className="absolute top-[75%] right-[10%] w-64 h-64 bg-indigo-500/8 rounded-full blur-3xl animate-pulse"
      style={{ animationDelay: '1.2s', animationDuration: '4s' }}
    />
  </div>
);
