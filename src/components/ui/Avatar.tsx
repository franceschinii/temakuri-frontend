import { cn } from '@/lib/utils';
import { LevelBorder } from './LevelBorder';

interface AvatarProps {
  index: number;
  size?: number;
  className?: string;
}

const AVATAR_IMAGE_PATHS = [
  '/avatars/TEMAKI.png',
  '/avatars/RAMEM.png',
  '/avatars/ONIGIRI.png',
  '/avatars/GYOZA.png',
  '/avatars/SASHIMI.png',
  '/avatars/TAKOYAKI.png',
  '/avatars/MISO.png',
  '/avatars/UDON.png',
  '/avatars/UDON.png',
  '/avatars/YOKAI.png',
  '/avatars/KITSUNE.png',
  '/avatars/TANUKI.png',
  '/avatars/GEISHA.png',
  '/avatars/SAMURAI.png',
  '/avatars/DRAGON.png',
  '/avatars/NINJA.png',
] as const;

export const LEGACY_UDON_AVATAR_INDEX = 7;
export const UDON_GOLD_AVATAR_INDEX = 8;

export const AVATAR_NAMES = [
  'Temaki',
  'Ramen',
  'Onigiri',
  'Gyoza',
  'Sashimi',
  'Takoyaki',
  'Miso',
  'Udon Gold',
  'Udon Gold',
  'Yokai',
  'Kitsune',
  'Tanuki',
  'Geisha',
  'Samurai',
  'Dragão Dourado',
  'Ninja',
] as const;

export const AVATAR_VISIBLE_INDICES = [0, 1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14, 15] as const;

export function normalizeAvatarIndex(index: number) {
  if (!Number.isInteger(index) || index < 0 || index >= AVATAR_IMAGE_PATHS.length) {
    return 0;
  }

  return index === LEGACY_UDON_AVATAR_INDEX ? UDON_GOLD_AVATAR_INDEX : index;
}

export function normalizeUnlockedAvatarIndices(indices: number[]) {
  const normalized = new Set((indices.length ? indices : [0, 1, 2, 3]).map(normalizeAvatarIndex));
  return Array.from(normalized).sort((a, b) => a - b);
}

export function getAvatarName(index: number) {
  return AVATAR_NAMES[normalizeAvatarIndex(index)] ?? AVATAR_NAMES[0];
}

export function AvatarImage({ index, size = 80, className }: AvatarProps) {
  const resolvedIndex = normalizeAvatarIndex(index);

  return (
    <span
      className={cn('inline-flex shrink-0 overflow-hidden rounded-full bg-[var(--color-panel)]', className)}
      style={{ width: size, height: size }}
    >
      <img
        src={AVATAR_IMAGE_PATHS[resolvedIndex]}
        alt={getAvatarName(index)}
        width={size}
        height={size}
        className="h-full w-full object-cover"
        draggable={false}
      />
    </span>
  );
}

export function avatarCount() {
  return AVATAR_VISIBLE_INDICES.length;
}

interface AvatarWithBorderProps {
  index: number;
  level: number;
  size?: number;
  className?: string;
}

export function AvatarWithBorder({ index, level, size = 80, className }: AvatarWithBorderProps) {
  const innerSize = size - 4;

  return (
    <LevelBorder level={level} size={size}>
      <AvatarImage index={index} size={innerSize} className={className} />
    </LevelBorder>
  );
}
