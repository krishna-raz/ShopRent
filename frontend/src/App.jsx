import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import { useAuth } from './context/AuthContext';

import Shops from './pages/Shops';
import Tenants from './pages/Tenants';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TenantDashboard from './pages/TenantDashboard';
import RentPayments from './pages/RentPayments';
import SecurityDeposits from './pages/SecurityDeposits';
import ActivityLogs from './pages/ActivityLogs';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Route wrapper for dashboard to show different views based on role
const DashboardRouter = () => {
  const { user } = useAuth();
  
  if (user?.role === 'Tenant') {
    return <TenantDashboard />;
  }
  
  return <Dashboard />;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardRouter />} />
        <Route path="/tenants" element={<Tenants />} />
        <Route path="/shops" element={<Shops />} />
        <Route path="/rent-payments" element={<RentPayments />} />
        <Route path="/due-payments" element={<RentPayments />} />
        <Route path="/deposits" element={<SecurityDeposits />} />
        <Route path="/activity-logs" element={<ActivityLogs />} />
      </Route>
    </Routes>
  );
}

export default App;

