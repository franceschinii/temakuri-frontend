import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DevFooter } from '@/components/ui/DevFooter';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Informe sua senha'),
});
type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore(s => s.login);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await login(values.email, values.password);
      navigate('/lobby');
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Credenciais inválidas');
    }
  };

  return (
    <div className="min-h-dvh flex flex-col lg:flex-row bg-[var(--color-base)] overflow-hidden">
      {/* Left panel — visual */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center relative bg-[var(--color-surface)] border-r border-[var(--color-border)] p-12 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[var(--color-accent-strong)]/10 blur-[140px]" />
          <div className="absolute bottom-0 right-0 w-[300px] h-[300px] rounded-full bg-[var(--color-accent-mid)]/5 blur-[80px]" />
        </div>
        <div className="relative z-10 text-center max-w-md">
          <Logo variant="full" size={112} className="mx-auto mb-8" />
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-3" style={{ fontFamily: 'var(--font-display)' }}>
            Bem-vindo de volta
          </h1>
          <p className="text-[var(--color-text-muted)] leading-relaxed">
            Continue sua jornada no jogo de cartas mais intenso. Suas rivalidades te esperam.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4 text-center">
            {[
              { label: 'Cartas', value: '63' },
              { label: 'Modos', value: '4' },
              { label: 'Jogadores', value: '2–6' },
            ].map(item => (
              <div key={item.label} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-3">
                <div className="text-lg font-bold text-[var(--color-accent-mid)]">{item.value}</div>
                <div className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider mt-0.5">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 flex-col relative">
        <div className="flex flex-1 flex-col items-center justify-center p-6 sm:p-10 relative">
        <div className="fixed inset-0 pointer-events-none lg:hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-[var(--color-accent-strong)]/8 blur-[100px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Logo variant="full" size={88} className="mx-auto mb-4" />
          </div>

          <div className="mb-7">
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)]" style={{ fontFamily: 'var(--font-display)' }}>
              Entrar
            </h2>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              Acesse sua conta para jogar
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur-md p-4 sm:p-6 shadow-[0_8px_40px_oklch(0%_0_0_/_0.35)]">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <Input
                label="Email"
                type="email"
                autoComplete="email"
                placeholder="seu@email.com"
                {...register('email')}
                error={errors.email?.message}
                data-testid="login-email-input"
              />

              <div className="relative">
                <Input
                  label="Senha"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="pr-10"
                  {...register('password')}
                  error={errors.password?.message}
                  data-testid="login-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 bottom-[11px] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              <div className="flex justify-end -mt-1">
                <Link
                  to="/auth/forgot-password"
                  className="text-xs text-[var(--color-accent-mid)] hover:text-[var(--color-accent-soft)] transition-colors"
                >
                  Esqueci minha senha
                </Link>
              </div>

              <Button type="submit" size="lg" disabled={isSubmitting} className="mt-1 gap-2" data-testid="login-submit">
                <LogIn size={16} />
                {isSubmitting ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </div>

          <div className="flex flex-col gap-2.5 mt-5 text-center">
            <p className="text-sm text-[var(--color-text-muted)]">
              Não tem conta?{' '}
              <Link to="/auth/register" className="text-[var(--color-accent-mid)] hover:text-[var(--color-accent-soft)] font-medium transition-colors">
                Criar agora
              </Link>
            </p>
            <Link to="/" className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">
              Jogar como convidado
            </Link>
          </div>
        </motion.div>
        </div>
        <DevFooter />
      </div>
    </div>
  );
}
