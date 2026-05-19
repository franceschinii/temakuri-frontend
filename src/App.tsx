import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

const LandingPage         = lazy(() => import('@/routes/index'));
const LoginPage           = lazy(() => import('@/routes/auth/login'));
const RegisterPage        = lazy(() => import('@/routes/auth/register'));
const ForgotPasswordPage  = lazy(() => import('@/routes/auth/forgot-password'));
const ResetPasswordPage   = lazy(() => import('@/routes/auth/reset-password'));
const LegalPage           = lazy(() => import('@/routes/legal/index'));
const LobbyPage           = lazy(() => import('@/routes/lobby/index'));
const RoomPage            = lazy(() => import('@/routes/lobby/room'));
const GamePage            = lazy(() => import('@/routes/game/index'));
const ProfilePage         = lazy(() => import('@/routes/profile/index'));
const AdminPage           = lazy(() => import('@/routes/admin/index'));
const RankedPage          = lazy(() => import('@/routes/ranked/index'));
const PaymentsSuccess     = lazy(() => import('@/routes/payments/success'));
const PaymentsCancel      = lazy(() => import('@/routes/payments/cancel'));
const PaymentsPending     = lazy(() => import('@/routes/payments/pending'));
const TutorialPage        = lazy(() => import('@/routes/tutorial/index'));
const SupportPage         = lazy(() => import('@/routes/support/index'));
const AnimsDevPage        = lazy(() => import('@/routes/dev/anims'));

function PageLoader() {
  return (
    <div className="h-dvh flex flex-col items-center justify-center gap-5 bg-[var(--color-base)]">
      <div className="relative flex items-center justify-center">
        <div className="absolute w-16 h-16 rounded-full border border-[var(--color-accent-strong)]/20 animate-ping" style={{ animationDuration: '2s' }} />
        <svg viewBox="0 0 116 172" width={38} height={55} fill="none" aria-hidden="true" className="animate-pulse" style={{ animationDuration: '1.8s' }}>
          <g transform="rotate(-8 58 86)" opacity=".3">
            <rect x="4" y="4" width="108" height="164" rx="10" fill="#1a0808" />
            <rect x="4" y="4" width="108" height="164" rx="10" fill="none" stroke="#c09018" strokeWidth="1.5" />
          </g>
          <g transform="rotate(5 58 86)">
            <rect x="4" y="4" width="108" height="164" rx="10" fill="url(#pl-card)" />
            <rect x="4" y="4" width="108" height="164" rx="10" fill="none" stroke="url(#pl-gold)" strokeWidth="2" />
            <rect x="10" y="10" width="96" height="152" rx="7" fill="none" stroke="#c8980e" strokeWidth=".8" opacity=".5" />
            <polygon points="18,16 22,22 18,28 14,22" fill="#b01212" />
            <polygon points="98,16 102,22 98,28 94,22" fill="#b01212" />
            <polygon points="18,144 22,150 18,156 14,150" fill="#b01212" />
            <polygon points="98,144 102,150 98,156 94,150" fill="#b01212" />
            <g transform="translate(58 86)">
              <circle r="36" fill="none" stroke="#b01212" strokeWidth="1.4" />
              <rect x="-5" y="-29" width="10" height="16" rx="2" fill="#b01212" />
              <g transform="rotate(90)"><rect x="-5" y="-29" width="10" height="16" rx="2" fill="#b01212" /></g>
              <g transform="rotate(180)"><rect x="-5" y="-29" width="10" height="16" rx="2" fill="#b01212" /></g>
              <g transform="rotate(270)"><rect x="-5" y="-29" width="10" height="16" rx="2" fill="#b01212" /></g>
              <polygon points="0,-10 10,0 0,10 -10,0" fill="#b01212" />
              <polygon points="0,-6 6,0 0,6 -6,0" fill="#fef9ee" />
            </g>
          </g>
          <defs>
            <linearGradient id="pl-card" x1="0" y1="0" x2=".15" y2="1">
              <stop offset="0%" stopColor="#fef9ee" />
              <stop offset="100%" stopColor="#e9d6a3" />
            </linearGradient>
            <linearGradient id="pl-gold" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f0cb58" />
              <stop offset="100%" stopColor="#a4760c" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <span
        className="text-[11px] tracking-[0.3em] text-[var(--color-text-muted)] opacity-50"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        寿司 · 拉麺 · 餃子
      </span>
    </div>
  );
}

// Aplica o tema ativo do usuario no <body> enquanto a area autenticada
// (incluindo /admin) esta montada. Usado por AuthGuard e AdminGuard pra
// que toda tela logada siga o tema escolhido (oceano, oni, etc).
function useActiveTheme(activeTheme: string | null | undefined) {
  useEffect(() => {
    if (activeTheme) {
      document.body.setAttribute('data-theme', activeTheme);
    } else {
      document.body.removeAttribute('data-theme');
    }
    return () => {
      document.body.removeAttribute('data-theme');
    };
  }, [activeTheme]);
}

function AuthGuard() {
  const user = useAuthStore(s => s.user);
  useActiveTheme(user?.activeTheme);
  if (!user) return <Navigate to="/" replace />;
  return <Outlet />;
}

function AdminGuard() {
  const user = useAuthStore(s => s.user);
  useActiveTheme(user?.activeTheme);
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
        <Route path="/legal" element={<LegalPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/dev/anims" element={<AnimsDevPage />} />

        <Route element={<AuthGuard />}>
          <Route path="/lobby" element={<LobbyPage />} />
          <Route path="/lobby/:roomCode" element={<RoomPage />} />
          <Route path="/game/:roomCode" element={<GamePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/ranked" element={<RankedPage />} />
          <Route path="/payments/success" element={<PaymentsSuccess />} />
          <Route path="/payments/cancel" element={<PaymentsCancel />} />
          <Route path="/payments/pending" element={<PaymentsPending />} />
          <Route path="/tutorial" element={<TutorialPage />} />
        </Route>

        <Route element={<AdminGuard />}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
