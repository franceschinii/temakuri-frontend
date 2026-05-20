/**
 * /dev/board — preview estático da mesa de jogo.
 *
 * Monta o GameBoard real (sem :roomCode → side effects e socket pulam).
 * Pré-semeia useAuthStore.user + useGameStore com o cenário escolhido.
 * Anima tudo desativado via MotionConfig reducedMotion="always".
 *
 * Cenários de layout (mobile/tall desktop) dependem de viewport real —
 * o componente usa media queries Tailwind (sm:, [@media(min-height:900px)])
 * que não são container-driven. Pra simular, redimensione a janela.
 */

import { useEffect, useState, useMemo } from 'react';
import { MotionConfig } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { useGameStore } from '@/stores/gameStore';
import { GameBoard } from '@/components/game/GameBoard';
import { DevNav } from '../_DevNav';
import { SCENARIOS, findScenario, FORCE_MOBILE_IDS, FORCE_TALL_IDS } from './scenarios';

export default function BoardDevPage() {
  const [scenarioId, setScenarioId] = useState<string>(SCENARIOS[0].id);
  const scenario = useMemo(() => findScenario(scenarioId), [scenarioId]);

  // Snapshot do auth na primeira montagem; restaura no unmount. Não
  // restaurar a cada troca de cenário — useAuthStore tem persist e fica
  // restaurando o user real (do localStorage) entre cenários, fazendo
  // o LVL/avatar piscarem.
  useEffect(() => {
    const prevAuth = useAuthStore.getState();
    return () => {
      useAuthStore.setState({
        user: prevAuth.user,
        accessToken: prevAuth.accessToken,
        isGuest: prevAuth.isGuest,
      });
    };
  }, []);

  // Aplica cenário (auth + game) a cada troca.
  useEffect(() => {
    useAuthStore.setState({
      user: scenario.user,
      accessToken: 'dev-token',
      isGuest: false,
    });
    useGameStore.setState({
      ...scenario.state,
      pendingPickFromPile: false,
    });
  }, [scenario]);

  // Aviso pra cenários de layout que dependem de viewport real.
  const needsViewportHint =
    FORCE_MOBILE_IDS.has(scenario.id) || FORCE_TALL_IDS.has(scenario.id);

  return (
    <MotionConfig reducedMotion="always">
      <div className="min-h-screen flex flex-col">
        <DevPickerBar
          scenarioId={scenarioId}
          onChange={setScenarioId}
          hint={
            needsViewportHint
              ? FORCE_MOBILE_IDS.has(scenario.id)
                ? 'Redimensione a janela pra <640px (sm) pra ver o layout mobile.'
                : 'Use uma janela com altura ≥900px pra disparar o layout "tall desktop".'
              : null
          }
        />
        <div className="flex-1 relative">
          {/* Monta o GameBoard real. Sem :roomCode → side effects de socket
              pulam (todos guardados por `if (roomCode)`). */}
          <GameBoard devForceState={scenario.force} />
        </div>
      </div>
    </MotionConfig>
  );
}

interface DevPickerBarProps {
  scenarioId: string;
  onChange: (id: string) => void;
  hint: string | null;
}

function DevPickerBar({ scenarioId, onChange, hint }: DevPickerBarProps) {
  // Agrupa cenários por grupo pro <optgroup>.
  const grouped = useMemo(() => {
    const m = new Map<string, typeof SCENARIOS>();
    for (const s of SCENARIOS) {
      const arr = m.get(s.group) ?? [];
      arr.push(s);
      m.set(s.group, arr);
    }
    return Array.from(m.entries());
  }, []);

  return (
    <div className="border-b border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-2 flex items-center gap-3 flex-wrap text-xs">
      <span className="font-mono uppercase tracking-widest text-[var(--color-text-muted)]">
        /dev/board
      </span>
      <DevNav />
      <select
        value={scenarioId}
        onChange={(e) => onChange(e.target.value)}
        className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded px-2 py-1 text-xs font-mono"
      >
        {grouped.map(([group, items]) => (
          <optgroup key={group} label={group}>
            {items.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      {hint && (
        <span className="text-[var(--color-warning)] text-[11px]">{hint}</span>
      )}
      <span className="ml-auto text-[var(--color-text-muted)]">
        anims desativadas · sem socket
      </span>
    </div>
  );
}
