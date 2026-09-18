import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import AppTheme from './theme/AppTheme';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import IndividualRegistrations from './pages/IndividualRegistrations';
import TeamRegistrations from './pages/TeamRegistrations';
import Withdrawals from './pages/Withdrawals';
import Profile from './pages/Profile';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { authenticated, loading } = useAuth();
  if (!authenticated) return <Navigate to="/login" replace />;
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <AppTheme>
      <AuthProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Dashboard />} />
              <Route path="/registrations/individual" element={<IndividualRegistrations />} />
              <Route path="/registrations/team" element={<TeamRegistrations />} />
              <Route path="/withdrawals" element={<Withdrawals />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </AppTheme>
  );
}
