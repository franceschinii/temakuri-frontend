import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
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
    <div className="min-h-dvh flex items-center justify-center bg-[var(--color-base)] p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--color-accent-soft)]">🍱 Temakuri</h1>
          <p className="text-[var(--color-text-muted)] mt-1">Entrar na conta</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
          <Input label="Senha" type="password" {...register('password')} error={errors.password?.message} />
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        <div className="flex flex-col gap-2 mt-4 text-center">
          <Link to="/auth/register" className="text-sm text-[var(--color-accent-mid)] hover:underline">
            Não tem conta? Criar agora
          </Link>
          <Link to="/" className="text-xs text-[var(--color-text-muted)] hover:underline">
            Jogar como convidado
          </Link>
        </div>
      </div>
    </div>
  );
}
