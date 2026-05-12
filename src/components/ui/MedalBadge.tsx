import { Trophy } from 'lucide-react';

interface MedalBadgeProps {
  count: number;
  size?: 'sm' | 'md';
}

export function MedalBadge({ count, size = 'sm' }: MedalBadgeProps) {
  if (count === 0) return null;

  const iconSize = size === 'sm' ? 11 : 14;
  const textClass = size === 'sm' ? 'text-[10px]' : 'text-xs';

  return (
    <span
      className={`inline-flex items-center gap-0.5 ${textClass} font-semibold`}
      style={{ color: 'oklch(60% 0.2 300)' }}
      title={`${count} vitória${count !== 1 ? 's' : ''} nesta sessão`}
    >
      <Trophy size={iconSize} />
      {count}
    </span>
  );
}
