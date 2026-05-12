import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

const LandingPage         = lazy(() => import('@/routes/index'));
const LoginPage           = lazy(() => import('@/routes/auth/login'));
const RegisterPage        = lazy(() => import('@/routes/auth/register'));
const ForgotPasswordPage  = lazy(() => import('@/routes/auth/forgot-password'));
const ResetPasswordPage   = lazy(() => import('@/routes/auth/reset-password'));
const LobbyPage           = lazy(() => import('@/routes/lobby/index'));
const RoomPage            = lazy(() => import('@/routes/lobby/room'));
const GamePage            = lazy(() => import('@/routes/game/index'));
const ProfilePage         = lazy(() => import('@/routes/profile/index'));
const AdminPage           = lazy(() => import('@/routes/admin/index'));

function PageLoader() {
  return (
    <div className="h-dvh flex items-center justify-center bg-[var(--color-base)]">
      <div className="w-7 h-7 rounded-full border-2 border-[var(--color-accent-strong)] border-t-transparent animate-spin" />
    </div>
  );
}

function AuthGuard() {
  const user = useAuthStore(s => s.user);
  if (!user) return <Navigate to="/" replace />;
  return <Outlet />;
}

function AdminGuard() {
  const user = useAuthStore(s => s.user);
  if (!user) return <Navigate to="/" replace />;
  if (!user.isAdmin) return <Navigate to="/lobby" replace />;
  return <Outlet />;
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/auth/reset-password" element={<ResetPasswordPage />} />

        <Route element={<AuthGuard />}>
          <Route path="/lobby" element={<LobbyPage />} />
          <Route path="/lobby/:roomCode" element={<RoomPage />} />
          <Route path="/game/:roomCode" element={<GamePage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route element={<AdminGuard />}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
