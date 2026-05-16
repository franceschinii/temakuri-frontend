import { useId } from 'react';
import { LevelBorder } from './LevelBorder';

interface AvatarProps {
  index: number;
  size?: number;
  className?: string;
}

/**
 * Avatares de comida japonesa. Cada um tem qualidade crescente conforme o
 * preco na loja (0-3 sao gratis, 4-7 sao pagos). Os mais caros recebem
 * gradientes mais ricos, micro detalhes, brilho extra e, no caso do Udon,
 * uma moldura premium dourada interna.
 *
 * Cada SVG e auto-contido: defs locais com sufixo do indice para evitar
 * colisao de IDs quando renderizamos varios avatares na mesma tela.
 */
const AVATARS = [
  // 0 — Temaki (cone de arroz) — gratis
  (size: number, u: string) => (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={`bg0-${u}`} cx="0.3" cy="0.25" r="0.9">
          <stop offset="0%" stopColor="oklch(30% 0.03 260)" />
          <stop offset="100%" stopColor="oklch(18% 0.02 260)" />
        </radialGradient>
        <linearGradient id={`nori0-${u}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(40% 0.13 160)" />
          <stop offset="100%" stopColor="oklch(22% 0.1 160)" />
        </linearGradient>
        <linearGradient id={`rice0-${u}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(98% 0.02 90)" />
          <stop offset="100%" stopColor="oklch(88% 0.04 85)" />
        </linearGradient>
        <linearGradient id={`salmon0-${u}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(82% 0.2 32)" />
          <stop offset="100%" stopColor="oklch(64% 0.2 28)" />
        </linearGradient>
      </defs>
      <circle cx="40" cy="40" r="40" fill={`url(#bg0-${u})`} />
      {/* nori cone, with subtle texture */}
      <path d="M27 21 L53 21 L40 64 Z" fill={`url(#nori0-${u})`} />
      <path d="M27 21 L40 64 L35 64 L25 24 Z" fill="oklch(20% 0.08 160)" opacity="0.45" />
      {/* nori speckles */}
      <circle cx="33" cy="36" r="0.7" fill="oklch(50% 0.1 160)" opacity="0.7" />
      <circle cx="42" cy="46" r="0.6" fill="oklch(50% 0.1 160)" opacity="0.7" />
      <circle cx="38" cy="55" r="0.6" fill="oklch(50% 0.1 160)" opacity="0.7" />
      {/* rice with shadow */}
      <ellipse cx="40" cy="24" rx="13" ry="6.5" fill={`url(#rice0-${u})`} />
      <ellipse cx="40" cy="22.5" rx="11" ry="2.5" fill="oklch(99% 0.01 90)" opacity="0.7" />
      {/* salmon + avocado fillings */}
      <ellipse cx="36" cy="22" rx="6" ry="3" fill={`url(#salmon0-${u})`} />
      <ellipse cx="36" cy="21.5" rx="4" ry="1.2" fill="oklch(90% 0.12 38)" opacity="0.55" />
      <ellipse cx="45" cy="21" rx="4.5" ry="2.5" fill="oklch(72% 0.16 130)" />
      <ellipse cx="45" cy="20.5" rx="3" ry="1" fill="oklch(85% 0.14 130)" opacity="0.5" />
      {/* sesame */}
      <circle cx="40" cy="25" r="0.7" fill="oklch(70% 0.08 80)" />
      <circle cx="33" cy="26" r="0.6" fill="oklch(70% 0.08 80)" />
      {/* face */}
      <circle cx="35" cy="38" r="3" fill="white" />
      <circle cx="45" cy="38" r="3" fill="white" />
      <circle cx="35.6" cy="38.6" r="1.5" fill="oklch(18% 0.02 260)" />
      <circle cx="45.6" cy="38.6" r="1.5" fill="oklch(18% 0.02 260)" />
      <circle cx="36.2" cy="37.8" r="0.7" fill="white" />
      <circle cx="46.2" cy="37.8" r="0.7" fill="white" />
      <path d="M36 46 Q40 50 44 46" stroke="oklch(20% 0.02 260)" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  ),

  // 1 — Ramen (tigela classica) — gratis
  (size: number, u: string) => (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={`bg1-${u}`} cx="0.3" cy="0.25" r="0.9">
          <stop offset="0%" stopColor="oklch(30% 0.03 260)" />
          <stop offset="100%" stopColor="oklch(18% 0.02 260)" />
        </radialGradient>
        <linearGradient id={`bowl1-${u}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(82% 0.13 55)" />
          <stop offset="100%" stopColor="oklch(55% 0.13 45)" />
        </linearGradient>
        <radialGradient id={`broth1-${u}`} cx="0.5" cy="0.4" r="0.7">
          <stop offset="0%" stopColor="oklch(80% 0.15 70)" />
          <stop offset="100%" stopColor="oklch(60% 0.16 60)" />
        </radialGradient>
      </defs>
      <circle cx="40" cy="40" r="40" fill={`url(#bg1-${u})`} />
      {/* steam */}
      <path d="M28 22 Q26 16 28 10" stroke="oklch(90% 0.02 260)" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.45" />
      <path d="M40 20 Q38 14 40 8" stroke="oklch(90% 0.02 260)" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5" />
      <path d="M52 22 Q50 16 52 10" stroke="oklch(90% 0.02 260)" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.45" />
      {/* bowl */}
      <path d="M16 38 Q16 62 40 62 Q64 62 64 38 Z" fill={`url(#bowl1-${u})`} />
      <path d="M16 38 Q16 62 40 62 Q64 62 64 38 Z" fill="oklch(50% 0.1 50)" opacity="0.18" />
      {/* rim */}
      <ellipse cx="40" cy="38" rx="24" ry="5.5" fill="oklch(88% 0.12 55)" />
      {/* broth */}
      <ellipse cx="40" cy="38" rx="22" ry="4.5" fill={`url(#broth1-${u})`} />
      {/* noodles */}
      <path d="M23 36 Q29 32 35 36 Q41 40 47 36 Q53 32 59 36" stroke="oklch(96% 0.04 80)" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      <path d="M21 39 Q27 35 33 39 Q39 43 45 39 Q51 35 59 39" stroke="oklch(92% 0.05 80)" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.8" />
      {/* egg with yolk highlight */}
      <ellipse cx="50" cy="36" rx="6.5" ry="5" fill="oklch(98% 0.01 90)" />
      <ellipse cx="50" cy="35.5" rx="3.5" ry="3" fill="oklch(82% 0.19 75)" />
      <ellipse cx="49" cy="35" rx="1.2" ry="0.8" fill="oklch(92% 0.15 80)" opacity="0.8" />
      {/* chashu */}
      <ellipse cx="29" cy="35" rx="6" ry="4" fill="oklch(50% 0.13 20)" />
      <ellipse cx="29" cy="34.5" rx="4" ry="2" fill="oklch(72% 0.12 22)" />
      <ellipse cx="29" cy="34.5" rx="2" ry="0.8" fill="oklch(85% 0.08 25)" opacity="0.5" />
      {/* nori strip */}
      <rect x="38" y="33" width="3" height="6" fill="oklch(28% 0.1 160)" />
      {/* eyes on bowl */}
      <circle cx="33" cy="50" r="2.8" fill="white" />
      <circle cx="47" cy="50" r="2.8" fill="white" />
      <circle cx="33.6" cy="50.6" r="1.4" fill="oklch(18% 0.02 260)" />
      <circle cx="47.6" cy="50.6" r="1.4" fill="oklch(18% 0.02 260)" />
      <circle cx="34.2" cy="49.8" r="0.6" fill="white" />
      <circle cx="48.2" cy="49.8" r="0.6" fill="white" />
      <ellipse cx="29" cy="54" rx="2.4" ry="1.2" fill="oklch(75% 0.18 15)" opacity="0.55" />
      <ellipse cx="51" cy="54" rx="2.4" ry="1.2" fill="oklch(75% 0.18 15)" opacity="0.55" />
      <path d="M36 55 Q40 58 44 55" stroke="oklch(20% 0.02 260)" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  ),

  // 2 — Onigiri (bolinho triangular) — gratis
  (size: number, u: string) => (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={`bg2-${u}`} cx="0.3" cy="0.25" r="0.9">
          <stop offset="0%" stopColor="oklch(30% 0.03 260)" />
          <stop offset="100%" stopColor="oklch(18% 0.02 260)" />
        </radialGradient>
        <linearGradient id={`rice2-${u}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(98% 0.02 90)" />
          <stop offset="100%" stopColor="oklch(86% 0.04 85)" />
        </linearGradient>
      </defs>
      <circle cx="40" cy="40" r="40" fill={`url(#bg2-${u})`} />
      {/* nori band */}
      <rect x="24" y="50" width="32" height="12" rx="3" fill="oklch(26% 0.1 160)" />
      <rect x="24" y="50" width="32" height="2.5" rx="1.5" fill="oklch(18% 0.08 160)" opacity="0.7" />
      {/* rice body */}
      <path d="M40 12 Q57 30 60 54 Q40 58 20 54 Q23 30 40 12 Z" fill={`url(#rice2-${u})`} />
      {/* internal highlight */}
      <path d="M40 14 Q47 28 49 50 Q44 52 40 52 Q36 52 31 50 Q33 28 40 14 Z" fill="white" opacity="0.18" />
      {/* sesame */}
      <ellipse cx="35" cy="26" rx="1.3" ry="0.6" fill="oklch(70% 0.08 70)" />
      <ellipse cx="44" cy="24" rx="1.3" ry="0.6" fill="oklch(70% 0.08 70)" transform="rotate(20 44 24)" />
      <ellipse cx="46" cy="32" rx="1.3" ry="0.6" fill="oklch(70% 0.08 70)" transform="rotate(-15 46 32)" />
      <ellipse cx="33" cy="34" rx="1.3" ry="0.6" fill="oklch(70% 0.08 70)" transform="rotate(10 33 34)" />
      <ellipse cx="40" cy="20" rx="1.2" ry="0.5" fill="oklch(70% 0.08 70)" />
      {/* eyes */}
      <circle cx="34" cy="36" r="3" fill="white" />
      <circle cx="46" cy="36" r="3" fill="white" />
      <circle cx="34.6" cy="36.6" r="1.5" fill="oklch(18% 0.02 260)" />
      <circle cx="46.6" cy="36.6" r="1.5" fill="oklch(18% 0.02 260)" />
      <circle cx="35.2" cy="35.8" r="0.7" fill="white" />
      <circle cx="47.2" cy="35.8" r="0.7" fill="white" />
      <ellipse cx="30" cy="40" rx="2.6" ry="1.3" fill="oklch(75% 0.18 15)" opacity="0.6" />
      <ellipse cx="50" cy="40" rx="2.6" ry="1.3" fill="oklch(75% 0.18 15)" opacity="0.6" />
      <path d="M37 43 Q40 46 43 43" stroke="oklch(20% 0.02 260)" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  ),

  // 3 — Gyoza (pastel) — gratis
  (size: number, u: string) => (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={`bg3-${u}`} cx="0.3" cy="0.25" r="0.9">
          <stop offset="0%" stopColor="oklch(30% 0.03 260)" />
          <stop offset="100%" stopColor="oklch(18% 0.02 260)" />
        </radialGradient>
        <linearGradient id={`gyoza3-${u}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(92% 0.07 75)" />
          <stop offset="100%" stopColor="oklch(72% 0.12 65)" />
        </linearGradient>
        <linearGradient id={`crispy3-${u}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(72% 0.14 55)" />
          <stop offset="100%" stopColor="oklch(50% 0.14 40)" />
        </linearGradient>
      </defs>
      <circle cx="40" cy="40" r="40" fill={`url(#bg3-${u})`} />
      {/* steam */}
      <path d="M30 28 Q28 22 30 16" stroke="oklch(90% 0.02 260)" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5" />
      <path d="M40 26 Q38 20 40 12" stroke="oklch(90% 0.02 260)" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.45" />
      <path d="M50 28 Q48 22 50 16" stroke="oklch(90% 0.02 260)" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5" />
      {/* body */}
      <ellipse cx="40" cy="46" rx="25" ry="14" fill={`url(#gyoza3-${u})`} />
      {/* crispy bottom */}
      <ellipse cx="40" cy="56" rx="21" ry="5" fill={`url(#crispy3-${u})`} />
      <ellipse cx="40" cy="58.5" rx="14" ry="1.5" fill="oklch(40% 0.12 30)" opacity="0.5" />
      {/* pleats / fold lines */}
      <path d="M20 47 Q24 40 28 47" stroke="oklch(60% 0.12 60)" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M27 44 Q31 37 35 44" stroke="oklch(60% 0.12 60)" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M35 43 Q40 36 45 43" stroke="oklch(60% 0.12 60)" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M45 44 Q49 37 53 44" stroke="oklch(60% 0.12 60)" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M52 47 Q56 40 60 47" stroke="oklch(60% 0.12 60)" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      {/* highlight on top */}
      <ellipse cx="40" cy="40" rx="14" ry="3" fill="white" opacity="0.2" />
      {/* eyes */}
      <circle cx="34" cy="44" r="3" fill="white" />
      <circle cx="46" cy="44" r="3" fill="white" />
      <circle cx="34.6" cy="44.6" r="1.5" fill="oklch(18% 0.02 260)" />
      <circle cx="46.6" cy="44.6" r="1.5" fill="oklch(18% 0.02 260)" />
      <circle cx="35.2" cy="43.8" r="0.7" fill="white" />
      <circle cx="47.2" cy="43.8" r="0.7" fill="white" />
      <ellipse cx="30" cy="49" rx="2.5" ry="1.3" fill="oklch(75% 0.18 15)" opacity="0.6" />
      <ellipse cx="50" cy="49" rx="2.5" ry="1.3" fill="oklch(75% 0.18 15)" opacity="0.6" />
      <path d="M36 50 Q40 53 44 50" stroke="oklch(20% 0.02 260)" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  ),

  // 4 — Sashimi (15 moedas) — gradientes mais ricos, textura no peixe
  (size: number, u: string) => (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={`bg4-${u}`} cx="0.3" cy="0.25" r="0.9">
          <stop offset="0%" stopColor="oklch(30% 0.03 260)" />
          <stop offset="100%" stopColor="oklch(18% 0.02 260)" />
        </radialGradient>
        <linearGradient id={`rice4-${u}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(98% 0.02 90)" />
          <stop offset="100%" stopColor="oklch(86% 0.04 80)" />
        </linearGradient>
        <linearGradient id={`salmon4-${u}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(82% 0.2 32)" />
          <stop offset="50%" stopColor="oklch(72% 0.2 30)" />
          <stop offset="100%" stopColor="oklch(58% 0.2 25)" />
        </linearGradient>
        <linearGradient id={`wasabi4-${u}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(75% 0.22 145)" />
          <stop offset="100%" stopColor="oklch(50% 0.22 145)" />
        </linearGradient>
      </defs>
      <circle cx="40" cy="40" r="40" fill={`url(#bg4-${u})`} />
      {/* wood board */}
      <rect x="14" y="55" width="52" height="10" rx="2" fill="oklch(45% 0.06 60)" />
      <rect x="14" y="55" width="52" height="2" fill="oklch(55% 0.08 60)" opacity="0.7" />
      <line x1="20" y1="60" x2="60" y2="60" stroke="oklch(35% 0.05 60)" strokeWidth="0.5" opacity="0.6" />
      {/* rice base */}
      <ellipse cx="40" cy="54" rx="22" ry="10" fill={`url(#rice4-${u})`} />
      <ellipse cx="40" cy="51" rx="18" ry="3" fill="white" opacity="0.4" />
      {/* nori strip */}
      <rect x="19" y="50" width="42" height="7" rx="2" fill="oklch(22% 0.1 160)" />
      <rect x="19" y="50" width="42" height="1.5" fill="oklch(35% 0.12 160)" opacity="0.6" />
      {/* salmon slice (big, marbled) */}
      <ellipse cx="40" cy="44" rx="20" ry="10" fill={`url(#salmon4-${u})`} />
      <path d="M22 44 Q30 41 40 44 Q50 47 58 44" stroke="oklch(92% 0.06 30)" strokeWidth="1.2" fill="none" opacity="0.7" strokeLinecap="round" />
      <path d="M24 47 Q32 44 40 47 Q48 50 56 47" stroke="oklch(92% 0.06 30)" strokeWidth="1" fill="none" opacity="0.55" strokeLinecap="round" />
      <path d="M26 41 Q34 38 40 41 Q46 44 54 41" stroke="oklch(92% 0.06 30)" strokeWidth="0.9" fill="none" opacity="0.5" strokeLinecap="round" />
      {/* highlight */}
      <ellipse cx="36" cy="40" rx="9" ry="3" fill="white" opacity="0.3" />
      {/* eyes */}
      <circle cx="35" cy="42" r="3" fill="white" />
      <circle cx="45" cy="42" r="3" fill="white" />
      <circle cx="35.6" cy="42.6" r="1.5" fill="oklch(18% 0.02 260)" />
      <circle cx="45.6" cy="42.6" r="1.5" fill="oklch(18% 0.02 260)" />
      <circle cx="36.2" cy="41.8" r="0.7" fill="white" />
      <circle cx="46.2" cy="41.8" r="0.7" fill="white" />
      <ellipse cx="30" cy="46" rx="3" ry="1.5" fill="oklch(75% 0.18 15)" opacity="0.55" />
      <ellipse cx="50" cy="46" rx="3" ry="1.5" fill="oklch(75% 0.18 15)" opacity="0.55" />
      <path d="M37 47 Q40 50 43 47" stroke="oklch(20% 0.02 260)" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* wasabi cone */}
      <path d="M60 49 L57 45 L63 45 Z" fill={`url(#wasabi4-${u})`} />
      <path d="M58.5 47 L60 45.5 L61.5 47 Z" fill="oklch(80% 0.15 145)" opacity="0.7" />
      {/* shoyu drop */}
      <ellipse cx="18" cy="62" rx="2" ry="1" fill="oklch(28% 0.06 30)" opacity="0.9" />
    </svg>
  ),

  // 5 — Takoyaki (20 moedas) — 3 bolas com sombras, sauce com brilho
  (size: number, u: string) => (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={`bg5-${u}`} cx="0.3" cy="0.25" r="0.9">
          <stop offset="0%" stopColor="oklch(30% 0.03 260)" />
          <stop offset="100%" stopColor="oklch(18% 0.02 260)" />
        </radialGradient>
        <radialGradient id={`tako5-${u}`} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0%" stopColor="oklch(82% 0.14 60)" />
          <stop offset="100%" stopColor="oklch(58% 0.16 45)" />
        </radialGradient>
        <radialGradient id={`takoFront5-${u}`} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0%" stopColor="oklch(86% 0.14 60)" />
          <stop offset="100%" stopColor="oklch(62% 0.16 50)" />
        </radialGradient>
        <linearGradient id={`sauce5-${u}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(35% 0.1 25)" />
          <stop offset="100%" stopColor="oklch(20% 0.08 20)" />
        </linearGradient>
      </defs>
      <circle cx="40" cy="40" r="40" fill={`url(#bg5-${u})`} />
      {/* tray rim */}
      <ellipse cx="40" cy="60" rx="30" ry="6" fill="oklch(28% 0.04 50)" opacity="0.7" />
      {/* back balls */}
      <circle cx="26" cy="48" r="12" fill={`url(#tako5-${u})`} />
      <ellipse cx="23" cy="44" rx="4" ry="2" fill="white" opacity="0.25" />
      <circle cx="54" cy="48" r="12" fill={`url(#tako5-${u})`} />
      <ellipse cx="51" cy="44" rx="4" ry="2" fill="white" opacity="0.25" />
      {/* front ball */}
      <circle cx="40" cy="38" r="14" fill={`url(#takoFront5-${u})`} />
      <ellipse cx="36" cy="32" rx="5" ry="2.5" fill="white" opacity="0.3" />
      {/* sauce drizzle no topo (acima do rosto) */}
      <path d="M28 26 Q32 23 36 26 Q40 29 44 26 Q48 23 52 26" stroke={`url(#sauce5-${u})`} strokeWidth="1.8" strokeLinecap="round" fill="none" />
      {/* mayo zigzag no topo */}
      <path d="M30 30 Q34 27 38 30 Q42 33 46 30 Q50 27 52 30" stroke="oklch(98% 0.01 90)" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.9" />
      {/* aonori — so na parte de cima da bola, longe do rosto */}
      <circle cx="34" cy="29" r="0.9" fill="oklch(45% 0.15 145)" />
      <circle cx="42" cy="32" r="0.8" fill="oklch(45% 0.15 145)" />
      <circle cx="48" cy="31" r="0.9" fill="oklch(45% 0.15 145)" />
      {/* eyes — bem visiveis no centro da bola */}
      <circle cx="35" cy="38" r="3.2" fill="white" />
      <circle cx="45" cy="38" r="3.2" fill="white" />
      <circle cx="35.6" cy="38.6" r="1.6" fill="oklch(18% 0.02 260)" />
      <circle cx="45.6" cy="38.6" r="1.6" fill="oklch(18% 0.02 260)" />
      <circle cx="36.3" cy="37.7" r="0.8" fill="white" />
      <circle cx="46.3" cy="37.7" r="0.8" fill="white" />
      <ellipse cx="30" cy="42" rx="2.5" ry="1.3" fill="oklch(75% 0.18 15)" opacity="0.6" />
      <ellipse cx="50" cy="42" rx="2.5" ry="1.3" fill="oklch(75% 0.18 15)" opacity="0.6" />
      <path d="M37 44 Q40 47 43 44" stroke="oklch(20% 0.02 260)" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  ),

  // 6 — Miso (25 moedas) — tigela cerâmica detalhada, ingredientes ricos
  (size: number, u: string) => (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={`bg6-${u}`} cx="0.3" cy="0.25" r="0.9">
          <stop offset="0%" stopColor="oklch(30% 0.03 260)" />
          <stop offset="100%" stopColor="oklch(18% 0.02 260)" />
        </radialGradient>
        <linearGradient id={`bowl6-${u}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(78% 0.12 55)" />
          <stop offset="50%" stopColor="oklch(60% 0.12 45)" />
          <stop offset="100%" stopColor="oklch(38% 0.1 35)" />
        </linearGradient>
        <radialGradient id={`brothMiso6-${u}`} cx="0.5" cy="0.4" r="0.7">
          <stop offset="0%" stopColor="oklch(76% 0.13 70)" />
          <stop offset="100%" stopColor="oklch(58% 0.13 60)" />
        </radialGradient>
      </defs>
      <circle cx="40" cy="40" r="40" fill={`url(#bg6-${u})`} />
      {/* steam */}
      <path d="M28 22 Q26 16 28 8" stroke="oklch(90% 0.02 260)" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5" />
      <path d="M40 20 Q38 14 40 6" stroke="oklch(90% 0.02 260)" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.55" />
      <path d="M52 22 Q50 16 52 8" stroke="oklch(90% 0.02 260)" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5" />
      {/* bowl (sem padrao decorativo na faixa inferior — ficava embaixo da boca) */}
      <path d="M14 40 Q14 66 40 66 Q66 66 66 40 Z" fill={`url(#bowl6-${u})`} />
      {/* rim */}
      <ellipse cx="40" cy="40" rx="26" ry="6.5" fill="oklch(85% 0.12 55)" />
      <ellipse cx="40" cy="38.8" rx="22" ry="2" fill="white" opacity="0.35" />
      {/* miso broth */}
      <ellipse cx="40" cy="40" rx="23" ry="5.5" fill={`url(#brothMiso6-${u})`} />
      {/* tofu cubes */}
      <rect x="34" y="36" width="9" height="9" rx="2" fill="oklch(98% 0.02 90)" opacity="0.92" />
      <rect x="34" y="36" width="9" height="2" rx="1" fill="white" opacity="0.5" />
      <rect x="46" y="38" width="6" height="6" rx="1.5" fill="oklch(98% 0.02 90)" opacity="0.85" />
      {/* wakame */}
      <path d="M25 42 Q30 37 35 42 Q38 45 33 47 Q28 47 25 42 Z" fill="oklch(35% 0.15 145)" opacity="0.95" />
      <path d="M48 44 Q52 41 56 44 Q57 46 54 47 Q50 47 48 44 Z" fill="oklch(38% 0.15 145)" opacity="0.85" />
      {/* spring onion */}
      <circle cx="27" cy="40" r="1.5" fill="oklch(70% 0.2 145)" />
      <circle cx="30" cy="42" r="1.2" fill="oklch(68% 0.2 145)" />
      <circle cx="44" cy="41" r="1.3" fill="oklch(70% 0.2 145)" />
      <circle cx="52" cy="42" r="1.4" fill="oklch(68% 0.2 145)" />
      {/* face on bowl */}
      <circle cx="33" cy="50" r="2.8" fill="white" />
      <circle cx="47" cy="50" r="2.8" fill="white" />
      <circle cx="33.6" cy="50.6" r="1.4" fill="oklch(18% 0.02 260)" />
      <circle cx="47.6" cy="50.6" r="1.4" fill="oklch(18% 0.02 260)" />
      <circle cx="34.2" cy="49.8" r="0.6" fill="white" />
      <circle cx="48.2" cy="49.8" r="0.6" fill="white" />
      <ellipse cx="29" cy="54" rx="2.4" ry="1.2" fill="oklch(75% 0.18 15)" opacity="0.6" />
      <ellipse cx="51" cy="54" rx="2.4" ry="1.2" fill="oklch(75% 0.18 15)" opacity="0.6" />
      <path d="M36 55 Q40 58 44 55" stroke="oklch(20% 0.02 260)" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  ),

  // 7 — Udon (30 moedas) — versao simples, tigela ceramica neutra
  (size: number, u: string) => (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={`bg7-${u}`} cx="0.3" cy="0.25" r="0.9">
          <stop offset="0%" stopColor="oklch(30% 0.03 260)" />
          <stop offset="100%" stopColor="oklch(18% 0.02 260)" />
        </radialGradient>
        <linearGradient id={`bowl7-${u}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(75% 0.1 50)" />
          <stop offset="100%" stopColor="oklch(50% 0.1 40)" />
        </linearGradient>
        <radialGradient id={`broth7-${u}`} cx="0.5" cy="0.4" r="0.7">
          <stop offset="0%" stopColor="oklch(80% 0.13 70)" />
          <stop offset="100%" stopColor="oklch(60% 0.14 60)" />
        </radialGradient>
        <radialGradient id={`egg7-${u}`} cx="0.4" cy="0.35" r="0.7">
          <stop offset="0%" stopColor="oklch(92% 0.18 80)" />
          <stop offset="100%" stopColor="oklch(72% 0.2 70)" />
        </radialGradient>
      </defs>
      <circle cx="40" cy="40" r="40" fill={`url(#bg7-${u})`} />
      {/* steam */}
      <path d="M28 22 Q26 16 28 8" stroke="oklch(90% 0.02 260)" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5" />
      <path d="M40 20 Q38 14 40 6" stroke="oklch(90% 0.02 260)" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.55" />
      <path d="M52 22 Q50 16 52 8" stroke="oklch(90% 0.02 260)" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5" />
      {/* bowl */}
      <path d="M14 40 Q14 66 40 66 Q66 66 66 40 Z" fill={`url(#bowl7-${u})`} />
      {/* rim */}
      <ellipse cx="40" cy="40" rx="26" ry="6.5" fill="oklch(82% 0.12 55)" />
      <ellipse cx="40" cy="38.8" rx="22" ry="2" fill="white" opacity="0.35" />
      {/* broth */}
      <ellipse cx="40" cy="40" rx="24" ry="5.5" fill={`url(#broth7-${u})`} />
      {/* thick udon noodles */}
      <path d="M20 38 Q26 32 32 38 Q38 44 44 38 Q50 32 60 38" stroke="oklch(98% 0.02 90)" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M18 42 Q24 36 30 42 Q36 48 42 42 Q48 36 62 42" stroke="oklch(94% 0.04 90)" strokeWidth="3.4" strokeLinecap="round" fill="none" opacity="0.85" />
      <path d="M22 35 Q28 30 34 35 Q40 40 46 35" stroke="oklch(99% 0.02 90)" strokeWidth="2.4" strokeLinecap="round" fill="none" opacity="0.7" />
      {/* egg with golden yolk */}
      <ellipse cx="52" cy="36" rx="7" ry="5.5" fill="oklch(99% 0.01 90)" />
      <ellipse cx="52" cy="36" rx="4" ry="3.5" fill={`url(#egg7-${u})`} />
      <ellipse cx="51" cy="35" rx="1.5" ry="1" fill="oklch(96% 0.13 85)" opacity="0.85" />
      {/* naruto with spiral */}
      <circle cx="28" cy="37" r="5" fill="oklch(98% 0.02 90)" />
      <path d="M26 37 Q26 35 28 35 Q30 35 30 37 Q30 39 28 39 Q27 39 27 38" stroke="oklch(80% 0.18 355)" strokeWidth="1.2" fill="none" />
      <circle cx="28" cy="37" r="5" fill="none" stroke="oklch(80% 0.18 355)" strokeWidth="0.4" opacity="0.5" />
      {/* spring onions */}
      <circle cx="36" cy="41" r="1.4" fill="oklch(70% 0.2 145)" />
      <circle cx="44" cy="40" r="1.4" fill="oklch(70% 0.2 145)" />
      <circle cx="32" cy="44" r="1.2" fill="oklch(68% 0.2 145)" />
      <circle cx="48" cy="44" r="1.2" fill="oklch(68% 0.2 145)" />
      {/* nori strip */}
      <rect x="38" y="33" width="3.5" height="8" fill="oklch(25% 0.12 160)" />
      <rect x="38" y="33" width="3.5" height="1" fill="oklch(38% 0.15 160)" opacity="0.7" />
      {/* eyes */}
      <circle cx="34" cy="52" r="3" fill="white" />
      <circle cx="46" cy="52" r="3" fill="white" />
      <circle cx="34.6" cy="52.6" r="1.5" fill="oklch(18% 0.02 260)" />
      <circle cx="46.6" cy="52.6" r="1.5" fill="oklch(18% 0.02 260)" />
      <circle cx="35.2" cy="51.8" r="0.7" fill="white" />
      <circle cx="47.2" cy="51.8" r="0.7" fill="white" />
      <ellipse cx="29" cy="56" rx="2.5" ry="1.3" fill="oklch(75% 0.18 15)" opacity="0.6" />
      <ellipse cx="51" cy="56" rx="2.5" ry="1.3" fill="oklch(75% 0.18 15)" opacity="0.6" />
      <path d="M36 57 Q40 60 44 57" stroke="oklch(20% 0.02 260)" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  ),

  // 8 — Udon Gold (50 moedas) — ELITE com bowl dourado, moldura e estrelas
  (size: number, u: string) => (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={`bg8-${u}`} cx="0.3" cy="0.25" r="0.95">
          <stop offset="0%" stopColor="oklch(38% 0.08 75)" />
          <stop offset="60%" stopColor="oklch(22% 0.04 65)" />
          <stop offset="100%" stopColor="oklch(15% 0.02 60)" />
        </radialGradient>
        <linearGradient id={`gold8-${u}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="oklch(92% 0.18 88)" />
          <stop offset="50%" stopColor="oklch(78% 0.2 75)" />
          <stop offset="100%" stopColor="oklch(58% 0.2 65)" />
        </linearGradient>
        <linearGradient id={`goldDeep8-${u}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(80% 0.2 78)" />
          <stop offset="100%" stopColor="oklch(48% 0.18 65)" />
        </linearGradient>
        <radialGradient id={`broth8-${u}`} cx="0.5" cy="0.4" r="0.7">
          <stop offset="0%" stopColor="oklch(82% 0.15 70)" />
          <stop offset="100%" stopColor="oklch(60% 0.16 60)" />
        </radialGradient>
        <radialGradient id={`egg8-${u}`} cx="0.4" cy="0.35" r="0.7">
          <stop offset="0%" stopColor="oklch(94% 0.18 82)" />
          <stop offset="100%" stopColor="oklch(72% 0.2 70)" />
        </radialGradient>
      </defs>
      {/* fundo + moldura dourada */}
      <circle cx="40" cy="40" r="40" fill={`url(#bg8-${u})`} />
      <circle cx="40" cy="40" r="38" fill="none" stroke={`url(#gold8-${u})`} strokeWidth="1.4" opacity="0.95" />
      <circle cx="40" cy="40" r="36" fill="none" stroke="oklch(88% 0.16 82)" strokeWidth="0.4" opacity="0.55" />
      {/* sparkles ao redor */}
      <g opacity="0.92">
        <path d="M14 18 L15 21 L18 22 L15 23 L14 26 L13 23 L10 22 L13 21 Z" fill="oklch(94% 0.16 85)" />
        <path d="M66 16 L66.5 18 L68.5 18.5 L66.5 19 L66 21 L65.5 19 L63.5 18.5 L65.5 18 Z" fill="oklch(94% 0.16 85)" opacity="0.85" />
        <path d="M14 60 L14.5 62 L16.5 62.5 L14.5 63 L14 65 L13.5 63 L11.5 62.5 L13.5 62 Z" fill="oklch(94% 0.16 85)" opacity="0.8" />
        <path d="M66 60 L66.5 62 L68.5 62.5 L66.5 63 L66 65 L65.5 63 L63.5 62.5 L65.5 62 Z" fill="oklch(94% 0.16 85)" opacity="0.8" />
      </g>
      {/* steam */}
      <path d="M28 24 Q26 18 28 8" stroke="oklch(94% 0.02 260)" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" />
      <path d="M40 22 Q38 14 40 4" stroke="oklch(94% 0.02 260)" strokeWidth="2.4" strokeLinecap="round" fill="none" opacity="0.65" />
      <path d="M52 24 Q50 18 52 8" stroke="oklch(94% 0.02 260)" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" />
      {/* bowl dourado */}
      <path d="M14 40 Q14 66 40 66 Q66 66 66 40 Z" fill={`url(#goldDeep8-${u})`} />
      {/* highlights nas laterais do bowl pra dar profundidade */}
      <path d="M18 44 Q20 56 26 64" stroke="oklch(96% 0.14 85)" strokeWidth="2" fill="none" opacity="0.45" strokeLinecap="round" />
      <path d="M62 44 Q60 56 54 64" stroke="oklch(40% 0.1 60)" strokeWidth="1.5" fill="none" opacity="0.4" strokeLinecap="round" />
      {/* rim dourado claro */}
      <ellipse cx="40" cy="40" rx="26" ry="6.5" fill={`url(#gold8-${u})`} />
      <ellipse cx="40" cy="38.8" rx="22" ry="2" fill="oklch(97% 0.12 85)" opacity="0.55" />
      {/* broth */}
      <ellipse cx="40" cy="40" rx="24" ry="5.5" fill={`url(#broth8-${u})`} />
      {/* thick udon noodles */}
      <path d="M20 38 Q26 32 32 38 Q38 44 44 38 Q50 32 60 38" stroke="oklch(98% 0.02 90)" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M18 42 Q24 36 30 42 Q36 48 42 42 Q48 36 62 42" stroke="oklch(94% 0.04 90)" strokeWidth="3.4" strokeLinecap="round" fill="none" opacity="0.85" />
      <path d="M22 35 Q28 30 34 35 Q40 40 46 35" stroke="oklch(99% 0.02 90)" strokeWidth="2.4" strokeLinecap="round" fill="none" opacity="0.7" />
      {/* egg com gema brilhante */}
      <ellipse cx="52" cy="36" rx="7" ry="5.5" fill="oklch(99% 0.01 90)" />
      <ellipse cx="52" cy="36" rx="4" ry="3.5" fill={`url(#egg8-${u})`} />
      <ellipse cx="51" cy="35" rx="1.5" ry="1" fill="oklch(96% 0.13 85)" opacity="0.85" />
      {/* naruto com espiral */}
      <circle cx="28" cy="37" r="5" fill="oklch(98% 0.02 90)" />
      <path d="M26 37 Q26 35 28 35 Q30 35 30 37 Q30 39 28 39 Q27 39 27 38" stroke="oklch(80% 0.18 355)" strokeWidth="1.2" fill="none" />
      <circle cx="28" cy="37" r="5" fill="none" stroke="oklch(80% 0.18 355)" strokeWidth="0.4" opacity="0.5" />
      {/* spring onions */}
      <circle cx="36" cy="41" r="1.4" fill="oklch(70% 0.2 145)" />
      <circle cx="44" cy="40" r="1.4" fill="oklch(70% 0.2 145)" />
      <circle cx="32" cy="44" r="1.2" fill="oklch(68% 0.2 145)" />
      <circle cx="48" cy="44" r="1.2" fill="oklch(68% 0.2 145)" />
      {/* nori strip */}
      <rect x="38" y="33" width="3.5" height="8" fill="oklch(25% 0.12 160)" />
      <rect x="38" y="33" width="3.5" height="1" fill="oklch(38% 0.15 160)" opacity="0.7" />
      {/* eyes com estrelas premium */}
      <circle cx="34" cy="52" r="3" fill="white" />
      <circle cx="46" cy="52" r="3" fill="white" />
      <circle cx="34.6" cy="52.6" r="1.5" fill="oklch(18% 0.02 260)" />
      <circle cx="46.6" cy="52.6" r="1.5" fill="oklch(18% 0.02 260)" />
      <path d="M34.4 51.4 L34.7 52 L35.3 52.2 L34.7 52.4 L34.4 53 L34.1 52.4 L33.5 52.2 L34.1 52 Z" fill="white" />
      <path d="M46.4 51.4 L46.7 52 L47.3 52.2 L46.7 52.4 L46.4 53 L46.1 52.4 L45.5 52.2 L46.1 52 Z" fill="white" />
      <ellipse cx="29" cy="56" rx="2.5" ry="1.3" fill="oklch(75% 0.18 15)" opacity="0.65" />
      <ellipse cx="51" cy="56" rx="2.5" ry="1.3" fill="oklch(75% 0.18 15)" opacity="0.65" />
      <path d="M36 57 Q40 60 44 57" stroke="oklch(20% 0.02 260)" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  ),

  // 9 — Yokai (mascara oni vermelha) — 30 diamantes
  (size: number, u: string) => (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={`bg9-${u}`} cx="0.3" cy="0.25" r="0.9">
          <stop offset="0%" stopColor="oklch(30% 0.05 25)" />
          <stop offset="100%" stopColor="oklch(15% 0.04 25)" />
        </radialGradient>
        <linearGradient id={`mask9-${u}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(72% 0.22 25)" />
          <stop offset="100%" stopColor="oklch(48% 0.22 25)" />
        </linearGradient>
      </defs>
      <circle cx="40" cy="40" r="40" fill={`url(#bg9-${u})`} />
      {/* face shape */}
      <path d="M22 28 Q22 18 28 16 Q30 14 32 16 Q40 14 48 16 Q50 14 52 16 Q58 18 58 28 L58 50 Q58 64 40 66 Q22 64 22 50 Z" fill={`url(#mask9-${u})`} />
      {/* horns */}
      <path d="M28 16 L24 8 L30 14 Z" fill="oklch(85% 0.05 60)" />
      <path d="M52 16 L56 8 L50 14 Z" fill="oklch(85% 0.05 60)" />
      {/* hair tuft top */}
      <path d="M30 16 Q35 12 40 14 Q45 12 50 16 Q45 18 40 17 Q35 18 30 16 Z" fill="oklch(20% 0.02 25)" />
      {/* eyebrows angry */}
      <path d="M28 32 L35 30 L34 33 Z" fill="oklch(15% 0.02 25)" />
      <path d="M52 32 L45 30 L46 33 Z" fill="oklch(15% 0.02 25)" />
      {/* eyes */}
      <ellipse cx="32" cy="38" rx="3.2" ry="3" fill="oklch(98% 0.08 80)" />
      <ellipse cx="48" cy="38" rx="3.2" ry="3" fill="oklch(98% 0.08 80)" />
      <circle cx="32" cy="38" r="1.5" fill="oklch(18% 0.02 25)" />
      <circle cx="48" cy="38" r="1.5" fill="oklch(18% 0.02 25)" />
      {/* fangs / mouth */}
      <path d="M30 50 Q40 56 50 50 Q47 54 40 55 Q33 54 30 50 Z" fill="oklch(15% 0.02 25)" />
      <path d="M35 52 L36 56 L37 52 Z" fill="white" />
      <path d="M43 52 L44 56 L45 52 Z" fill="white" />
      {/* tattoo dots */}
      <circle cx="40" cy="26" r="1" fill="oklch(98% 0.1 80)" />
    </svg>
  ),

  // 10 — Kitsune (raposa branca de 9 caudas) — 30 diamantes
  (size: number, u: string) => (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={`bg10-${u}`} cx="0.3" cy="0.25" r="0.9">
          <stop offset="0%" stopColor="oklch(30% 0.04 280)" />
          <stop offset="100%" stopColor="oklch(15% 0.03 280)" />
        </radialGradient>
        <linearGradient id={`fur10-${u}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(98% 0.02 60)" />
          <stop offset="100%" stopColor="oklch(82% 0.05 60)" />
        </linearGradient>
      </defs>
      <circle cx="40" cy="40" r="40" fill={`url(#bg10-${u})`} />
      {/* tails fanning behind (9 stylized) */}
      <g opacity="0.85">
        <path d="M20 50 Q12 38 18 28" stroke="oklch(96% 0.04 60)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M14 46 Q8 36 16 24" stroke="oklch(96% 0.04 60)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M22 56 Q14 48 14 38" stroke="oklch(96% 0.04 60)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M60 50 Q68 38 62 28" stroke="oklch(96% 0.04 60)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M66 46 Q72 36 64 24" stroke="oklch(96% 0.04 60)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M58 56 Q66 48 66 38" stroke="oklch(96% 0.04 60)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M30 62 Q22 56 18 48" stroke="oklch(96% 0.04 60)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M50 62 Q58 56 62 48" stroke="oklch(96% 0.04 60)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M40 64 L40 58" stroke="oklch(96% 0.04 60)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </g>
      {/* face */}
      <path d="M26 30 Q26 22 32 20 Q40 18 48 20 Q54 22 54 30 L54 46 Q50 56 40 58 Q30 56 26 46 Z" fill={`url(#fur10-${u})`} />
      {/* ears */}
      <path d="M26 28 L22 18 L32 24 Z" fill={`url(#fur10-${u})`} stroke="oklch(60% 0.15 25)" strokeWidth="0.5" />
      <path d="M54 28 L58 18 L48 24 Z" fill={`url(#fur10-${u})`} stroke="oklch(60% 0.15 25)" strokeWidth="0.5" />
      <path d="M27 26 L24 21 L29 24 Z" fill="oklch(70% 0.16 25)" />
      <path d="M53 26 L56 21 L51 24 Z" fill="oklch(70% 0.16 25)" />
      {/* eyes */}
      <ellipse cx="33" cy="36" rx="2.8" ry="3.2" fill="oklch(72% 0.18 65)" />
      <ellipse cx="47" cy="36" rx="2.8" ry="3.2" fill="oklch(72% 0.18 65)" />
      <ellipse cx="33" cy="36" rx="1" ry="2.5" fill="oklch(15% 0.02 280)" />
      <ellipse cx="47" cy="36" rx="1" ry="2.5" fill="oklch(15% 0.02 280)" />
      <circle cx="33.5" cy="35" r="0.7" fill="white" />
      <circle cx="47.5" cy="35" r="0.7" fill="white" />
      {/* nose */}
      <path d="M40 44 L38 46 L42 46 Z" fill="oklch(50% 0.12 25)" />
      {/* mouth */}
      <path d="M38 48 Q40 50 42 48" stroke="oklch(20% 0.02 280)" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      {/* whiskers */}
      <path d="M28 44 L20 42" stroke="oklch(70% 0.05 280)" strokeWidth="0.5" opacity="0.6" />
      <path d="M28 46 L20 48" stroke="oklch(70% 0.05 280)" strokeWidth="0.5" opacity="0.6" />
      <path d="M52 44 L60 42" stroke="oklch(70% 0.05 280)" strokeWidth="0.5" opacity="0.6" />
      <path d="M52 46 L60 48" stroke="oklch(70% 0.05 280)" strokeWidth="0.5" opacity="0.6" />
    </svg>
  ),

  // 11 — Tanuki (texugo japones) — 30 diamantes
  (size: number, u: string) => (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={`bg11-${u}`} cx="0.3" cy="0.25" r="0.9">
          <stop offset="0%" stopColor="oklch(30% 0.04 80)" />
          <stop offset="100%" stopColor="oklch(15% 0.03 80)" />
        </radialGradient>
        <linearGradient id={`fur11-${u}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(60% 0.06 60)" />
          <stop offset="100%" stopColor="oklch(38% 0.07 50)" />
        </linearGradient>
      </defs>
      <circle cx="40" cy="40" r="40" fill={`url(#bg11-${u})`} />
      {/* leaf on head */}
      <path d="M38 12 Q34 6 30 10 Q34 14 40 14 Q46 14 50 10 Q46 6 42 12 L40 18 Z" fill="oklch(55% 0.18 145)" />
      <path d="M40 14 L40 20" stroke="oklch(45% 0.15 145)" strokeWidth="0.6" />
      {/* face round */}
      <ellipse cx="40" cy="44" rx="22" ry="20" fill={`url(#fur11-${u})`} />
      {/* ears */}
      <path d="M22 32 L18 22 L28 28 Z" fill={`url(#fur11-${u})`} />
      <path d="M58 32 L62 22 L52 28 Z" fill={`url(#fur11-${u})`} />
      <path d="M22 30 L20 24 L26 28 Z" fill="oklch(80% 0.06 50)" />
      <path d="M58 30 L60 24 L54 28 Z" fill="oklch(80% 0.06 50)" />
      {/* belly cream */}
      <ellipse cx="40" cy="52" rx="12" ry="8" fill="oklch(85% 0.06 60)" />
      {/* face mask (dark band over eyes) */}
      <path d="M22 38 Q30 32 40 32 Q50 32 58 38 Q58 46 50 46 Q40 48 30 46 Q22 46 22 38 Z" fill="oklch(22% 0.04 60)" opacity="0.85" />
      {/* eyes */}
      <circle cx="33" cy="40" r="2.6" fill="white" />
      <circle cx="47" cy="40" r="2.6" fill="white" />
      <circle cx="33.4" cy="40.4" r="1.3" fill="oklch(18% 0.02 60)" />
      <circle cx="47.4" cy="40.4" r="1.3" fill="oklch(18% 0.02 60)" />
      <circle cx="33.8" cy="39.6" r="0.6" fill="white" />
      <circle cx="47.8" cy="39.6" r="0.6" fill="white" />
      {/* nose */}
      <ellipse cx="40" cy="46" rx="2" ry="1.5" fill="oklch(20% 0.02 60)" />
      {/* mouth */}
      <path d="M37 50 Q40 53 43 50" stroke="oklch(20% 0.02 260)" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      {/* blush */}
      <ellipse cx="28" cy="48" rx="2.5" ry="1.3" fill="oklch(75% 0.18 15)" opacity="0.6" />
      <ellipse cx="52" cy="48" rx="2.5" ry="1.3" fill="oklch(75% 0.18 15)" opacity="0.6" />
    </svg>
  ),

  // 12 — Geisha (perfil com leque) — 80 diamantes
  (size: number, u: string) => (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={`bg12-${u}`} cx="0.3" cy="0.25" r="0.9">
          <stop offset="0%" stopColor="oklch(30% 0.04 350)" />
          <stop offset="100%" stopColor="oklch(15% 0.03 350)" />
        </radialGradient>
        <linearGradient id={`skin12-${u}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(96% 0.03 50)" />
          <stop offset="100%" stopColor="oklch(88% 0.04 45)" />
        </linearGradient>
        <linearGradient id={`hair12-${u}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(22% 0.03 280)" />
          <stop offset="100%" stopColor="oklch(10% 0.02 280)" />
        </linearGradient>
        <linearGradient id={`fan12-${u}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="oklch(85% 0.15 15)" />
          <stop offset="100%" stopColor="oklch(60% 0.2 15)" />
        </linearGradient>
      </defs>
      <circle cx="40" cy="40" r="40" fill={`url(#bg12-${u})`} />
      {/* fan behind */}
      <path d="M52 18 L72 32 L72 38 L46 26 Z" fill={`url(#fan12-${u})`} />
      <path d="M58 22 L70 30" stroke="oklch(40% 0.15 15)" strokeWidth="0.6" />
      <path d="M62 25 L70 32" stroke="oklch(40% 0.15 15)" strokeWidth="0.6" />
      <path d="M66 28 L70 34" stroke="oklch(40% 0.15 15)" strokeWidth="0.6" />
      {/* hair back */}
      <path d="M18 32 Q18 22 28 18 Q40 14 50 20 Q56 24 56 36 L56 60 Q50 64 40 64 Q30 64 24 60 Q18 56 18 50 Z" fill={`url(#hair12-${u})`} />
      {/* hair ornament (kanzashi) */}
      <circle cx="50" cy="22" r="2.2" fill="oklch(85% 0.18 15)" />
      <path d="M50 22 L50 16" stroke="oklch(85% 0.05 80)" strokeWidth="0.8" />
      <circle cx="50" cy="15" r="1.2" fill="oklch(85% 0.18 80)" />
      {/* face (3/4 profile) */}
      <path d="M30 36 Q30 28 36 26 Q44 26 48 32 Q50 38 48 46 Q46 54 40 56 Q34 56 32 52 Q30 46 30 36 Z" fill={`url(#skin12-${u})`} />
      {/* hair front bang */}
      <path d="M32 30 Q36 26 42 28 L40 32 Q36 30 32 32 Z" fill={`url(#hair12-${u})`} />
      {/* eye (one visible from 3/4) */}
      <path d="M38 38 Q40 36 42 38 Q40 40 38 38 Z" fill="oklch(20% 0.02 280)" />
      <path d="M37 36 Q40 34 43 36" stroke="oklch(20% 0.02 280)" strokeWidth="0.8" fill="none" />
      {/* blush */}
      <ellipse cx="34" cy="44" rx="2" ry="1.2" fill="oklch(75% 0.18 15)" opacity="0.55" />
      {/* lips */}
      <path d="M38 46 Q40 47 42 46" stroke="oklch(55% 0.22 15)" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      {/* kimono collar */}
      <path d="M22 62 L40 56 L58 62 L58 70 L22 70 Z" fill="oklch(60% 0.18 350)" />
      <path d="M40 56 L40 70" stroke="oklch(98% 0.02 60)" strokeWidth="1.4" />
    </svg>
  ),

  // 13 — Samurai (capacete kabuto com chifres) — 80 diamantes
  (size: number, u: string) => (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={`bg13-${u}`} cx="0.3" cy="0.25" r="0.9">
          <stop offset="0%" stopColor="oklch(28% 0.04 250)" />
          <stop offset="100%" stopColor="oklch(13% 0.03 250)" />
        </radialGradient>
        <linearGradient id={`helm13-${u}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(40% 0.06 250)" />
          <stop offset="100%" stopColor="oklch(22% 0.04 250)" />
        </linearGradient>
        <linearGradient id={`gold13-${u}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="oklch(92% 0.16 85)" />
          <stop offset="100%" stopColor="oklch(60% 0.18 65)" />
        </linearGradient>
      </defs>
      <circle cx="40" cy="40" r="40" fill={`url(#bg13-${u})`} />
      {/* helmet dome */}
      <path d="M22 36 Q22 18 40 18 Q58 18 58 36 L58 46 L22 46 Z" fill={`url(#helm13-${u})`} />
      {/* gold front plate */}
      <path d="M30 22 Q40 18 50 22 Q52 28 50 32 Q40 30 30 32 Q28 28 30 22 Z" fill={`url(#gold13-${u})`} />
      {/* central diamond ornament */}
      <path d="M40 22 L43 26 L40 30 L37 26 Z" fill="oklch(28% 0.05 250)" />
      {/* horns (kuwagata) */}
      <path d="M22 26 Q14 18 12 8 Q18 18 24 22 Z" fill={`url(#gold13-${u})`} stroke="oklch(40% 0.1 60)" strokeWidth="0.6" />
      <path d="M58 26 Q66 18 68 8 Q62 18 56 22 Z" fill={`url(#gold13-${u})`} stroke="oklch(40% 0.1 60)" strokeWidth="0.6" />
      {/* side plates (fukigaeshi) */}
      <path d="M18 36 L14 50 Q22 50 24 46 Z" fill={`url(#helm13-${u})`} />
      <path d="M62 36 L66 50 Q58 50 56 46 Z" fill={`url(#helm13-${u})`} />
      <path d="M16 38 L18 46" stroke="oklch(85% 0.18 80)" strokeWidth="1" />
      <path d="M64 38 L62 46" stroke="oklch(85% 0.18 80)" strokeWidth="1" />
      {/* face (menpou — mascara facial) */}
      <path d="M28 44 Q28 56 40 60 Q52 56 52 44 L52 52 Q48 58 40 60 Q32 58 28 52 Z" fill="oklch(30% 0.05 30)" />
      {/* eyes peeking */}
      <rect x="30" y="40" width="6" height="3" rx="1" fill="oklch(15% 0.02 250)" />
      <rect x="44" y="40" width="6" height="3" rx="1" fill="oklch(15% 0.02 250)" />
      <circle cx="33" cy="41.5" r="0.8" fill="oklch(95% 0.1 60)" />
      <circle cx="47" cy="41.5" r="0.8" fill="oklch(95% 0.1 60)" />
      {/* neck guard layers (shikoro) */}
      <path d="M24 56 Q40 64 56 56 L56 68 Q40 72 24 68 Z" fill={`url(#helm13-${u})`} />
      <path d="M26 60 Q40 66 54 60" stroke="oklch(85% 0.18 80)" strokeWidth="0.8" opacity="0.7" />
      <path d="M28 64 Q40 70 52 64" stroke="oklch(85% 0.18 80)" strokeWidth="0.8" opacity="0.7" />
    </svg>
  ),

  // 14 — Dragao Dourado — 300 diamantes (TOP TIER)
  (size: number, u: string) => (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={`bg14-${u}`} cx="0.3" cy="0.25" r="0.95">
          <stop offset="0%" stopColor="oklch(40% 0.1 30)" />
          <stop offset="60%" stopColor="oklch(20% 0.05 30)" />
          <stop offset="100%" stopColor="oklch(12% 0.03 30)" />
        </radialGradient>
        <linearGradient id={`dragGold14-${u}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="oklch(96% 0.18 88)" />
          <stop offset="40%" stopColor="oklch(80% 0.22 75)" />
          <stop offset="100%" stopColor="oklch(50% 0.2 60)" />
        </linearGradient>
        <linearGradient id={`scale14-${u}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(86% 0.2 80)" />
          <stop offset="100%" stopColor="oklch(58% 0.22 65)" />
        </linearGradient>
      </defs>
      <circle cx="40" cy="40" r="40" fill={`url(#bg14-${u})`} />
      {/* outer gold ring */}
      <circle cx="40" cy="40" r="38" fill="none" stroke={`url(#dragGold14-${u})`} strokeWidth="1.4" opacity="0.9" />
      {/* sparkles */}
      <g opacity="0.9">
        <path d="M14 18 L15 21 L18 22 L15 23 L14 26 L13 23 L10 22 L13 21 Z" fill="oklch(94% 0.18 85)" />
        <path d="M66 16 L66.5 18 L68.5 18.5 L66.5 19 L66 21 L65.5 19 L63.5 18.5 L65.5 18 Z" fill="oklch(94% 0.18 85)" opacity="0.85" />
        <path d="M14 60 L14.5 62 L16.5 62.5 L14.5 63 L14 65 L13.5 63 L11.5 62.5 L13.5 62 Z" fill="oklch(94% 0.18 85)" opacity="0.8" />
        <path d="M66 60 L66.5 62 L68.5 62.5 L66.5 63 L66 65 L65.5 63 L63.5 62.5 L65.5 62 Z" fill="oklch(94% 0.18 85)" opacity="0.8" />
      </g>
      {/* dragon head — top-down view */}
      <path d="M26 30 Q28 18 40 16 Q52 18 54 30 Q56 40 50 48 Q40 56 30 48 Q24 40 26 30 Z" fill={`url(#scale14-${u})`} />
      {/* horns */}
      <path d="M26 26 Q20 16 24 8 Q26 18 30 22 Z" fill={`url(#dragGold14-${u})`} stroke="oklch(40% 0.15 60)" strokeWidth="0.5" />
      <path d="M54 26 Q60 16 56 8 Q54 18 50 22 Z" fill={`url(#dragGold14-${u})`} stroke="oklch(40% 0.15 60)" strokeWidth="0.5" />
      {/* whiskers / barbels */}
      <path d="M28 44 Q22 50 18 60" stroke={`url(#dragGold14-${u})`} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M52 44 Q58 50 62 60" stroke={`url(#dragGold14-${u})`} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* nostrils */}
      <circle cx="36" cy="38" r="1" fill="oklch(30% 0.1 30)" />
      <circle cx="44" cy="38" r="1" fill="oklch(30% 0.1 30)" />
      {/* eyes with star sparkle */}
      <ellipse cx="33" cy="32" rx="3.5" ry="3" fill="oklch(28% 0.05 30)" />
      <ellipse cx="47" cy="32" rx="3.5" ry="3" fill="oklch(28% 0.05 30)" />
      <ellipse cx="33" cy="32" rx="2.2" ry="2" fill="oklch(72% 0.22 30)" />
      <ellipse cx="47" cy="32" rx="2.2" ry="2" fill="oklch(72% 0.22 30)" />
      <circle cx="33" cy="32" r="1" fill="oklch(15% 0.02 30)" />
      <circle cx="47" cy="32" r="1" fill="oklch(15% 0.02 30)" />
      <path d="M33 31 L33.3 31.6 L34 31.8 L33.3 32 L33 32.6 L32.7 32 L32 31.8 L32.7 31.6 Z" fill="white" />
      <path d="M47 31 L47.3 31.6 L48 31.8 L47.3 32 L47 32.6 L46.7 32 L46 31.8 L46.7 31.6 Z" fill="white" />
      {/* scale details on top of head */}
      <circle cx="35" cy="24" r="1" fill="oklch(96% 0.18 80)" opacity="0.6" />
      <circle cx="40" cy="22" r="1.2" fill="oklch(96% 0.18 80)" opacity="0.7" />
      <circle cx="45" cy="24" r="1" fill="oklch(96% 0.18 80)" opacity="0.6" />
      {/* mouth fang slightly visible */}
      <path d="M34 48 Q40 54 46 48 L44 50 L42 49 L40 51 L38 49 L36 50 Z" fill="oklch(25% 0.04 30)" />
      <path d="M37 50 L38 53 L39 50 Z" fill="white" />
      <path d="M41 50 L42 53 L43 50 Z" fill="white" />
    </svg>
  ),
];

// Avatar 15 — Ninja. SVG vetorial autoral (preto e branco): capuz,
// mascara, olhos e faixa. Sem asset externo.
AVATARS.push((size: number, u: string) => (
  <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id={`bg15-${u}`} cx="0.3" cy="0.25" r="0.9">
        <stop offset="0%" stopColor="oklch(34% 0 0)" />
        <stop offset="100%" stopColor="oklch(14% 0 0)" />
      </radialGradient>
      <clipPath id={`clip15-${u}`}>
        <circle cx="40" cy="40" r="40" />
      </clipPath>
    </defs>
    <circle cx="40" cy="40" r="40" fill={`url(#bg15-${u})`} />
    <g clipPath={`url(#clip15-${u})`}>
      {/* Ombros / busto do ninja */}
      <path d="M16 80 V70 C16 56 27 48 40 48 C53 48 64 56 64 70 V80 Z" fill="oklch(20% 0 0)" />
      {/* Cabeca encapuzada */}
      <path d="M40 14 C53 14 60 25 60 38 C60 50 51 58 40 58 C29 58 20 50 20 38 C20 25 27 14 40 14 Z" fill="oklch(17% 0 0)" />
      {/* Faixa da mascara (tira horizontal clara) */}
      <path d="M21 33 C28 30 52 30 59 33 L59 43 C52 46 28 46 21 43 Z" fill="oklch(94% 0 0)" />
      {/* Recorte dos olhos (escuro dentro da faixa) */}
      <path d="M23 35 C30 33 50 33 57 35 L57 41 C50 43 30 43 23 41 Z" fill="oklch(12% 0 0)" />
      {/* Olhos */}
      <path d="M28 36 L37 38 L34 41 L28 40 Z" fill="oklch(96% 0 0)" />
      <path d="M52 36 L43 38 L46 41 L52 40 Z" fill="oklch(96% 0 0)" />
      {/* Pontas da faixa esvoacando atras */}
      <path d="M58 36 C66 35 70 40 72 48 C66 46 61 44 58 42 Z" fill="oklch(88% 0 0)" />
      <path d="M58 42 C64 44 67 50 67 57 C62 53 59 48 57 44 Z" fill="oklch(80% 0 0)" />
      {/* Brilho sutil no topo do capuz */}
      <path d="M34 17 C38 15 45 15 50 19 C46 18 39 18 34 21 Z" fill="oklch(30% 0 0)" />
    </g>
  </svg>
));

export const AVATAR_NAMES = ['Temaki', 'Ramen', 'Onigiri', 'Gyoza', 'Sashimi', 'Takoyaki', 'Miso', 'Udon', 'Udon Gold', 'Yokai', 'Kitsune', 'Tanuki', 'Geisha', 'Samurai', 'Dragão Dourado', 'Ninja'];

export function AvatarImage({ index, size = 80, className }: AvatarProps) {
  // useId garante sufixo unico por instancia. Sem isso, varios avatares com
  // mesmo `index` na mesma tela colidem nos IDs dos <defs> e o browser usa
  // so o primeiro — os outros perdem fundo/gradientes.
  const rawId = useId();
  const uid = rawId.replace(/:/g, '');
  const render = AVATARS[index % AVATARS.length];
  return <span className={className}>{render(size, uid)}</span>;
}

export function avatarCount() {
  return AVATARS.length;
}

interface AvatarWithBorderProps {
  index: number;
  level: number;
  size?: number;
  className?: string;
}

export function AvatarWithBorder({ index, level, size = 80, className }: AvatarWithBorderProps) {
  const innerSize = size - 4; // 2px padding each side
  return (
    <LevelBorder level={level} size={size}>
      <AvatarImage index={index} size={innerSize} className={className} />
    </LevelBorder>
  );
}
