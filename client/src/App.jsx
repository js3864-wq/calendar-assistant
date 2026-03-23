import { useState, useEffect } from 'react';
import LoginPage from './components/Auth/LoginPage';
import AppShell from './components/Layout/AppShell';
import axios from 'axios';

const API = 'http://localhost:3001';
axios.defaults.withCredentials = true;

export default function App() {
  const [authenticated, setAuthenticated] = useState(null);

  useEffect(() => {
    axios.get(`${API}/auth/status`)
      .then(r => setAuthenticated(r.data.authenticated))
      .catch(() => setAuthenticated(false));
  }, []);

  if (authenticated === null) return (
    <div className="h-screen bg-black flex items-center justify-center text-white">
      Loading...
    </div>
  );
  if (!authenticated) return <LoginPage API={API} />;
  return <AppShell API={API} />;
}
