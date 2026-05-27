import { useNavigate } from 'react-router-dom';
import { Volume2, VolumeX, Music, Music2, LifeBuoy, Lightbulb } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { useGameStore } from '@/stores/gameStore';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const navigate = useNavigate();
  const soundEnabled = useGameStore(s => s.soundEnabled);
  const toggleSound = useGameStore(s => s.toggleSound);
  const musicEnabled = useGameStore(s => s.musicEnabled);
  const toggleMusic = useGameStore(s => s.toggleMusic);
  const hintsEnabled = useGameStore(s => s.hintsEnabled);
  const toggleHints = useGameStore(s => s.toggleHints);

  const handleSupport = () => {
    onClose();
    navigate('/support');
  };

  return (
    <Modal open={open} onClose={onClose} title="Configurações">
      <div className="flex flex-col gap-2">
        <button
          onClick={toggleSound}
          className="flex items-center justify-between w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)]/50 hover:bg-[var(--color-panel)] transition-colors"
        >
          <div className="flex items-center gap-3">
            {soundEnabled
              ? <Volume2 size={18} style={{ color: 'var(--color-accent-mid)' }} />
              : <VolumeX size={18} style={{ color: 'var(--color-text-muted)' }} />}
            <div className="text-left">
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Efeitos sonoros</p>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {soundEnabled ? 'Ativado' : 'Desativado'}
              </p>
            </div>
          </div>
          <div
            className="w-9 h-5 rounded-full flex items-center transition-colors shrink-0"
            style={{
              background: soundEnabled ? 'var(--color-accent-mid)' : 'var(--color-border)',
              padding: '2px',
            }}
          >
            <div
              className="w-4 h-4 rounded-full bg-white transition-transform"
              style={{ transform: soundEnabled ? 'translateX(16px)' : 'translateX(0)' }}
            />
          </div>
        </button>

        <button
          onClick={toggleMusic}
          className="flex items-center justify-between w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)]/50 hover:bg-[var(--color-panel)] transition-colors"
        >
          <div className="flex items-center gap-3">
            {musicEnabled
              ? <Music size={18} style={{ color: 'var(--color-accent-mid)' }} />
              : <Music2 size={18} style={{ color: 'var(--color-text-muted)' }} />}
            <div className="text-left">
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Música</p>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {musicEnabled ? 'Ativada' : 'Desativada'}
              </p>
            </div>
          </div>
          <div
            className="w-9 h-5 rounded-full flex items-center transition-colors shrink-0"
            style={{
              background: musicEnabled ? 'var(--color-accent-mid)' : 'var(--color-border)',
              padding: '2px',
            }}
          >
            <div
              className="w-4 h-4 rounded-full bg-white transition-transform"
              style={{ transform: musicEnabled ? 'translateX(16px)' : 'translateX(0)' }}
            />
          </div>
        </button>

        <button
          onClick={toggleHints}
          className="flex items-center justify-between w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)]/50 hover:bg-[var(--color-panel)] transition-colors"
        >
          <div className="flex items-center gap-3">
            <Lightbulb size={18} style={{ color: hintsEnabled ? 'var(--color-accent-mid)' : 'var(--color-text-muted)' }} />
            <div className="text-left">
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Dicas in-game</p>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {hintsEnabled ? 'Ativadas' : 'Desativadas'}
              </p>
            </div>
          </div>
          <div
            className="w-9 h-5 rounded-full flex items-center transition-colors shrink-0"
            style={{
              background: hintsEnabled ? 'var(--color-accent-mid)' : 'var(--color-border)',
              padding: '2px',
            }}
          >
            <div
              className="w-4 h-4 rounded-full bg-white transition-transform"
              style={{ transform: hintsEnabled ? 'translateX(16px)' : 'translateX(0)' }}
            />
          </div>
        </button>

        <div className="my-1 border-t border-[var(--color-border)]" />

        <button
          onClick={handleSupport}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)]/50 hover:bg-[var(--color-panel)] transition-colors"
        >
          <LifeBuoy size={18} style={{ color: 'var(--color-text-muted)' }} />
          <div className="text-left">
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Suporte e FAQ</p>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Dúvidas, problemas e perguntas frequentes</p>
          </div>
        </button>
      </div>
    </Modal>
  );
}
