import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { NotificationToast } from '@/components/ui/NotificationToast';
import { Dashboard } from '@/pages/Dashboard';
import { Login } from '@/pages/Login';
import { BookingPage } from '@/pages/BookingPage';
import { MyBookings } from '@/pages/MyBookings';
import { BookingDetail } from '@/pages/BookingDetail';
import { AccessCode } from '@/pages/AccessCode';
import { CleanConfirm } from '@/pages/CleanConfirm';
import { Violations } from '@/pages/Violations';
import { ReviewPage } from '@/pages/admin/ReviewPage';
import { AdminBookings } from '@/pages/admin/AdminBookings';
import { AdminViolations } from '@/pages/admin/AdminViolations';
import { useAuthStore } from '@/store/authStore';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);
  return null;
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const currentUser = useAuthStore((s) => s.currentUser);
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (currentUser.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const ResidentRoute = ({ children }: { children: React.ReactNode }) => {
  const currentUser = useAuthStore((s) => s.currentUser);
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (currentUser.role !== 'resident') {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-cream-100">
      <Header />
      <main className="pb-20">{children}</main>
      <NotificationToast />
    </div>
  );
};

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Layout>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/booking"
            element={
              <ResidentRoute>
                <BookingPage />
              </ResidentRoute>
            }
          />

          <Route
            path="/my-bookings"
            element={
              <ResidentRoute>
                <MyBookings />
              </ResidentRoute>
            }
          />

          <Route
            path="/my-bookings/:id"
            element={
              <ProtectedRoute>
                <BookingDetail />
              </ProtectedRoute>
            }
          />

          <Route
            path="/access-code/:id"
            element={
              <ResidentRoute>
                <AccessCode />
              </ResidentRoute>
            }
          />

          <Route
            path="/clean-confirm/:id"
            element={
              <ResidentRoute>
                <CleanConfirm />
              </ResidentRoute>
            }
          />

          <Route
            path="/violations"
            element={
              <ResidentRoute>
                <Violations />
              </ResidentRoute>
            }
          />

          <Route
            path="/admin/review"
            element={
              <AdminRoute>
                <ReviewPage />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/bookings"
            element={
              <AdminRoute>
                <AdminBookings />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/violations"
            element={
              <AdminRoute>
                <AdminViolations />
              </AdminRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};
