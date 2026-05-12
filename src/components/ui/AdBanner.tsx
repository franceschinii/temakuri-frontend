import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';

interface Props {
  slot?: string;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export function AdBanner({ slot = '1234567890', className = '' }: Props) {
  const user = useAuthStore(s => s.user);
  const pushed = useRef(false);

  useEffect(() => {
    if (user?.isPremium || pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {}
  }, [user?.isPremium]);

  if (user?.isPremium) return null;

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-6948139054810704"
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
