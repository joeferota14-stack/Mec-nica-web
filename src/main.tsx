import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import App from './App.tsx';
import DashboardLayout from './dashboard/DashboardLayout.tsx';
import { AppProvider } from './context/AppContext.tsx';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import LoginPage from './pages/LoginPage.tsx';
import './index.css';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<Navigate to="/dashboard/overview" replace />} />
            <Route 
              path="/dashboard/*" 
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  </StrictMode>
);
