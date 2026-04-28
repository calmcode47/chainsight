import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Shipments from './pages/Shipments';
import Disruptions from './pages/Disruptions';
import Optimizer from './pages/Optimizer';
import Assistant from './pages/Assistant';

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/shipments" element={<Shipments />} />
          <Route path="/disruptions" element={<Disruptions />} />
          <Route path="/optimizer" element={<Optimizer />} />
          <Route path="/assistant" element={<Assistant />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
