import { motion } from 'framer-motion';
import { EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Card } from '@/types/game';
import { CATEGORY_EMOJI, CATEGORY_COLOR, CATEGORY_DISPLAY } from '@/constants/cards';

interface CardProps {
  card: Card;
  selected?: boolean;
  onClick?: () => void;
  faceDown?: boolean;
  small?: boolean;
  disabled?: boolean;
  insertTarget?: boolean;
  testId?: string;
}

export function CardComponent({ card, selected, onClick, faceDown, small, disabled, insertTarget, testId }: CardProps) {
  if (faceDown) {
    return (
      <div
        data-testid={testId}
        className={cn(
          'rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] flex items-center justify-center',
          small ? 'w-8 h-11' : 'w-14 h-20',
        )}
      >
        <EyeOff size={small ? 12 : 18} className="text-[var(--color-text-muted)]" />
      </div>
    );
  }

  const color = CATEGORY_COLOR[card.category];
  const emoji = CATEGORY_EMOJI[card.category];
  const label = CATEGORY_DISPLAY[card.category];

  return (
    <motion.button
      data-testid={testId}
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { y: -4, scale: 1.03 } : {}}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      className={cn(
        'relative rounded-lg border-2 flex flex-col items-center justify-between cursor-pointer transition-all duration-150 select-none',
        small ? 'w-10 h-14 p-1 text-xs' : 'w-16 h-24 p-2 text-sm',
        selected
          ? 'border-[var(--color-accent-glow)] shadow-[0_0_12px_var(--color-accent-glow)] -translate-y-2'
          : 'border-[var(--color-border)] hover:border-[var(--color-accent-mid)]',
        disabled && 'opacity-40 cursor-not-allowed',
        insertTarget && 'border-dashed border-[var(--color-warning)] opacity-60',
      )}
      style={{ background: `${color}18` }}
    >
      <span className="font-bold text-[var(--color-text-primary)]" style={{ fontSize: small ? 12 : 16 }}>
        {card.value}
      </span>
      <span style={{ fontSize: small ? 14 : 22 }}>{emoji}</span>
      {!small && (
        <span className="text-[9px] text-[var(--color-text-muted)] leading-tight text-center">{label}</span>
      )}
      <div className="absolute top-0.5 right-1 text-[8px] font-bold opacity-40" style={{ color }}>
        {card.category[0]}
      </div>
    </motion.button>
  );
}
