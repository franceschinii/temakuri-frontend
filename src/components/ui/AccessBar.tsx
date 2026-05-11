import { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { setMuted, isMuted } from '@/lib/sounds';
import { setMusicMuted, isMusicMuted } from '@/lib/music';

export function AccessBar() {
  const [mute, setMute] = useState(() => isMuted() || isMusicMuted());

  const toggle = () => {
    const next = !mute;
    setMute(next);
    setMuted(next);
    setMusicMuted(next);
  };

  return (
    <button
      onClick={toggle}
      aria-label={mute ? 'Ativar áudio' : 'Silenciar áudio'}
      title={mute ? 'Ativar áudio' : 'Silenciar áudio'}
      className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-panel)] transition-all"
    >
      {mute ? <VolumeX size={16} /> : <Volume2 size={16} />}
    </button>
  );
}
