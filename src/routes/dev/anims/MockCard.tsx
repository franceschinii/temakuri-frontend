/**
 * MockCard — carta visual autocontida para o playground de animações.
 * Não depende de nenhum componente de jogo do app. Mesma proporção
 * (w-16 h-24) das cartas reais para a calibragem das animações bater.
 */

interface MockCardProps {
  value?: number;
  label?: string;
  /** Face-down (verso). */
  faceDown?: boolean;
  className?: string;
}

const CAT_HUE: Record<string, number> = {
  SUSHI: 25,
  RAMEN: 55,
  CURRY: 75,
  PIZZA: 35,
  BURGER: 45,
  TACO: 95,
  DESSERT: 330,
};

export function MockCard({ value = 7, label = 'SUSHI', faceDown = false, className = '' }: MockCardProps) {
  if (faceDown) {
    return (
      <div
        className={`w-16 h-24 rounded-lg flex items-center justify-center ${className}`}
        style={{
          background: 'var(--color-panel)',
          border: '2px solid var(--color-border)',
        }}
      >
        <span
          className="text-3xl"
          style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', color: 'var(--color-text-muted)' }}
        >
          ?
        </span>
      </div>
    );
  }

  const hue = CAT_HUE[label] ?? 25;

  return (
    <div
      className={`w-16 h-24 rounded-lg flex flex-col items-center justify-between py-2 ${className}`}
      style={{
        background: 'linear-gradient(155deg, #fef9ee, #e9d6a3)',
        border: '2px solid #c8980e',
        boxShadow: 'inset 0 0 0 1px oklch(80% 0.12 85 / 0.4)',
      }}
    >
      <span
        className="text-2xl font-bold leading-none"
        style={{ color: '#b01212', fontFamily: 'var(--font-display)' }}
      >
        {value}
      </span>
      <div
        className="w-7 h-7 rounded-full"
        style={{ background: `oklch(62% 0.18 ${hue})` }}
      />
      <span
        className="text-[8px] tracking-widest font-bold"
        style={{ color: '#7a5a0a' }}
      >
        {label}
      </span>
    </div>
  );
}
