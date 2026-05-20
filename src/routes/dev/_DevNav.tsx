import { Link, useLocation } from 'react-router-dom';

/**
 * Nav compartilhado dos /dev/* — link entre os playgrounds.
 */
export function DevNav() {
  const { pathname } = useLocation();
  const linkCls = (active: boolean) =>
    `text-[11px] font-mono uppercase tracking-widest px-2 py-0.5 rounded border ${
      active
        ? 'bg-[var(--color-accent-strong)] text-[var(--color-accent-glow)] border-[var(--color-accent-mid)]'
        : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
    }`;
  return (
    <nav className="flex items-center gap-1.5">
      <Link to="/dev/anims" className={linkCls(pathname === '/dev/anims')}>
        anims
      </Link>
      <Link to="/dev/board" className={linkCls(pathname === '/dev/board')}>
        board
      </Link>
    </nav>
  );
}
