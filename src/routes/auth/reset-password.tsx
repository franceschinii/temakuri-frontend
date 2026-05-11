import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Lock, ArrowLeft, CheckCircle } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';
import { toast } from 'sonner';

const schema = z.object({
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  confirm: z.string(),
}).refine(d => d.password === d.confirm, {
  message: 'As senhas não coincidem',
  path: ['confirm'],
});
type FormValues = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [showPassword, setShowPassword] = useState(false);
  const [done, setDone] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  if (!token) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[var(--color-base)] p-6">
        <div className="text-center">
          <p className="text-[var(--color-danger)] mb-4">Link inválido ou expirado.</p>
          <Link to="/auth/forgot-password" className="text-sm text-[var(--color-accent-mid)] underline">
            Solicitar novo link
          </Link>
        </div>
      </div>
    );
  }

  const onSubmit = async (values: FormValues) => {
    try {
      await api.post('/auth/reset-password', { token, password: values.password });
      setDone(true);
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Token inválido ou expirado');
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center bg-[var(--color-base)] p-6 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[var(--color-accent-strong)]/8 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <Logo variant="full" size={64} className="mx-auto mb-6" />
        </div>

        <AnimatePresence mode="wait">
          {done ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur-md p-8 shadow-[0_8px_40px_oklch(0%_0_0_/_0.35)] text-center flex flex-col items-center gap-4"
            >
              <div className="w-14 h-14 rounded-full bg-[var(--color-accent-strong)]/15 flex items-center justify-center">
                <CheckCircle size={28} className="text-[var(--color-accent-mid)]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                  Senha redefinida!
                </h2>
                <p className="text-sm text-[var(--color-text-muted)]">
                  Sua senha foi atualizada com sucesso. Você já pode fazer login.
                </p>
              </div>
              <Button onClick={() => navigate('/auth/login')} className="gap-2 mt-2">
                Ir para o login
              </Button>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="mb-7">
                <h2 className="text-2xl font-bold text-[var(--color-text-primary)]" style={{ fontFamily: 'var(--font-display)' }}>
                  Nova senha
                </h2>
                <p className="text-sm text-[var(--color-text-muted)] mt-1">
                  Escolha uma senha segura para sua conta.
                </p>
              </div>

              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur-md p-6 shadow-[0_8px_40px_oklch(0%_0_0_/_0.35)]">
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                  <div className="relative">
                    <Input
                      label="Nova senha"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="mínimo 6 caracteres"
                      {...register('password')}
                      error={errors.password?.message}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3 top-[34px] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>

                  <Input
                    label="Confirmar senha"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="repita a nova senha"
                    {...register('confirm')}
                    error={errors.confirm?.message}
                  />

                  <Button type="submit" size="lg" disabled={isSubmitting} className="gap-2 mt-1">
                    <Lock size={15} />
                    {isSubmitting ? 'Salvando...' : 'Redefinir senha'}
                  </Button>
                </form>
              </div>

              <div className="mt-5 text-center">
                <Link
                  to="/auth/login"
                  className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
                >
                  <ArrowLeft size={13} />
                  Voltar para o login
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
