import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Hero from './components/Hero';
import Auth from './components/Auth';
import ManagerDashboard from './components/ManagerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import TeamPage from './pages/TeamPage';
import UserDashboard from './components/UserDashboard';
import ExperiencePage from './pages/ExperiencePage';
import PortfolioPage from './pages/PortfolioPage';
import CompletedTasksPage from './pages/CompletedTasksPage';
import ReviewPage from './pages/ReviewPage';
import PublicProfilePage from './pages/PublicProfilePage';
import SettingsPage from './pages/SettingsPage';

// Central Protected Route — single source of truth for auth + role guards
// role prop is optional: if omitted, any logged-in user can access
const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-black/20 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xs uppercase tracking-widest text-zinc-400 font-bold">Loading...</p>
        </div>
      </div>
    );
  }

  // No session → auth page
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Role mismatch → correct dashboard (NEVER to /auth)
  if (role && user.role !== role) {
    const dest = user.role === 'superadmin' ? '/admin' : user.role === 'admin' ? '/manager' : '/dashboard';
    return <Navigate to={dest} replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Hero />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/manager" element={<ProtectedRoute role="admin"><ManagerDashboard /></ProtectedRoute>} />
      <Route path="/team" element={<ProtectedRoute><TeamPage /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute role="employee"><UserDashboard /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute role="superadmin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/experience" element={<ProtectedRoute><ExperiencePage /></ProtectedRoute>} />
      <Route path="/portfolio" element={<ProtectedRoute role="employee"><PortfolioPage /></ProtectedRoute>} />
      <Route path="/completed-tasks" element={<ProtectedRoute><CompletedTasksPage /></ProtectedRoute>} />
      <Route path="/review" element={<ProtectedRoute role="admin"><ReviewPage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      <Route path="/profile/:username" element={<PublicProfilePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1d1d1d',
              color: '#fff',
              borderRadius: '1rem',
              fontSize: '13px',
              fontWeight: 600,
              letterSpacing: '0.01em',
              padding: '14px 20px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            },
            success: {
              iconTheme: { primary: '#22c55e', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
