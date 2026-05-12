interface AvatarProps {
  index: number;
  size?: number;
  className?: string;
}

const AVATARS = [
  // 0 — Temaki (cone de arroz)
  (size: number) => (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="40" fill="oklch(22% 0.02 260)" />
      {/* seaweed cone */}
      <path d="M28 22 L52 22 L40 62 Z" fill="oklch(35% 0.12 160)" />
      <path d="M28 22 L40 62 L34 62 L24 26 Z" fill="oklch(28% 0.1 160)" />
      {/* rice */}
      <ellipse cx="40" cy="24" rx="12" ry="6" fill="oklch(96% 0.01 90)" />
      {/* salmon */}
      <ellipse cx="37" cy="22" rx="6" ry="3" fill="oklch(72% 0.18 35)" />
      {/* avocado */}
      <ellipse cx="44" cy="21" rx="4" ry="2.5" fill="oklch(68% 0.15 130)" />
      {/* eyes */}
      <circle cx="35" cy="38" r="2.5" fill="white" />
      <circle cx="45" cy="38" r="2.5" fill="white" />
      <circle cx="36" cy="38.5" r="1.2" fill="oklch(20% 0.02 260)" />
      <circle cx="46" cy="38.5" r="1.2" fill="oklch(20% 0.02 260)" />
      {/* blush */}
      <ellipse cx="32" cy="43" rx="3" ry="1.5" fill="oklch(75% 0.18 15)" opacity="0.5" />
      <ellipse cx="48" cy="43" rx="3" ry="1.5" fill="oklch(75% 0.18 15)" opacity="0.5" />
      {/* mouth */}
      <path d="M37 46 Q40 49 43 46" stroke="oklch(40% 0.05 260)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  ),
  // 1 — Ramen (tigela de macarrão)
  (size: number) => (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="40" fill="oklch(22% 0.02 260)" />
      {/* bowl */}
      <path d="M18 38 Q18 60 40 60 Q62 60 62 38 Z" fill="oklch(78% 0.12 55)" />
      <path d="M18 38 Q18 60 40 60 Q62 60 62 38 Z" fill="oklch(65% 0.1 55)" opacity="0.4" />
      {/* broth */}
      <ellipse cx="40" cy="38" rx="22" ry="8" fill="oklch(72% 0.15 65)" />
      {/* noodles */}
      <path d="M24 36 Q30 32 36 36 Q42 40 48 36 Q54 32 60 36" stroke="oklch(95% 0.05 80)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M22 40 Q28 36 34 40 Q40 44 46 40 Q52 36 58 40" stroke="oklch(95% 0.05 80)" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" />
      {/* egg half */}
      <ellipse cx="50" cy="35" rx="6" ry="5" fill="oklch(96% 0.01 90)" />
      <ellipse cx="50" cy="35" rx="3" ry="2.5" fill="oklch(80% 0.18 75)" />
      {/* chashu */}
      <ellipse cx="30" cy="35" rx="6" ry="4" fill="oklch(55% 0.12 20)" />
      <ellipse cx="30" cy="35" rx="4" ry="2.5" fill="oklch(70% 0.1 20)" />
      {/* eyes on bowl */}
      <circle cx="33" cy="50" r="2.5" fill="white" />
      <circle cx="47" cy="50" r="2.5" fill="white" />
      <circle cx="34" cy="50.5" r="1.2" fill="oklch(20% 0.02 260)" />
      <circle cx="48" cy="50.5" r="1.2" fill="oklch(20% 0.02 260)" />
      <path d="M36 55 Q40 58 44 55" stroke="oklch(40% 0.05 260)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  ),
  // 2 — Onigiri (bolinho de arroz triangular)
  (size: number) => (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="40" fill="oklch(22% 0.02 260)" />
      {/* seaweed base */}
      <rect x="24" y="52" width="32" height="10" rx="3" fill="oklch(25% 0.1 160)" />
      {/* rice body */}
      <path d="M40 14 Q56 30 58 52 Q40 56 22 52 Q24 30 40 14 Z" fill="oklch(95% 0.02 90)" />
      {/* shadow */}
      <path d="M40 14 Q48 30 50 52 Q44 54 40 54 Q36 54 30 52 Q32 30 40 14 Z" fill="oklch(88% 0.03 90)" opacity="0.5" />
      {/* sesame seeds */}
      <circle cx="36" cy="28" r="1" fill="oklch(70% 0.08 70)" />
      <circle cx="42" cy="25" r="1" fill="oklch(70% 0.08 70)" />
      <circle cx="44" cy="32" r="1" fill="oklch(70% 0.08 70)" />
      <circle cx="34" cy="35" r="1" fill="oklch(70% 0.08 70)" />
      {/* salmon filling */}
      <ellipse cx="40" cy="42" rx="7" ry="5" fill="oklch(72% 0.18 35)" />
      {/* eyes */}
      <circle cx="35" cy="36" r="2.5" fill="white" />
      <circle cx="45" cy="36" r="2.5" fill="white" />
      <circle cx="36" cy="36.5" r="1.2" fill="oklch(20% 0.02 260)" />
      <circle cx="46" cy="36.5" r="1.2" fill="oklch(20% 0.02 260)" />
      <ellipse cx="32" cy="41" rx="2.5" ry="1.2" fill="oklch(75% 0.18 15)" opacity="0.5" />
      <ellipse cx="48" cy="41" rx="2.5" ry="1.2" fill="oklch(75% 0.18 15)" opacity="0.5" />
      <path d="M37 44 Q40 47 43 44" stroke="oklch(40% 0.05 260)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  ),
  // 3 — Gyoza (pastel japonês)
  (size: number) => (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="40" fill="oklch(22% 0.02 260)" />
      {/* gyoza body */}
      <ellipse cx="40" cy="46" rx="24" ry="14" fill="oklch(88% 0.08 75)" />
      {/* crispy bottom */}
      <ellipse cx="40" cy="56" rx="20" ry="5" fill="oklch(68% 0.14 55)" />
      {/* fold lines */}
      <path d="M20 46 Q25 40 30 46" stroke="oklch(75% 0.1 75)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M28 44 Q33 38 38 44" stroke="oklch(75% 0.1 75)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M36 43 Q41 37 46 43" stroke="oklch(75% 0.1 75)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M44 44 Q49 38 54 44" stroke="oklch(75% 0.1 75)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M52 46 Q57 40 62 46" stroke="oklch(75% 0.1 75)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* steam */}
      <path d="M30 30 Q28 25 30 20 Q32 15 30 10" stroke="oklch(85% 0.02 260)" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5" />
      <path d="M40 28 Q38 23 40 18 Q42 13 40 8" stroke="oklch(85% 0.02 260)" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.4" />
      <path d="M50 30 Q48 25 50 20 Q52 15 50 10" stroke="oklch(85% 0.02 260)" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5" />
      {/* eyes */}
      <circle cx="34" cy="44" r="2.5" fill="white" />
      <circle cx="46" cy="44" r="2.5" fill="white" />
      <circle cx="35" cy="44.5" r="1.2" fill="oklch(20% 0.02 260)" />
      <circle cx="47" cy="44.5" r="1.2" fill="oklch(20% 0.02 260)" />
      <ellipse cx="31" cy="48" rx="2.5" ry="1.2" fill="oklch(75% 0.18 15)" opacity="0.5" />
      <ellipse cx="49" cy="48" rx="2.5" ry="1.2" fill="oklch(75% 0.18 15)" opacity="0.5" />
      <path d="M37 49 Q40 52 43 49" stroke="oklch(40% 0.05 260)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  ),
];

export const AVATAR_NAMES = ['Temaki', 'Ramen', 'Onigiri', 'Gyoza'];

export function AvatarImage({ index, size = 80, className }: AvatarProps) {
  const render = AVATARS[index % AVATARS.length];
  return <span className={className}>{render(size)}</span>;
}

export function avatarCount() {
  return AVATARS.length;
}
