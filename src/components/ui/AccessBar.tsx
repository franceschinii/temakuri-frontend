import { Volume2, VolumeX, Music, Music2 } from 'lucide-react';
import { useGameStore } from '@/stores/gameStore';

export function AccessBar() {
  const soundEnabled = useGameStore(s => s.soundEnabled);
  const toggleSound = useGameStore(s => s.toggleSound);
  const musicEnabled = useGameStore(s => s.musicEnabled);
  const toggleMusic = useGameStore(s => s.toggleMusic);

  return (
    <div className="flex items-center gap-0.5">
      <button
        onClick={toggleSound}
        aria-label={soundEnabled ? 'Silenciar sons' : 'Ativar sons'}
        title={soundEnabled ? 'Silenciar sons' : 'Ativar sons'}
        className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-panel)] transition-all"
      >
        {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
      </button>
      <button
        onClick={toggleMusic}
        aria-label={musicEnabled ? 'Silenciar música' : 'Ativar música'}
        title={musicEnabled ? 'Silenciar música' : 'Ativar música'}
        className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-panel)] transition-all"
      >
        {musicEnabled ? <Music size={16} /> : <Music2 size={16} />}
      </button>
    </div>
  );
}
