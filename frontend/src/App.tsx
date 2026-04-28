import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import EnvironmentBanner from './components/EnvironmentBanner';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Shipments from './pages/Shipments';
import Disruptions from './pages/Disruptions';
import Optimizer from './pages/Optimizer';
import Assistant from './pages/Assistant';
import Analytics from './pages/Analytics';
import Demo from './pages/Demo';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import Account from './pages/Account';

const App: React.FC = () => {
  return (
    <Router>
      <EnvironmentBanner />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/demo-controls" element={<Demo />} />

        {/* Protected Dashboard Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/shipments" element={<Shipments />} />
            <Route path="/disruptions" element={<Disruptions />} />
            <Route path="/optimizer" element={<Optimizer />} />
            <Route path="/assistant" element={<Assistant />} />
            <Route path="/account" element={<Account />} />
            
            {/* Redirect root to dashboard (which triggers login if not authenticated) */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
