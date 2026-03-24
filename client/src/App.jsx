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

  if (!authenticated) return <LoginPage />;
  return <AppShell />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider API={API}>
        <AppRouter />
      </AppProvider>
    </ErrorBoundary>
  );
}
