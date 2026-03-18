import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PlanProvider } from './contexts/PlanContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AppLayout } from './components/AppLayout';
import { HomePage } from './pages/HomePage';
import { ChatPage } from './pages/ChatPage';
import { AccountPage } from './pages/AccountPage';
import { ModelsPage } from './pages/ModelsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ToolsPage } from './pages/ToolsPage';
import { AdminPage } from './pages/AdminPage';
import { PricingPage } from './pages/PricingPage';
import { PaymentPage } from './pages/PaymentPage';

const CreativeLabPage = lazy(() => import('./pages/CreativeLabPage').then((m) => ({ default: m.CreativeLabPage })));
const LibraryPage = lazy(() => import('./pages/LibraryPage').then((m) => ({ default: m.LibraryPage })));
import { Login } from './components/Login';
import { Register } from './components/Register';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';

function AppRoutes() {
  const { user } = useAuth();
  return (
    <PlanProvider userId={user?.id ?? null}>
      <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/models" element={<ModelsPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route
              path="/payment"
              element={
                <ProtectedRoute>
                  <PaymentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/creative-lab"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<div className="min-h-screen bg-background-darker flex items-center justify-center"><div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>}>
                    <CreativeLabPage />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/library"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<div className="min-h-screen bg-background-darker flex items-center justify-center"><div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>}>
                    <LibraryPage />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/account"
              element={
                <ProtectedRoute>
                  <AccountPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tools"
              element={
                <ProtectedRoute>
                  <ToolsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminPage />
                </AdminRoute>
              }
            />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
    </PlanProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
