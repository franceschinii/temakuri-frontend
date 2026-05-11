interface LogoProps {
  variant?: 'full' | 'mark';
  size?: number;
  className?: string;
}

export function Logo({ variant = 'full', size, className }: LogoProps) {
  if (variant === 'mark') {
    const s = size ?? 24;
    const h = Math.round(s * 1.45);
    return (
      <svg
        viewBox="0 0 116 172"
        width={s}
        height={h}
        fill="none"
        aria-hidden="true"
        className={className}
      >
        <defs>
          <linearGradient id="lm-card" x1="0" y1="0" x2=".15" y2="1">
            <stop offset="0%" stopColor="#fef9ee" />
            <stop offset="100%" stopColor="#e9d6a3" />
          </linearGradient>
          <linearGradient id="lm-gold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f0cb58" />
            <stop offset="100%" stopColor="#a4760c" />
          </linearGradient>
        </defs>
        {/* ghost card */}
        <g transform="rotate(-8 58 86)" opacity=".3">
          <rect x="4" y="4" width="108" height="164" rx="10" fill="#1a0808" />
          <rect x="4" y="4" width="108" height="164" rx="10" fill="none" stroke="#c09018" strokeWidth="1.5" />
        </g>
        {/* main card */}
        <g transform="rotate(5 58 86)">
          <rect x="4" y="4" width="108" height="164" rx="10" fill="url(#lm-card)" />
          <rect x="4" y="4" width="108" height="164" rx="10" fill="none" stroke="url(#lm-gold)" strokeWidth="2" />
          <rect x="10" y="10" width="96" height="152" rx="7" fill="none" stroke="#c8980e" strokeWidth=".8" opacity=".5" />
          {/* corner diamonds */}
          <polygon points="18,16 22,22 18,28 14,22" fill="#b01212" />
          <polygon points="98,16 102,22 98,28 94,22" fill="#b01212" />
          <polygon points="18,144 22,150 18,156 14,150" fill="#b01212" />
          <polygon points="98,144 102,150 98,156 94,150" fill="#b01212" />
          {/* kamon */}
          <g transform="translate(58 86)">
            <circle r="36" fill="none" stroke="#b01212" strokeWidth="1.4" />
            <rect x="-5" y="-29" width="10" height="16" rx="2" fill="#b01212" />
            <g transform="rotate(90)"><rect x="-5" y="-29" width="10" height="16" rx="2" fill="#b01212" /></g>
            <g transform="rotate(180)"><rect x="-5" y="-29" width="10" height="16" rx="2" fill="#b01212" /></g>
            <g transform="rotate(270)"><rect x="-5" y="-29" width="10" height="16" rx="2" fill="#b01212" /></g>
            <g transform="rotate(45)"><polygon points="0,-20 3,-17 0,-14 -3,-17" fill="#b01212" opacity=".9" /></g>
            <g transform="rotate(135)"><polygon points="0,-20 3,-17 0,-14 -3,-17" fill="#b01212" opacity=".9" /></g>
            <g transform="rotate(225)"><polygon points="0,-20 3,-17 0,-14 -3,-17" fill="#b01212" opacity=".9" /></g>
            <g transform="rotate(315)"><polygon points="0,-20 3,-17 0,-14 -3,-17" fill="#b01212" opacity=".9" /></g>
            <polygon points="0,-10 10,0 0,10 -10,0" fill="#b01212" />
            <polygon points="0,-6 6,0 0,6 -6,0" fill="#fef9ee" />
          </g>
        </g>
      </svg>
    );
  }

  // full — use the logo.svg asset
  const h = size ?? 52;
  const w = Math.round(h * (800 / 220));
  return (
    <img
      src="/logo.svg"
      width={w}
      height={h}
      alt="Temakuri"
      className={className}
      draggable={false}
    />
  );
}
