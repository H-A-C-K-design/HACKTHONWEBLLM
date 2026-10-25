import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Loader from './components/Loader';

// Public Pages
import Home from './pages/Home/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';

// Code-Split Dashboard Shell & Sub-Pages
const DashboardLayout = lazy(() => import('./pages/Dashboard/DashboardLayout'));
const Overview = lazy(() => import('./pages/Dashboard/Overview'));
const EventRegistration = lazy(() => import('./pages/Dashboard/EventRegistration'));
const Announcements = lazy(() => import('./pages/Dashboard/Announcements'));
const Submissions = lazy(() => import('./pages/Dashboard/Submissions'));
const About = lazy(() => import('./pages/Dashboard/About'));
const HelpSession = lazy(() => import('./pages/Dashboard/HelpSession'));

// Code-Split Admin Pages
const AdminOverview = lazy(() => import('./pages/Dashboard/admin/AdminOverview'));
const AdminTeams = lazy(() => import('./pages/Dashboard/admin/AdminTeams'));
const AdminAnnouncements = lazy(() => import('./pages/Dashboard/admin/AdminAnnouncements'));
const AdminRounds = lazy(() => import('./pages/Dashboard/admin/AdminRounds'));
const AdminSubmissions = lazy(() => import('./pages/Dashboard/admin/AdminSubmissions'));
const AdminHelp = lazy(() => import('./pages/Dashboard/admin/AdminHelp'));
const AdminSettings = lazy(() => import('./pages/Dashboard/admin/AdminSettings'));

function FallbackLoader() {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
      }}
    >
      <Loader text="Accessing Neural Grid..." />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<FallbackLoader />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Participant Dashboard (Auth required) */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Overview />} />
              <Route path="registration" element={<EventRegistration />} />
              <Route path="announcements" element={<Announcements />} />
              <Route path="submissions" element={<Submissions />} />
              <Route path="about" element={<About />} />
              <Route path="help" element={<HelpSession />} />

              {/* Admin Controls (Auth + role === 'admin' required) */}
              <Route
                path="admin"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminOverview />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/teams"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminTeams />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/announcements"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminAnnouncements />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/rounds"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminRounds />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/submissions"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminSubmissions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/help"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminHelp />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/settings"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminSettings />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>

        {/* Global Toast Notifications (Gold/Dark Cyber Theme) */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#16161a',
              color: '#ffffff',
              border: '1px solid rgba(212, 175, 55, 0.35)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.6), 0 0 15px rgba(212,175,55,0.15)',
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.9rem',
              borderRadius: '10px',
              padding: '12px 18px',
            },
            success: {
              iconTheme: {
                primary: '#D4AF37',
                secondary: '#0B0B0D',
              },
            },
            error: {
              iconTheme: {
                primary: '#ff4757',
                secondary: '#0B0B0D',
              },
            },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
