import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore(s => s.login);
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
    <div className="min-h-dvh flex items-center justify-center bg-[var(--color-base)] p-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[var(--color-accent-strong)]/8 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Logo variant="full" size={40} className="mx-auto mb-5" />
          <div className="flex items-center gap-3 mb-1">
            <div className="flex-1 h-px bg-[var(--color-border)]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-strong)]" />
            <div className="flex-1 h-px bg-[var(--color-border)]" />
          </div>
          <p
            className="text-[var(--color-text-muted)] mt-3 text-base"
            style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}
          >
            Entrar na conta
          </p>
        </div>

        {/* Form card */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur-md p-6 shadow-[0_8px_40px_oklch(0%_0_0_/_0.4)]">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
            <Input label="Senha" type="password" {...register('password')} error={errors.password?.message} />
            <Button type="submit" size="lg" disabled={isSubmitting} className="mt-1">
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </div>

        {/* Footer links */}
        <div className="flex flex-col gap-2 mt-5 text-center">
          <Link to="/auth/register" className="text-sm text-[var(--color-accent-mid)] hover:text-[var(--color-accent-soft)] transition-colors">
            Não tem conta? Criar agora
          </Link>
          <Link to="/" className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">
            Jogar como convidado
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
