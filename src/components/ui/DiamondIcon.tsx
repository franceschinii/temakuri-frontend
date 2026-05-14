import { useId } from 'react';

interface DiamondIconProps {
  size?: number;
  className?: string;
}

/**
 * SVG do diamante. useId() garante que multiplos diamantes na mesma tela
 * nao colidam nos ids dos gradients.
 */
export function DiamondIcon({ size = 16, className }: DiamondIconProps) {
  const raw = useId();
  const uid = raw.replace(/:/g, '');
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id={`diamond-grad-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="oklch(92% 0.1 220)" />
          <stop offset="50%" stopColor="oklch(80% 0.16 220)" />
          <stop offset="100%" stopColor="oklch(60% 0.18 220)" />
        </linearGradient>
      </defs>
      <path
        d="M12 2 L22 9 L12 22 L2 9 Z"
        fill={`url(#diamond-grad-${uid})`}
        stroke="oklch(50% 0.18 220)"
        strokeWidth="0.6"
        strokeLinejoin="round"
      />
      {/* highlight (faceta superior) */}
      <path d="M12 2 L7 9 L17 9 Z" fill="oklch(99% 0.04 220)" opacity="0.45" />
      {/* sombra direita */}
      <path d="M12 2 L17 9 L12 22 Z" fill="oklch(40% 0.12 220)" opacity="0.2" />
      {/* brilho central */}
      <circle cx="10" cy="6" r="0.8" fill="white" opacity="0.7" />
    </svg>
  );
}
