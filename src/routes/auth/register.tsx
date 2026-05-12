import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, UserPlus, Layers, Flame, Swords } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DevFooter } from '@/components/ui/DevFooter';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';

const schema = z.object({
  username: z.string().min(3, 'Mínimo 3 caracteres').max(20, 'Máximo 20 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});
type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const register_ = useAuthStore(s => s.register);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await register_(values.username, values.email, values.password);
      navigate('/lobby');
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Erro ao criar conta');
    }
  };

  return (
    <div className="min-h-dvh flex flex-col lg:flex-row bg-[var(--color-base)] overflow-hidden">
      {/* Left panel — visual */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center relative bg-[var(--color-surface)] border-r border-[var(--color-border)] p-12 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[var(--color-accent-strong)]/10 blur-[140px]" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-[var(--color-accent-mid)]/5 blur-[80px]" />
        </div>
        <div className="relative z-10 text-center max-w-md">
          <Logo variant="full" size={72} className="mx-auto mb-8" />
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-3" style={{ fontFamily: 'var(--font-display)' }}>
            Crie sua conta
          </h1>
          <p className="text-[var(--color-text-muted)] leading-relaxed">
            Junte-se à mesa. Cada partida é uma batalha de estratégia e leitura do oponente.
          </p>
          <div className="mt-10 flex flex-col gap-3 text-left">
            {[
              { icon: <Layers size={16} />, text: 'Mão de 8 cartas, 7 valores diferentes' },
              { icon: <Flame size={16} />, text: 'Mecânica Sabor muda tudo na hora certa' },
              { icon: <Swords size={16} />, text: 'Modo duelo 1v1 com regras exclusivas' },
            ].map(item => (
              <div key={item.text} className="flex items-start gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-3">
                <span className="mt-0.5 text-[var(--color-accent-mid)] shrink-0">{item.icon}</span>
                <span className="text-sm text-[var(--color-text-muted)]">{item.text}</span>
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
            <Logo variant="full" size={56} className="mx-auto mb-4" />
          </div>

          <div className="mb-7">
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)]" style={{ fontFamily: 'var(--font-display)' }}>
              Criar conta
            </h2>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              Leva menos de um minuto
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur-md p-4 sm:p-6 shadow-[0_8px_40px_oklch(0%_0_0_/_0.35)]">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <Input
                label="Nome de usuário"
                autoComplete="username"
                placeholder="como quer ser chamado"
                {...register('username')}
                error={errors.username?.message}
              />
              <Input
                label="Email"
                type="email"
                autoComplete="email"
                placeholder="seu@email.com"
                {...register('email')}
                error={errors.email?.message}
              />
              <div className="relative">
                <Input
                  label="Senha"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="mínimo 6 caracteres"
                  className="pr-10"
                  {...register('password')}
                  error={errors.password?.message}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 bottom-[11px] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              <Button type="submit" size="lg" disabled={isSubmitting} className="mt-1 gap-2">
                <UserPlus size={16} />
                {isSubmitting ? 'Criando...' : 'Criar Conta'}
              </Button>
            </form>
          </div>

          <div className="flex flex-col gap-2.5 mt-5 text-center">
            <p className="text-sm text-[var(--color-text-muted)]">
              Já tem conta?{' '}
              <Link to="/auth/login" className="text-[var(--color-accent-mid)] hover:text-[var(--color-accent-soft)] font-medium transition-colors">
                Entrar
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
