import { cn } from '@/lib/utils';
import { DiamondIcon } from '@/components/ui/DiamondIcon';

interface PriceTagProps {
  price: number;
  defaultPrice?: number;
  currency: 'coins' | 'diamonds';
  /** Se true, valores e badge ficam menores (uso em botoes compactos). */
  compact?: boolean;
  className?: string;
}

/**
 * Exibe o preco do item. Se ha override ativo (defaultPrice > price),
 * mostra o valor antigo riscado e um badge de "-X% OFF" pra evidenciar
 * o desconto. Para itens sem desconto, exibe apenas o preco atual.
 */
export function PriceTag({ price, defaultPrice, currency, compact, className }: PriceTagProps) {
  const hasDiscount = typeof defaultPrice === 'number' && defaultPrice > price && price >= 0;
  const percentOff = hasDiscount
    ? Math.round(((defaultPrice! - price) / defaultPrice!) * 100)
    : 0;
  const Icon = currency === 'diamonds'
    ? <DiamondIcon size={compact ? 10 : 12} />
    : <span className={compact ? 'text-[10px]' : 'text-xs'}>金</span>;

  if (!hasDiscount) {
    return (
      <span className={cn('inline-flex items-center gap-1 font-semibold tabular-nums', className)}>
        {Icon}
        {price}
      </span>
    );
  }

  return (
    <span className={cn('inline-flex items-center gap-1.5 tabular-nums', className)}>
      <span className={cn('opacity-50 line-through font-mono', compact ? 'text-[9px]' : 'text-[10px]')}>
        {defaultPrice}
      </span>
      <span className="inline-flex items-center gap-0.5 font-semibold">
        {Icon}
        {price}
      </span>
      <span
        className={cn(
          'rounded-full px-1.5 py-0.5 font-bold uppercase tracking-wider',
          compact ? 'text-[8px]' : 'text-[9px]',
          'bg-[var(--color-danger)]/15 text-[var(--color-danger-soft)] border border-[var(--color-danger)]/30',
        )}
      >
        -{percentOff}%
      </span>
    </span>
  );
}
