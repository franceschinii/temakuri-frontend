import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import LandingPage from '@/routes/index';
import LoginPage from '@/routes/auth/login';
import RegisterPage from '@/routes/auth/register';
import ForgotPasswordPage from '@/routes/auth/forgot-password';
import ResetPasswordPage from '@/routes/auth/reset-password';
import LobbyPage from '@/routes/lobby/index';
import RoomPage from '@/routes/lobby/room';
import GamePage from '@/routes/game/index';
import ProfilePage from '@/routes/profile/index';
import AdminPage from '@/routes/admin/index';

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
  );
}
