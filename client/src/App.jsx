import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { AppProvider, useApp } from './context/AppContext';
import ErrorBoundary from './components/ErrorBoundary';
import LoginPage from './components/Auth/LoginPage';
import AppShell from './components/Layout/AppShell';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';
axios.defaults.withCredentials = true;

function AppRouter() {
  const { authenticated } = useApp();

  if (authenticated === null) {
    return (
      <div className="h-screen bg-black flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={authenticated ? <Navigate to="/calendar" replace /> : <LoginPage />}
      />
      <Route
        path="/calendar"
        element={authenticated ? <AppShell /> : <Navigate to="/" replace />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider API={API}>
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </AppProvider>
    </ErrorBoundary>
  );
}
