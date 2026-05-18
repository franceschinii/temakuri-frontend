import { useState } from 'react';
import { Settings } from 'lucide-react';
import { SettingsModal } from '@/components/ui/SettingsModal';

export function AccessBar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Configurações"
        title="Configurações"
        className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-panel)] transition-all"
      >
        <Settings size={16} />
      </button>
      <SettingsModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
