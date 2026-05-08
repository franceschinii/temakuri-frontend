import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';
import { toast } from 'sonner';
import { INITIAL_TOKENS } from '@/constants/game';

const schema = z.object({
  username: z.string().min(3).max(20).optional().or(z.literal('')),
});

export default function ProfilePage() {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const setUser = useAuthStore(s => s.setUser);
  const qc = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await api.get('/profile');
      return data;
    },
  });

  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { username: user?.username ?? '' },
  });

  const mutation = useMutation({
    mutationFn: async (values: { username?: string }) => {
      const { data } = await api.patch('/profile', values);
      return data;
    },
    onSuccess: (data) => {
      setUser(data);
      qc.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Perfil atualizado');
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Erro ao atualizar'),
  });

  const stats = profile?.stats;

  return (
    <div className="min-h-dvh bg-[var(--color-base)] flex flex-col">
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-3 flex items-center gap-3">
        <button onClick={() => navigate('/lobby')} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-lg font-semibold text-[var(--color-text-primary)]">Perfil</h1>
      </header>

      <main className="max-w-md mx-auto w-full p-6 flex flex-col gap-6">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-20 h-20 rounded-full bg-[var(--color-panel)] flex items-center justify-center text-4xl font-bold text-[var(--color-accent-soft)]">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <span className="text-lg font-semibold text-[var(--color-text-primary)]">{user?.username}</span>
          {user?.isGuest && <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-panel)] text-[var(--color-text-muted)]">Convidado</span>}
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Partidas', value: stats.gamesPlayed },
              { label: 'Vitórias', value: stats.gamesWon },
              { label: 'Sabores', value: stats.saborTriggers },
              { label: 'Vazas', value: stats.tricksWon },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-center">
                <p className="text-2xl font-bold text-[var(--color-accent-soft)]">{value}</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Edit form — only for non-guests */}
        {!user?.isGuest && (
          <form onSubmit={handleSubmit(v => mutation.mutate(v))} className="flex flex-col gap-3">
            <Input label="Nome de usuário" {...register('username')} />
            <Button type="submit" disabled={isSubmitting || mutation.isPending}>
              Salvar alterações
            </Button>
          </form>
        )}
      </main>
    </div>
  );
}
