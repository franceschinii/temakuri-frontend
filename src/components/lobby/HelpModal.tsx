import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Coins, Trophy, ShieldCheck, Sparkles } from 'lucide-react';

type Tab = 'moedas' | 'ranks' | 'bordas' | 'icones';

interface HelpModalProps {
  open: boolean;
  onClose: () => void;
}

const TABS: { key: Tab; label: string; icon: typeof Coins }[] = [
  { key: 'moedas', label: 'Moedas', icon: Coins },
  { key: 'ranks', label: 'Ranks', icon: Trophy },
  { key: 'bordas', label: 'Bordas', icon: ShieldCheck },
  { key: 'icones', label: 'Ícones', icon: Sparkles },
];

const RANK_INFO: { rank: string; pds: string; color: string; reward: string }[] = [
  { rank: 'Bronze', pds: '0 — 199', color: 'oklch(60% 0.12 55)', reward: 'Acesso à fila ranqueada e estatísticas básicas.' },
  { rank: 'Prata', pds: '200 — 499', color: 'oklch(72% 0.05 220)', reward: '+10% de XP nas vitórias ranqueadas.' },
  { rank: 'Ouro', pds: '500 — 999', color: 'oklch(78% 0.2 75)', reward: '+25% de XP e badge dourado no perfil.' },
  { rank: 'Platina', pds: '1000 — 1799', color: 'oklch(80% 0.08 195)', reward: '+50% de XP e acesso prioritário em matchmaking.' },
  { rank: 'Diamante', pds: '1800 — 2799', color: 'oklch(75% 0.15 220)', reward: '+75% de XP e nome destacado no leaderboard.' },
  { rank: 'Esmeralda', pds: '2800 — 3999', color: 'oklch(70% 0.18 160)', reward: '+100% de XP e moldura especial.' },
  { rank: 'SuperSabor', pds: '4000+', color: 'oklch(55% 0.25 15)', reward: 'Nome em vermelho na partida e visibilidade no top global.' },
];

const BORDER_INFO: { tier: string; level: string; color: string; description: string }[] = [
  { tier: 'Sem borda', level: 'Nível 1 — 9', color: 'oklch(55% 0.02 260)', description: 'Borda padrão. Continue jogando para evoluir.' },
  { tier: 'Bronze', level: 'Nível 10+', color: 'oklch(60% 0.12 55)', description: 'Sua primeira borda — começou a evoluir de verdade.' },
  { tier: 'Prata', level: 'Nível 25+', color: 'oklch(72% 0.05 220)', description: 'Veterano em ascensão.' },
  { tier: 'Ouro', level: 'Nível 50+', color: 'oklch(78% 0.2 75)', description: 'Jogador experiente, respeitado nas mesas.' },
  { tier: 'Platina', level: 'Nível 75+', color: 'oklch(80% 0.08 195)', description: 'Elite da elite.' },
  { tier: 'Lendário', level: 'Nível 100', color: 'conic-gradient(from 0deg, oklch(78% 0.2 75), oklch(72% 0.2 240), oklch(68% 0.2 160), oklch(55% 0.25 15), oklch(78% 0.2 75))', description: 'Gradiente animado lendário. Você atingiu o teto.' },
];

const ICON_INFO: { icon: string; name: string; description: string }[] = [
  { icon: '🏆', name: 'Troféu (cor vinho)', description: 'Contador de vitórias na sessão atual da sala. Reinicia quando a sala é resetada ou você sai.' },
  { icon: '🪙', name: 'Moeda dourada', description: 'Saldo de moedas — ganhas em cada partida. Usadas na loja para comprar avatares e desbloquear modos pagos.' },
  { icon: '🍽️', name: 'Prato', description: 'Tokens da partida. Cada jogador começa com 2 pratos. Perder uma rodada = perder 1 prato. Sem pratos = eliminado do jogo.' },
  { icon: '🔥', name: 'Sabor ativo', description: 'Combo de 2+ cartas da mesma categoria. Próximas jogadas precisam superar o mínimo até alguém quebrar o combo com categorias mistas.' },
  { icon: '⚡', name: 'Seu turno', description: 'Badge verde no seu nome quando é sua vez de jogar.' },
  { icon: '👁️', name: 'Espectador', description: 'Indica quem está assistindo. Espectadores veem o jogo em tempo real mas não jogam.' },
  { icon: '🎮', name: 'Nível (LVL)', description: 'Seu nível atual. Sobe ao acumular XP. Cada partida dá XP proporcional à colocação.' },
];

