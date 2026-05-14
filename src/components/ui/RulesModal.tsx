import { Modal } from '@/components/ui/modal';

interface RulesModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Modal "Como jogar" — regras detalhadas do Temakuri. Usado no lobby (botao
 * ao lado do logo) e in-game (icone HelpCircle na navbar mobile).
 */
export function RulesModal({ open, onClose }: RulesModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Como jogar">
      <div className="flex flex-col gap-5 text-sm">

        <section className="flex flex-col gap-1.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent-mid)]">Preparação</p>
          <p className="text-[var(--color-text-muted)] leading-relaxed">
            3 a 6 jogadores. Cada um recebe <strong className="text-[var(--color-text-primary)]">8 cartas</strong>. A ordem das cartas na mão <strong className="text-[var(--color-text-primary)]">não pode ser alterada</strong> — só muda ao comprar ou pegar a pilha.
          </p>
        </section>

        <section className="flex flex-col gap-1.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent-mid)]">Objetivo</p>
          <p className="text-[var(--color-text-muted)] leading-relaxed">
            Quem ficar com cartas na mão ao fim da rodada perde <strong className="text-[var(--color-text-primary)]">1 Prato</strong>. Os demais sobrevivem. O primeiro a perder todos os Pratos vence.
          </p>
        </section>

        <section className="flex flex-col gap-1.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent-mid)]">Quem começa</p>
          <p className="text-[var(--color-text-muted)] leading-relaxed">
            Na <strong className="text-[var(--color-text-primary)]">primeira rodada</strong> o jogador inicial é <strong className="text-[var(--color-text-primary)]">sorteado</strong>. Nas rodadas seguintes, quem <strong className="text-[var(--color-text-primary)]">venceu a rodada anterior</strong> (esvaziou a mão primeiro) começa a próxima.
          </p>
          <p className="text-[var(--color-text-muted)] leading-relaxed">
            Dentro da rodada, quem ganha a vaza inicia a próxima vaza.
          </p>
        </section>

        <section className="flex flex-col gap-1.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent-mid)]">A — Jogar cartas</p>
          <p className="text-[var(--color-text-muted)] leading-relaxed">
            Selecione cartas <strong className="text-[var(--color-text-primary)]">adjacentes de mesmo valor</strong> e jogue na pilha central. A jogada deve superar a anterior:
          </p>
          <ul className="list-disc list-inside text-[var(--color-text-muted)] space-y-0.5 pl-1">
            <li><strong className="text-[var(--color-text-primary)]">Mais cartas</strong> batem qualquer jogada menor</li>
            <li>Mesmo count: <strong className="text-[var(--color-text-primary)]">valor mais alto</strong> vence</li>
          </ul>
          <p className="text-[var(--color-text-muted)] leading-relaxed">
            Após jogar, <strong className="text-[var(--color-text-primary)]">pegue a pilha</strong> (insere na mão) ou <strong className="text-[var(--color-text-primary)]">descarte</strong>.
          </p>
        </section>

        <section className="flex flex-col gap-1.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent-mid)]">B — Passar a vez</p>
          <p className="text-[var(--color-text-muted)] leading-relaxed">
            Compre uma carta do monte: insira na mão ou descarte. Monte vazio? Passa sem comprar. Se todos passarem, a pilha é descartada e quem jogou por último reinicia o turno.
          </p>
        </section>

        <section className="flex flex-col gap-1.5 border border-[var(--color-border)] rounded-xl px-4 py-3 bg-[var(--color-panel)]/50">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-warning)]">Modo Duelo (2 jogadores)</p>
          <p className="text-[var(--color-text-muted)] leading-relaxed">
            Cada um recebe <strong className="text-[var(--color-text-primary)]">11 cartas</strong> + <strong className="text-[var(--color-text-primary)]">2 cartas de mesa</strong> (viradas para cima). Ao passar, pegue uma carta de mesa — não do monte. Sem cartas de mesa: perde.
          </p>
          <p className="text-[var(--color-text-muted)] leading-relaxed">
            Vença esvaziando a mão <strong className="text-[var(--color-text-primary)]">ou</strong> forçando o adversário a passar <strong className="text-[var(--color-text-primary)]">3 vezes na mesma rodada</strong>.
          </p>
        </section>

      </div>
    </Modal>
  );
}
