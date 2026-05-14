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
  (size: number) => (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bg0" cx="0.3" cy="0.25" r="0.9">
          <stop offset="0%" stopColor="oklch(30% 0.03 260)" />
          <stop offset="100%" stopColor="oklch(18% 0.02 260)" />
        </radialGradient>
        <linearGradient id="nori0" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(40% 0.13 160)" />
          <stop offset="100%" stopColor="oklch(22% 0.1 160)" />
        </linearGradient>
        <linearGradient id="rice0" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(98% 0.02 90)" />
          <stop offset="100%" stopColor="oklch(88% 0.04 85)" />
        </linearGradient>
        <linearGradient id="salmon0" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(82% 0.2 32)" />
          <stop offset="100%" stopColor="oklch(64% 0.2 28)" />
        </linearGradient>
      </defs>
      <circle cx="40" cy="40" r="40" fill="url(#bg0)" />
      {/* nori cone, with subtle texture */}
      <path d="M27 21 L53 21 L40 64 Z" fill="url(#nori0)" />
      <path d="M27 21 L40 64 L35 64 L25 24 Z" fill="oklch(20% 0.08 160)" opacity="0.45" />
      {/* nori speckles */}
      <circle cx="33" cy="36" r="0.7" fill="oklch(50% 0.1 160)" opacity="0.7" />
      <circle cx="42" cy="46" r="0.6" fill="oklch(50% 0.1 160)" opacity="0.7" />
      <circle cx="38" cy="55" r="0.6" fill="oklch(50% 0.1 160)" opacity="0.7" />
      {/* rice with shadow */}
      <ellipse cx="40" cy="24" rx="13" ry="6.5" fill="url(#rice0)" />
      <ellipse cx="40" cy="22.5" rx="11" ry="2.5" fill="oklch(99% 0.01 90)" opacity="0.7" />
      {/* salmon + avocado fillings */}
      <ellipse cx="36" cy="22" rx="6" ry="3" fill="url(#salmon0)" />
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
  (size: number) => (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bg1" cx="0.3" cy="0.25" r="0.9">
          <stop offset="0%" stopColor="oklch(30% 0.03 260)" />
          <stop offset="100%" stopColor="oklch(18% 0.02 260)" />
        </radialGradient>
        <linearGradient id="bowl1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(82% 0.13 55)" />
          <stop offset="100%" stopColor="oklch(55% 0.13 45)" />
        </linearGradient>
        <radialGradient id="broth1" cx="0.5" cy="0.4" r="0.7">
          <stop offset="0%" stopColor="oklch(80% 0.15 70)" />
          <stop offset="100%" stopColor="oklch(60% 0.16 60)" />
        </radialGradient>
      </defs>
      <circle cx="40" cy="40" r="40" fill="url(#bg1)" />
      {/* steam */}
      <path d="M28 22 Q26 16 28 10" stroke="oklch(90% 0.02 260)" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.45" />
      <path d="M40 20 Q38 14 40 8" stroke="oklch(90% 0.02 260)" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5" />
      <path d="M52 22 Q50 16 52 10" stroke="oklch(90% 0.02 260)" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.45" />
      {/* bowl */}
      <path d="M16 38 Q16 62 40 62 Q64 62 64 38 Z" fill="url(#bowl1)" />
      <path d="M16 38 Q16 62 40 62 Q64 62 64 38 Z" fill="oklch(50% 0.1 50)" opacity="0.18" />
      {/* rim */}
      <ellipse cx="40" cy="38" rx="24" ry="5.5" fill="oklch(88% 0.12 55)" />
      {/* broth */}
      <ellipse cx="40" cy="38" rx="22" ry="4.5" fill="url(#broth1)" />
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
  (size: number) => (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bg2" cx="0.3" cy="0.25" r="0.9">
          <stop offset="0%" stopColor="oklch(30% 0.03 260)" />
          <stop offset="100%" stopColor="oklch(18% 0.02 260)" />
        </radialGradient>
        <linearGradient id="rice2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(98% 0.02 90)" />
          <stop offset="100%" stopColor="oklch(86% 0.04 85)" />
        </linearGradient>
      </defs>
      <circle cx="40" cy="40" r="40" fill="url(#bg2)" />
      {/* nori band */}
      <rect x="24" y="50" width="32" height="12" rx="3" fill="oklch(26% 0.1 160)" />
      <rect x="24" y="50" width="32" height="2.5" rx="1.5" fill="oklch(18% 0.08 160)" opacity="0.7" />
      {/* rice body */}
      <path d="M40 12 Q57 30 60 54 Q40 58 20 54 Q23 30 40 12 Z" fill="url(#rice2)" />
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
  (size: number) => (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bg3" cx="0.3" cy="0.25" r="0.9">
          <stop offset="0%" stopColor="oklch(30% 0.03 260)" />
          <stop offset="100%" stopColor="oklch(18% 0.02 260)" />
        </radialGradient>
        <linearGradient id="gyoza3" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(92% 0.07 75)" />
          <stop offset="100%" stopColor="oklch(72% 0.12 65)" />
        </linearGradient>
        <linearGradient id="crispy3" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(72% 0.14 55)" />
          <stop offset="100%" stopColor="oklch(50% 0.14 40)" />
        </linearGradient>
      </defs>
      <circle cx="40" cy="40" r="40" fill="url(#bg3)" />
      {/* steam */}
      <path d="M30 28 Q28 22 30 16" stroke="oklch(90% 0.02 260)" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5" />
      <path d="M40 26 Q38 20 40 12" stroke="oklch(90% 0.02 260)" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.45" />
      <path d="M50 28 Q48 22 50 16" stroke="oklch(90% 0.02 260)" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5" />
      {/* body */}
      <ellipse cx="40" cy="46" rx="25" ry="14" fill="url(#gyoza3)" />
      {/* crispy bottom */}
      <ellipse cx="40" cy="56" rx="21" ry="5" fill="url(#crispy3)" />
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
  (size: number) => (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bg4" cx="0.3" cy="0.25" r="0.9">
          <stop offset="0%" stopColor="oklch(30% 0.03 260)" />
          <stop offset="100%" stopColor="oklch(18% 0.02 260)" />
        </radialGradient>
        <linearGradient id="rice4" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(98% 0.02 90)" />
          <stop offset="100%" stopColor="oklch(86% 0.04 80)" />
        </linearGradient>
        <linearGradient id="salmon4" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(82% 0.2 32)" />
          <stop offset="50%" stopColor="oklch(72% 0.2 30)" />
          <stop offset="100%" stopColor="oklch(58% 0.2 25)" />
        </linearGradient>
        <linearGradient id="wasabi4" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(75% 0.22 145)" />
          <stop offset="100%" stopColor="oklch(50% 0.22 145)" />
        </linearGradient>
      </defs>
      <circle cx="40" cy="40" r="40" fill="url(#bg4)" />
      {/* wood board */}
      <rect x="14" y="55" width="52" height="10" rx="2" fill="oklch(45% 0.06 60)" />
      <rect x="14" y="55" width="52" height="2" fill="oklch(55% 0.08 60)" opacity="0.7" />
      <line x1="20" y1="60" x2="60" y2="60" stroke="oklch(35% 0.05 60)" strokeWidth="0.5" opacity="0.6" />
      {/* rice base */}
      <ellipse cx="40" cy="54" rx="22" ry="10" fill="url(#rice4)" />
      <ellipse cx="40" cy="51" rx="18" ry="3" fill="white" opacity="0.4" />
      {/* nori strip */}
      <rect x="19" y="50" width="42" height="7" rx="2" fill="oklch(22% 0.1 160)" />
      <rect x="19" y="50" width="42" height="1.5" fill="oklch(35% 0.12 160)" opacity="0.6" />
      {/* salmon slice (big, marbled) */}
      <ellipse cx="40" cy="44" rx="20" ry="10" fill="url(#salmon4)" />
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
      <path d="M60 49 L57 45 L63 45 Z" fill="url(#wasabi4)" />
      <path d="M58.5 47 L60 45.5 L61.5 47 Z" fill="oklch(80% 0.15 145)" opacity="0.7" />
      {/* shoyu drop */}
      <ellipse cx="18" cy="62" rx="2" ry="1" fill="oklch(28% 0.06 30)" opacity="0.9" />
    </svg>
  ),

  // 5 — Takoyaki (20 moedas) — 3 bolas com sombras, sauce com brilho
  (size: number) => (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bg5" cx="0.3" cy="0.25" r="0.9">
          <stop offset="0%" stopColor="oklch(30% 0.03 260)" />
          <stop offset="100%" stopColor="oklch(18% 0.02 260)" />
        </radialGradient>
        <radialGradient id="tako5" cx="0.35" cy="0.3" r="0.8">
          <stop offset="0%" stopColor="oklch(82% 0.14 60)" />
          <stop offset="100%" stopColor="oklch(58% 0.16 45)" />
        </radialGradient>
        <radialGradient id="takoFront5" cx="0.35" cy="0.3" r="0.8">
          <stop offset="0%" stopColor="oklch(86% 0.14 60)" />
          <stop offset="100%" stopColor="oklch(62% 0.16 50)" />
        </radialGradient>
        <linearGradient id="sauce5" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(35% 0.1 25)" />
          <stop offset="100%" stopColor="oklch(20% 0.08 20)" />
        </linearGradient>
      </defs>
      <circle cx="40" cy="40" r="40" fill="url(#bg5)" />
      {/* tray rim */}
      <ellipse cx="40" cy="60" rx="30" ry="6" fill="oklch(28% 0.04 50)" opacity="0.7" />
      {/* back balls */}
      <circle cx="26" cy="48" r="12" fill="url(#tako5)" />
      <ellipse cx="23" cy="44" rx="4" ry="2" fill="white" opacity="0.25" />
      <circle cx="54" cy="48" r="12" fill="url(#tako5)" />
      <ellipse cx="51" cy="44" rx="4" ry="2" fill="white" opacity="0.25" />
      {/* front ball */}
      <circle cx="40" cy="38" r="14" fill="url(#takoFront5)" />
      <ellipse cx="36" cy="32" rx="5" ry="2.5" fill="white" opacity="0.3" />
      {/* sauce drizzle no topo (acima do rosto) */}
      <path d="M28 26 Q32 23 36 26 Q40 29 44 26 Q48 23 52 26" stroke="url(#sauce5)" strokeWidth="1.8" strokeLinecap="round" fill="none" />
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
  (size: number) => (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bg6" cx="0.3" cy="0.25" r="0.9">
          <stop offset="0%" stopColor="oklch(30% 0.03 260)" />
          <stop offset="100%" stopColor="oklch(18% 0.02 260)" />
        </radialGradient>
        <linearGradient id="bowl6" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(78% 0.12 55)" />
          <stop offset="50%" stopColor="oklch(60% 0.12 45)" />
          <stop offset="100%" stopColor="oklch(38% 0.1 35)" />
        </linearGradient>
        <radialGradient id="brothMiso6" cx="0.5" cy="0.4" r="0.7">
          <stop offset="0%" stopColor="oklch(76% 0.13 70)" />
          <stop offset="100%" stopColor="oklch(58% 0.13 60)" />
        </radialGradient>
      </defs>
      <circle cx="40" cy="40" r="40" fill="url(#bg6)" />
      {/* steam */}
      <path d="M28 22 Q26 16 28 8" stroke="oklch(90% 0.02 260)" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5" />
      <path d="M40 20 Q38 14 40 6" stroke="oklch(90% 0.02 260)" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.55" />
      <path d="M52 22 Q50 16 52 8" stroke="oklch(90% 0.02 260)" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5" />
      {/* bowl (sem padrao decorativo na faixa inferior — ficava embaixo da boca) */}
      <path d="M14 40 Q14 66 40 66 Q66 66 66 40 Z" fill="url(#bowl6)" />
      {/* rim */}
      <ellipse cx="40" cy="40" rx="26" ry="6.5" fill="oklch(85% 0.12 55)" />
      <ellipse cx="40" cy="38.8" rx="22" ry="2" fill="white" opacity="0.35" />
      {/* miso broth */}
      <ellipse cx="40" cy="40" rx="23" ry="5.5" fill="url(#brothMiso6)" />
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
  (size: number) => (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bg7" cx="0.3" cy="0.25" r="0.9">
          <stop offset="0%" stopColor="oklch(30% 0.03 260)" />
          <stop offset="100%" stopColor="oklch(18% 0.02 260)" />
        </radialGradient>
        <linearGradient id="bowl7" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(75% 0.1 50)" />
          <stop offset="100%" stopColor="oklch(50% 0.1 40)" />
        </linearGradient>
        <radialGradient id="broth7" cx="0.5" cy="0.4" r="0.7">
          <stop offset="0%" stopColor="oklch(80% 0.13 70)" />
          <stop offset="100%" stopColor="oklch(60% 0.14 60)" />
        </radialGradient>
        <radialGradient id="egg7" cx="0.4" cy="0.35" r="0.7">
          <stop offset="0%" stopColor="oklch(92% 0.18 80)" />
          <stop offset="100%" stopColor="oklch(72% 0.2 70)" />
        </radialGradient>
      </defs>
      <circle cx="40" cy="40" r="40" fill="url(#bg7)" />
      {/* steam */}
      <path d="M28 22 Q26 16 28 8" stroke="oklch(90% 0.02 260)" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5" />
      <path d="M40 20 Q38 14 40 6" stroke="oklch(90% 0.02 260)" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.55" />
      <path d="M52 22 Q50 16 52 8" stroke="oklch(90% 0.02 260)" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5" />
      {/* bowl */}
      <path d="M14 40 Q14 66 40 66 Q66 66 66 40 Z" fill="url(#bowl7)" />
      {/* rim */}
      <ellipse cx="40" cy="40" rx="26" ry="6.5" fill="oklch(82% 0.12 55)" />
      <ellipse cx="40" cy="38.8" rx="22" ry="2" fill="white" opacity="0.35" />
      {/* broth */}
      <ellipse cx="40" cy="40" rx="24" ry="5.5" fill="url(#broth7)" />
      {/* thick udon noodles */}
      <path d="M20 38 Q26 32 32 38 Q38 44 44 38 Q50 32 60 38" stroke="oklch(98% 0.02 90)" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M18 42 Q24 36 30 42 Q36 48 42 42 Q48 36 62 42" stroke="oklch(94% 0.04 90)" strokeWidth="3.4" strokeLinecap="round" fill="none" opacity="0.85" />
      <path d="M22 35 Q28 30 34 35 Q40 40 46 35" stroke="oklch(99% 0.02 90)" strokeWidth="2.4" strokeLinecap="round" fill="none" opacity="0.7" />
      {/* egg with golden yolk */}
      <ellipse cx="52" cy="36" rx="7" ry="5.5" fill="oklch(99% 0.01 90)" />
      <ellipse cx="52" cy="36" rx="4" ry="3.5" fill="url(#egg7)" />
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
  (size: number) => (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bg8" cx="0.3" cy="0.25" r="0.95">
          <stop offset="0%" stopColor="oklch(38% 0.08 75)" />
          <stop offset="60%" stopColor="oklch(22% 0.04 65)" />
          <stop offset="100%" stopColor="oklch(15% 0.02 60)" />
        </radialGradient>
        <linearGradient id="gold8" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="oklch(92% 0.18 88)" />
          <stop offset="50%" stopColor="oklch(78% 0.2 75)" />
          <stop offset="100%" stopColor="oklch(58% 0.2 65)" />
        </linearGradient>
        <linearGradient id="goldDeep8" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(80% 0.2 78)" />
          <stop offset="100%" stopColor="oklch(48% 0.18 65)" />
        </linearGradient>
        <radialGradient id="broth8" cx="0.5" cy="0.4" r="0.7">
          <stop offset="0%" stopColor="oklch(82% 0.15 70)" />
          <stop offset="100%" stopColor="oklch(60% 0.16 60)" />
        </radialGradient>
        <radialGradient id="egg8" cx="0.4" cy="0.35" r="0.7">
          <stop offset="0%" stopColor="oklch(94% 0.18 82)" />
          <stop offset="100%" stopColor="oklch(72% 0.2 70)" />
        </radialGradient>
      </defs>
      {/* fundo + moldura dourada */}
      <circle cx="40" cy="40" r="40" fill="url(#bg8)" />
      <circle cx="40" cy="40" r="38" fill="none" stroke="url(#gold8)" strokeWidth="1.4" opacity="0.95" />
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
      <path d="M14 40 Q14 66 40 66 Q66 66 66 40 Z" fill="url(#goldDeep8)" />
      {/* highlights nas laterais do bowl pra dar profundidade */}
      <path d="M18 44 Q20 56 26 64" stroke="oklch(96% 0.14 85)" strokeWidth="2" fill="none" opacity="0.45" strokeLinecap="round" />
      <path d="M62 44 Q60 56 54 64" stroke="oklch(40% 0.1 60)" strokeWidth="1.5" fill="none" opacity="0.4" strokeLinecap="round" />
      {/* rim dourado claro */}
      <ellipse cx="40" cy="40" rx="26" ry="6.5" fill="url(#gold8)" />
      <ellipse cx="40" cy="38.8" rx="22" ry="2" fill="oklch(97% 0.12 85)" opacity="0.55" />
      {/* broth */}
      <ellipse cx="40" cy="40" rx="24" ry="5.5" fill="url(#broth8)" />
      {/* thick udon noodles */}
      <path d="M20 38 Q26 32 32 38 Q38 44 44 38 Q50 32 60 38" stroke="oklch(98% 0.02 90)" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M18 42 Q24 36 30 42 Q36 48 42 42 Q48 36 62 42" stroke="oklch(94% 0.04 90)" strokeWidth="3.4" strokeLinecap="round" fill="none" opacity="0.85" />
      <path d="M22 35 Q28 30 34 35 Q40 40 46 35" stroke="oklch(99% 0.02 90)" strokeWidth="2.4" strokeLinecap="round" fill="none" opacity="0.7" />
      {/* egg com gema brilhante */}
      <ellipse cx="52" cy="36" rx="7" ry="5.5" fill="oklch(99% 0.01 90)" />
      <ellipse cx="52" cy="36" rx="4" ry="3.5" fill="url(#egg8)" />
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
];

export const AVATAR_NAMES = ['Temaki', 'Ramen', 'Onigiri', 'Gyoza', 'Sashimi', 'Takoyaki', 'Miso', 'Udon', 'Udon Gold'];

export function AvatarImage({ index, size = 80, className }: AvatarProps) {
  const render = AVATARS[index % AVATARS.length];
  return <span className={className}>{render(size)}</span>;
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