export function HelpModal({ open, onClose }: HelpModalProps) {
  const [tab, setTab] = useState<Tab>('moedas');

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={e => e.stopPropagation()}
            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)] shrink-0">
              <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}>
                Como funciona
              </h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-panel)] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 px-3 py-2 border-b border-[var(--color-border)] bg-[var(--color-panel)]/50 shrink-0">
              {TABS.map(t => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                      tab === t.key
                        ? 'bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-sm'
                        : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                    }`}
                  >
                    <Icon size={14} />
                    {t.label}
                  </button>
                );
              })}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-4 [scrollbar-width:thin]">
              {tab === 'moedas' && (
                <div className="space-y-4 text-sm" style={{ color: 'var(--color-text-primary)' }}>
                  <section>
                    <h3 className="font-semibold mb-2 text-base">Como ganhar moedas</h3>
                    <p className="text-[var(--color-text-muted)] leading-relaxed mb-3">
                      Moedas são recompensa de cada partida finalizada. O valor depende da sua colocação e do modo de jogo.
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-[var(--color-panel)] rounded-lg p-3">
                        <p className="text-xs text-[var(--color-text-muted)] mb-1">1º lugar</p>
                        <p className="text-lg font-bold text-[var(--color-token-gold)]">+50 moedas</p>
                      </div>
                      <div className="bg-[var(--color-panel)] rounded-lg p-3">
                        <p className="text-xs text-[var(--color-text-muted)] mb-1">2º lugar</p>
                        <p className="text-lg font-bold text-[var(--color-accent-mid)]">+25 moedas</p>
                      </div>
                      <div className="bg-[var(--color-panel)] rounded-lg p-3">
                        <p className="text-xs text-[var(--color-text-muted)] mb-1">3º lugar</p>
                        <p className="text-lg font-bold text-[var(--color-accent-soft)]">+10 moedas</p>
                      </div>
                      <div className="bg-[var(--color-panel)] rounded-lg p-3">
                        <p className="text-xs text-[var(--color-text-muted)] mb-1">4º lugar</p>
                        <p className="text-lg font-bold text-[var(--color-text-muted)]">+5 moedas</p>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="font-semibold mb-2 text-base">Como gastar</h3>
                    <ul className="text-[var(--color-text-muted)] leading-relaxed list-disc list-inside space-y-1">
                      <li>Comprar avatares novos na loja</li>
                      <li>Desbloquear modos pagos (Mercado, Rodízio, Degustação)</li>
                      <li>Em breve: skins de cartas, temas de mesa</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="font-semibold mb-2 text-base">Dica</h3>
                    <p className="text-[var(--color-text-muted)] leading-relaxed">
                      Vencer ranqueadas dá XP extra mas o ganho de moedas é o mesmo. Foque em jogar consistentemente para acumular saldo.
                    </p>
                  </section>
                </div>
              )}

              {tab === 'ranks' && (
                <div className="space-y-3 text-sm" style={{ color: 'var(--color-text-primary)' }}>
                  <p className="text-[var(--color-text-muted)] leading-relaxed">
                    Ranks são conquistados em partidas <strong>ranqueadas</strong>. Cada vitória dá PDS, cada derrota tira. Atinja o PDS mínimo para subir de rank.
                  </p>
                  <div className="space-y-2">
                    {RANK_INFO.map(r => (
                      <div key={r.rank} className="flex items-start gap-3 bg-[var(--color-panel)] rounded-lg p-3">
                        <div
                          className="w-3 h-3 rounded-full shrink-0 mt-1"
                          style={{ background: r.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-semibold" style={{ color: r.color }}>{r.rank}</h4>
                            <span className="text-[10px] text-[var(--color-text-muted)] font-mono tabular-nums">{r.pds} PDS</span>
                          </div>
                          <p className="text-xs text-[var(--color-text-muted)] mt-0.5 leading-relaxed">{r.reward}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tab === 'bordas' && (
                <div className="space-y-3 text-sm" style={{ color: 'var(--color-text-primary)' }}>
                  <p className="text-[var(--color-text-muted)] leading-relaxed">
                    A borda em volta do seu avatar mostra seu nível atual. Cada tier desbloqueia uma cor diferente.
                  </p>
                  <div className="space-y-2">
                    {BORDER_INFO.map(b => (
                      <div key={b.tier} className="flex items-center gap-3 bg-[var(--color-panel)] rounded-lg p-3">
                        <div
                          className="w-10 h-10 rounded-full shrink-0"
                          style={{
                            background: b.color,
                            padding: 2,
                          }}
                        >
                          <div
                            className="w-full h-full rounded-full"
                            style={{ background: 'var(--color-base)' }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <h4 className="font-semibold">{b.tier}</h4>
                            <span className="text-[10px] text-[var(--color-text-muted)] font-mono">{b.level}</span>
                          </div>
                          <p className="text-xs text-[var(--color-text-muted)] mt-0.5 leading-relaxed">{b.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tab === 'icones' && (
                <div className="space-y-2 text-sm" style={{ color: 'var(--color-text-primary)' }}>
                  <p className="text-[var(--color-text-muted)] leading-relaxed mb-3">
                    Significado dos ícones que aparecem no perfil e durante a partida.
                  </p>
                  {ICON_INFO.map(i => (
                    <div key={i.name} className="flex items-start gap-3 bg-[var(--color-panel)] rounded-lg p-3">
                      <span className="text-xl shrink-0 leading-none">{i.icon}</span>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold">{i.name}</h4>
                        <p className="text-xs text-[var(--color-text-muted)] mt-0.5 leading-relaxed">{i.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

