import { useState } from 'react';
import { Volume2, VolumeX, Music, Music2 } from 'lucide-react';
import { setMuted, isMuted } from '@/lib/sounds';
import { setMusicMuted, isMusicMuted } from '@/lib/music';

export function AccessBar() {
  const [soundMuted, setSoundMuted] = useState(() => isMuted());
  const [musicMuted, setMusicMuted2] = useState(() => isMusicMuted());

  const toggleSound = () => {
    const next = !soundMuted;
    setSoundMuted(next);
    setMuted(next);
  };

  const toggleMusic = () => {
    const next = !musicMuted;
    setMusicMuted2(next);
    setMusicMuted(next);
  };

  return (
    <div className="flex items-center gap-0.5">
      <button
        onClick={toggleSound}
        aria-label={soundMuted ? 'Ativar sons' : 'Silenciar sons'}
        title={soundMuted ? 'Ativar sons' : 'Silenciar sons'}
        className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-panel)] transition-all"
      >
        {soundMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
      </button>
      <button
        onClick={toggleMusic}
        aria-label={musicMuted ? 'Ativar música' : 'Silenciar música'}
        title={musicMuted ? 'Ativar música' : 'Silenciar música'}
        className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-panel)] transition-all"
      >
        {musicMuted ? <Music2 size={16} /> : <Music size={16} />}
      </button>
    </div>
  );
}
