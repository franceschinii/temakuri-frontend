import { Fragment, type ReactNode } from 'react';

/**
 * Renderizador minimo de markdown para o campo "detalhes" do changelog.
 * Suporta apenas duas regras (sem dependencia externa):
 *
 *   - **texto**  -> negrito
 *   - linha iniciada por "* ", "- " ou "• "  -> item de lista (bolinha)
 *
 * Linhas em branco viram espacamento. Qualquer outra coisa e texto
 * normal preservando quebras.
 */

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  // Divide em segmentos **negrito** preservando o resto como texto.
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    const m = part.match(/^\*\*([^*]+)\*\*$/);
    if (m) {
      return (
        <strong key={`${keyPrefix}-b${i}`} className="font-semibold text-[var(--color-text-primary)]">
          {m[1]}
        </strong>
      );
    }
    return <Fragment key={`${keyPrefix}-t${i}`}>{part}</Fragment>;
  });
}

export function MiniMarkdown({ text }: { text: string }) {
  const lines = text.split('\n');
  const blocks: ReactNode[] = [];
  let bullets: ReactNode[] = [];
  let key = 0;

  const flushBullets = () => {
    if (bullets.length === 0) return;
    blocks.push(
      <ul key={`ul-${key++}`} className="flex flex-col gap-1.5 my-1.5">
        {bullets}
      </ul>,
    );
    bullets = [];
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const bulletMatch = line.match(/^\s*[*\-•]\s+(.*)$/);

    if (bulletMatch) {
      bullets.push(
        <li key={`li-${key++}`} className="flex items-start gap-2">
          <span className="text-[var(--color-accent-mid)] shrink-0 mt-px">•</span>
          <span>{renderInline(bulletMatch[1], `li${key}`)}</span>
        </li>,
      );
      continue;
    }

    flushBullets();

    if (line.trim() === '') {
      blocks.push(<div key={`sp-${key++}`} className="h-2" />);
    } else {
      blocks.push(
        <p key={`p-${key++}`} className="leading-relaxed">
          {renderInline(line, `p${key}`)}
        </p>,
      );
    }
  }
  flushBullets();

  return <div className="text-xs text-[var(--color-text-muted)]">{blocks}</div>;
}
