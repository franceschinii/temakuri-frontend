import { useState, type ComponentType } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Coins, Trophy, ShieldCheck, Sparkles,
  Wine, Utensils, Flame, Zap, Eye, Gamepad2, type LucideIcon,
} from 'lucide-react';
import { RankIcon } from '@/components/ui/RankIcon';
import type { GameRank } from '@/types/api';

type Tab = 'moedas' | 'ranks' | 'bordas' | 'icones';

interface HelpModalProps {
  open: boolean;
  onClose: () => void;
}

const TABS: { key: Tab; label: string; icon: LucideIcon }[] = [
  { key: 'moedas', label: 'Moedas', icon: Coins },
  { key: 'ranks', label: 'Ranks', icon: Trophy },
  { key: 'bordas', label: 'Bordas', icon: ShieldCheck },
  { key: 'icones', label: 'Ícones', icon: Sparkles },
];

const RANK_INFO: { rank: GameRank; pds: string }[] = [
  { rank: 'Bronze', pds: '0 — 199' },
  { rank: 'Prata', pds: '200 — 499' },
  { rank: 'Ouro', pds: '500 — 999' },
  { rank: 'Platina', pds: '1000 — 1799' },
  { rank: 'Diamante', pds: '1800 — 2799' },
  { rank: 'Esmeralda', pds: '2800 — 3999' },
  { rank: 'SuperSabor', pds: '4000+' },
];

const BORDER_INFO: { tier: string; level: string; color: string; description: string }[] = [
  { tier: 'Sem borda', level: 'Nível 1 — 9', color: 'oklch(55% 0.02 260)', description: 'Borda padrão. Continue jogando para evoluir.' },
  { tier: 'Bronze', level: 'Nível 10+', color: 'oklch(60% 0.12 55)', description: 'Sua primeira borda — começou a evoluir de verdade.' },
  { tier: 'Prata', level: 'Nível 25+', color: 'oklch(72% 0.05 220)', description: 'Veterano em ascensão.' },
  { tier: 'Ouro', level: 'Nível 50+', color: 'oklch(78% 0.2 75)', description: 'Jogador experiente, respeitado nas mesas.' },
  { tier: 'Platina', level: 'Nível 75+', color: 'oklch(80% 0.08 195)', description: 'Elite da elite.' },
  { tier: 'Lendário', level: 'Nível 100', color: 'conic-gradient(from 0deg, oklch(78% 0.2 75), oklch(72% 0.2 240), oklch(68% 0.2 160), oklch(55% 0.25 15), oklch(78% 0.2 75))', description: 'Gradiente animado lendário. Você atingiu o teto.' },
];

