import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import BeansManagement from './pages/BeansManagement';
import NFCManagement from './pages/NFCManagement';
import CafeManagement from './pages/CafeManagement';
import Analytics from './pages/Analytics';
import Login from './pages/Login';
import { useState } from 'react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/beans/*" element={<BeansManagement />} />
          <Route path="/nfc/*" element={<NFCManagement />} />
          <Route path="/cafe/*" element={<CafeManagement />} />
          <Route path="/analytics/*" element={<Analytics />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
