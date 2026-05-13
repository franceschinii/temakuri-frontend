import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DevFooter } from '@/components/ui/DevFooter';
import api from '@/lib/api';
import { toast } from 'sonner';

const schema = z.object({
  email: z.string().email('Email inválido'),
});
type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await api.post('/auth/forgot-password', { email: values.email });
      setSent(true);
    } catch {
      // Não revelar se email existe ou não — mostra sucesso sempre
      setSent(true);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col bg-[var(--color-base)] overflow-hidden">
      <div className="flex-1 flex items-center justify-center p-6 relative">
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
          <Logo variant="full" size={96} className="mx-auto mb-6" />
        </div>

        <AnimatePresence mode="wait">
          {sent ? (
            <motion.div
              key="sent"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur-md p-8 shadow-[0_8px_40px_oklch(0%_0_0_/_0.35)] text-center flex flex-col items-center gap-4"
            >
              <div className="w-14 h-14 rounded-full bg-[var(--color-accent-strong)]/15 flex items-center justify-center">
                <CheckCircle size={28} className="text-[var(--color-accent-mid)]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                  Email enviado!
                </h2>
                <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                  Se esse email tiver uma conta associada, você receberá um link para redefinir sua senha em breve.
                  O link expira em <strong>15 minutos</strong>.
                </p>
              </div>
              <Link to="/auth/login">
                <Button variant="outline" className="gap-2 mt-2">
                  <ArrowLeft size={14} />
                  Voltar para o login
                </Button>
              </Link>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="mb-7">
                <h2 className="text-2xl font-bold text-[var(--color-text-primary)]" style={{ fontFamily: 'var(--font-display)' }}>
                  Esqueceu a senha?
                </h2>
                <p className="text-sm text-[var(--color-text-muted)] mt-1">
                  Informe seu email e enviaremos um link de recuperação.
                </p>
              </div>

              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur-md p-6 shadow-[0_8px_40px_oklch(0%_0_0_/_0.35)]">
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                  <Input
                    label="Email"
                    type="email"
                    autoComplete="email"
                    placeholder="seu@email.com"
                    {...register('email')}
                    error={errors.email?.message}
                  />
                  <Button type="submit" size="lg" disabled={isSubmitting} className="gap-2">
                    <Mail size={15} />
                    {isSubmitting ? 'Enviando...' : 'Enviar link de recuperação'}
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
      <DevFooter />
    </div>
  );
}
