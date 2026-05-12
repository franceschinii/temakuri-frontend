export function DevFooter() {
  return (
    <div className="flex items-center justify-between flex-wrap gap-y-1 px-6 py-2 border-t border-[var(--color-border)]/40 shrink-0">
      <span className="text-[10px] text-[var(--color-text-muted)] opacity-40 tracking-widest" style={{ fontFamily: 'var(--font-display)' }}>
        寿司 · 拉麺 · 餃子
      </span>
      <div className="flex items-center gap-3">
        <span className="text-[10px] text-[var(--color-text-muted)] opacity-40">
          Desenvolvido por André Franceschini
        </span>
        <a
          href="mailto:contato@andrefranceschini.com.br"
          className="text-[10px] text-[var(--color-text-muted)] opacity-40 hover:opacity-80 hover:text-[var(--color-accent-mid)] transition-all"
        >
          contato@andrefranceschini.com.br
        </a>
      </div>
    </div>
  );
}
