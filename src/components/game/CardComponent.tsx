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
  /** Sempre pequena, em qualquer breakpoint. */
  small?: boolean;
  /**
   * Pequena no mobile (<sm), tamanho normal no desktop. Usado na mao e na
   * mesa para nao estourar o layout em 375px. Ignorado quando `small`.
   */
  responsiveSmall?: boolean;
  disabled?: boolean;
  insertTarget?: boolean;
  testId?: string;
}

export function CardComponent({ card, selected, onClick, faceDown, small, responsiveSmall, disabled, insertTarget, testId }: CardProps) {
  if (faceDown) {
    return (
      <div
        data-testid={testId}
        className={cn(
          'rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] flex items-center justify-center',
          small
            ? 'w-10 h-14'
            : responsiveSmall
              ? 'w-10 h-14 sm:w-16 sm:h-24'
              : 'w-16 h-24',
        )}
      >
        <EyeOff size={small ? 14 : 22} className="text-[var(--color-text-muted)]" />
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
        'relative rounded-lg border-2 flex flex-col items-center justify-between transition-all duration-150 select-none',
        small
          ? 'w-12 h-16 p-1 text-xs'
          : responsiveSmall
            ? 'w-12 h-16 p-1 text-xs sm:w-20 sm:h-28 sm:p-2 sm:text-base'
            : 'w-20 h-28 p-2 text-base',
        selected
          ? 'border-[var(--color-accent-glow)] shadow-[0_0_12px_var(--color-accent-glow)] sm:-translate-y-2'
          : 'border-[var(--color-border)] hover:border-[var(--color-accent-mid)]',
        disabled ? 'cursor-default' : 'cursor-pointer',
        insertTarget && 'border-dashed border-[var(--color-warning)] opacity-60',
      )}
      style={{ background: `${color}18` }}
    >
      <span
        className={cn(
          'font-bold drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]',
          small
            ? 'text-sm'
            : responsiveSmall
              ? 'text-sm sm:text-lg'
              : 'text-lg',
        )}
        style={{ color: 'oklch(98% 0.02 90)' }}
      >
        {card.value}
      </span>
      <span
        className={cn(
          small ? 'text-sm' : responsiveSmall ? 'text-sm sm:text-2xl' : 'text-2xl',
        )}
      >
        {emoji}
      </span>
      {!small && !responsiveSmall && (
        <span className="text-[9px] text-[var(--color-text-muted)] leading-tight text-center">{label}</span>
      )}
      {responsiveSmall && (
        <span className="hidden sm:block text-[9px] text-[var(--color-text-muted)] leading-tight text-center">{label}</span>
      )}
      <div className="absolute top-0.5 right-1 text-[9px] font-bold opacity-75" style={{ color }}>
        {card.category[0]}
      </div>
    </motion.button>
  );
}