const ICON_INFO: { Icon: ComponentType<{ size?: number; className?: string }>; iconStyle?: React.CSSProperties; name: string; description: string }[] = [
  {
    Icon: Trophy,
    iconStyle: { color: 'oklch(60% 0.2 300)' },
    name: 'Troféu vinho',
    description: 'Contador de vitórias na sessão atual da sala. Toda vez que você vence uma partida sem sair da sala, o número sobe. Reinicia quando a sala é resetada ou você sai.',
  },
  {
    Icon: Wine,
    iconStyle: { color: 'oklch(75% 0.2 310)' },
    name: 'Taça (Premium)',
    description: 'Aparece ao lado do nome dos jogadores que assinam o plano Premium. Esses jogadores apoiam o desenvolvimento do jogo e ganham benefícios visuais e funcionais.',
  },
  {
    Icon: Coins,
    iconStyle: { color: 'var(--color-token-gold)' },
    name: 'Moeda',
    description: 'Saldo de moedas — ganhas em cada partida concluída. Usadas na loja para comprar avatares novos e desbloquear modos pagos como Mercado e Rodízio.',
  },
  {
    Icon: Utensils,
    iconStyle: { color: 'var(--color-token-gold)' },
    name: 'Prato',
    description: 'Tokens da partida. Cada jogador começa com 2 pratos. Zerar a mão te tira da rodada sem prejuízo. Quem ficar com cartas quando todos os outros zerarem perde 1 prato. Sem pratos = derrota.',
  },
  {
    Icon: Flame,
    iconStyle: { color: 'var(--color-warning)' },
    name: 'Sabor ativo',
    description: 'Combo especial. Quando alguém joga 2 ou mais cartas da mesma categoria (todas sushi, todas ramen, etc), ativa o Sabor. Próximas jogadas precisam ter pelo menos aquela quantidade de cartas, até alguém quebrar o combo jogando categorias misturadas.',
  },
  {
    Icon: Zap,
    iconStyle: { color: 'var(--color-accent-mid)' },
    name: 'Sua vez',
    description: 'Destaque verde que aparece no seu avatar e nome quando é a sua vez de jogar.',
  },
  {
    Icon: Eye,
    iconStyle: { color: 'var(--color-accent-mid)' },
    name: 'Espectador',
    description: 'Indica que a pessoa está apenas assistindo a partida. Espectadores veem o jogo em tempo real mas não jogam até virarem jogadores quando alguém sai.',
  },
  {
    Icon: Gamepad2,
    iconStyle: { color: 'var(--color-accent-mid)' },
    name: 'Nível (LVL)',
    description: 'Seu nível atual no jogo, de 1 a 100. Sobe ao acumular XP. Cada partida dá XP proporcional à sua colocação. A cor da borda do seu avatar muda em níveis-chave: 10 (Bronze), 25 (Prata), 50 (Ouro), 75 (Platina), 100 (Lendário animado).',
  },
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
            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl w-full max-w-4xl max-h-[90dvh] overflow-hidden flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)] shrink-0">
              <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}>
                Como funciona
              </h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-[var(--color-panel)] transition-colors"
                style={{ color: 'var(--color-text-muted)' }}
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
                        ? 'bg-[var(--color-surface)] shadow-sm'
                        : 'hover:bg-[var(--color-surface)]/40'
                    }`}
                    style={{ color: tab === t.key ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}
                  >
                    <Icon size={14} />
                    {t.label}
                  </button>
                );
              })}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-4 [scrollbar-width:thin]" style={{ color: 'var(--color-text-primary)' }}>
              {tab === 'moedas' && (
                <div className="space-y-4 text-sm">
                  <section>
                    <h3 className="font-semibold mb-2 text-base" style={{ color: 'var(--color-text-primary)' }}>Como ganhar moedas</h3>
                    <p className="leading-relaxed mb-3" style={{ color: 'var(--color-text-muted)' }}>
                      Só existe um perdedor por partida — quem fica sem pratos. Todos os outros são vencedores e ganham a mesma quantia. O perdedor leva apenas um valor simbólico.
                    </p>

                    <div className="space-y-3">
                      <div>
                        <p className="text-xs uppercase tracking-wider font-medium mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Partida de 4 jogadores</p>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { place: 'Vencedores', value: 6 },
                            { place: 'Perdedor', value: 1 },
                          ].map(p => (
                            <div key={p.place} className="bg-[var(--color-panel)] rounded-lg p-2 text-center">
                              <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{p.place}</p>
                              <p className="text-base font-bold" style={{ color: 'var(--color-token-gold)' }}>+{p.value}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-wider font-medium mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Partida de 3 jogadores</p>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { place: 'Vencedores', value: 4 },
                            { place: 'Perdedor', value: 1 },
                          ].map(p => (
                            <div key={p.place} className="bg-[var(--color-panel)] rounded-lg p-2 text-center">
                              <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{p.place}</p>
                              <p className="text-base font-bold" style={{ color: 'var(--color-token-gold)' }}>+{p.value}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-wider font-medium mb-1.5" style={{ color: 'var(--color-text-muted)' }}>1v1 (casual)</p>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { place: 'Vencedor', value: 6 },
                            { place: 'Perdedor', value: 2 },
                          ].map(p => (
                            <div key={p.place} className="bg-[var(--color-panel)] rounded-lg p-2 text-center">
                              <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{p.place}</p>
                              <p className="text-base font-bold" style={{ color: 'var(--color-token-gold)' }}>+{p.value}</p>
                            </div>
                          ))}
                        </div>
                        <p className="text-[10px] mt-1.5" style={{ color: 'var(--color-text-muted)' }}>1v1 paga +50% por ser formato com vencedor único.</p>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-wider font-medium mb-1.5" style={{ color: 'var(--color-accent-mid)' }}>1v1 Ranqueada</p>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { place: 'Vencedor', value: 9 },
                            { place: 'Perdedor', value: 2 },
                          ].map(p => (
                            <div key={p.place} className="bg-[var(--color-panel)] rounded-lg p-2 text-center">
                              <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{p.place}</p>
                              <p className="text-base font-bold" style={{ color: 'var(--color-token-gold)' }}>+{p.value}</p>
                            </div>
                          ))}
                        </div>
                        <p className="text-[10px] mt-1.5" style={{ color: 'var(--color-text-muted)' }}>Ranqueada paga +50% sobre a tabela base. Combinado com bônus de 1v1, é o formato mais lucrativo.</p>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="font-semibold mb-2 text-base" style={{ color: 'var(--color-text-primary)' }}>Como gastar</h3>
                    <ul className="leading-relaxed list-disc list-inside space-y-1" style={{ color: 'var(--color-text-muted)' }}>
                      <li>Comprar avatares novos na loja</li>
                      <li>Desbloquear modos pagos (Mercado, Rodízio, Degustação)</li>
                    </ul>
                  </section>
                </div>
              )}

              {tab === 'ranks' && (
                <div className="space-y-3 text-sm">
                  <p className="leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                    Ranks são conquistados em partidas <strong style={{ color: 'var(--color-text-primary)' }}>ranqueadas</strong>. Cada vitória aumenta o seu PDS (Pontos de Skill), cada derrota diminui. Atinja o PDS mínimo de cada faixa para subir de rank.
                  </p>
                  <div className="space-y-2">
                    {RANK_INFO.map(r => (
                      <div key={r.rank} className="flex items-center gap-3 bg-[var(--color-panel)] rounded-lg p-3">
                        <RankIcon rank={r.rank} size={32} />
                        <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                          <h4 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{r.rank}</h4>
                          <span className="text-[10px] font-mono tabular-nums" style={{ color: 'var(--color-text-muted)' }}>{r.pds} PDS</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tab === 'bordas' && (
                <div className="space-y-3 text-sm">
                  <p className="leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
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
                            <h4 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{b.tier}</h4>
                            <span className="text-[10px] font-mono" style={{ color: 'var(--color-text-muted)' }}>{b.level}</span>
                          </div>
                          <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{b.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tab === 'icones' && (
                <div className="space-y-2 text-sm">
                  <p className="leading-relaxed mb-3" style={{ color: 'var(--color-text-muted)' }}>
                    Significado dos ícones que aparecem no perfil e durante a partida.
                  </p>
                  {ICON_INFO.map(i => {
                    const Icon = i.Icon;
                    return (
                      <div key={i.name} className="flex items-start gap-3 bg-[var(--color-panel)] rounded-lg p-3">
                        <div className="shrink-0 w-8 h-8 rounded-lg bg-[var(--color-surface)] flex items-center justify-center" style={i.iconStyle}>
                          <Icon size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{i.name}</h4>
                          <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{i.description}</p>
                        </div>
                      </div>
                    );
                  })}
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
