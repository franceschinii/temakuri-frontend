import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RoomCard } from '@/components/lobby/RoomCard';
import { CreateRoomModal } from '@/components/lobby/CreateRoomModal';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';
import type { RoomPublicState } from '@/types/game';
import { toast } from 'sonner';

export default function LobbyPage() {
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('');

  const { data: rooms = [], isLoading } = useQuery<RoomPublicState[]>({
    queryKey: ['rooms'],
    queryFn: async () => {
      const { data } = await api.get('/rooms?status=WAITING');
      return data;
    },
    refetchInterval: 5000,
  });

  const handleJoin = async () => {
    const code = joinCode.trim().toUpperCase();
    if (!code) return;
    try {
      await api.get(`/rooms/${code}`);
      navigate(`/lobby/${code}`);
    } catch {
      toast.error('Sala não encontrada');
    }
  };

  return (
    <div className="min-h-dvh bg-[var(--color-base)] flex flex-col">
      {/* Header */}
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-[var(--color-accent-soft)]">🍱 Temakuri</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/profile')}
            className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            {user?.username}
          </button>
          <Button variant="ghost" size="sm" onClick={logout}>Sair</Button>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full p-6 flex flex-col gap-6">
        {/* Join or Create */}
        <div className="flex gap-2">
          <Input
            placeholder="Código da sala (ex: ABC123)"
            value={joinCode}
            onChange={e => setJoinCode(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && handleJoin()}
            maxLength={6}
            className="font-mono"
          />
          <Button variant="outline" onClick={handleJoin}>
            <Search size={16} /> Entrar
          </Button>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus size={16} /> Criar
          </Button>
        </div>

        {/* Room list */}
        <div>
          <h2 className="text-sm font-medium text-[var(--color-text-muted)] mb-3">
            Salas abertas {rooms.length > 0 && `(${rooms.length})`}
          </h2>
          {isLoading ? (
            <div className="text-center text-[var(--color-text-muted)] py-8">Carregando...</div>
          ) : rooms.length === 0 ? (
            <div className="text-center text-[var(--color-text-muted)] py-8 border border-dashed border-[var(--color-border)] rounded-xl">
              Nenhuma sala aberta. Crie uma!
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {rooms.map(room => <RoomCard key={room.id} room={room} />)}
            </div>
          )}
        </div>
      </main>

      <CreateRoomModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
