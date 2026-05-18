import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppNavbar } from '@/components/ui/AppNavbar';
import { Button } from '@/components/ui/button';
import { AvatarWithBorder } from '@/components/ui/Avatar';
import { LevelBadge } from '@/components/ui/LevelBadge';
import { TokenDisplay } from '@/components/game/TokenDisplay';
import { OpponentRow } from '@/components/game/OpponentRow';
import { PlayArea } from '@/components/game/PlayArea';
import { PlayerHand } from '@/components/game/PlayerHand';
import { TutorialOverlay } from '@/components/tutorial/TutorialOverlay';
import { useTutorialStore } from '@/stores/tutorialStore';
import { useTutorialFlow } from '@/hooks/useTutorialFlow';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

export default function TutorialPage() {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);

  const step = useTutorialStore(s => s.step);
  const myHand = useTutorialStore(s => s.myHand);
  const pile = useTutorialStore(s => s.pile);
  const drawPileCount = useTutorialStore(s => s.drawPileCount);
  const discardPile = useTutorialStore(s => s.discardPile);
  const consecutivePasses = useTutorialStore(s => s.consecutivePasses);
  const selectedIndices = useTutorialStore(s => s.selectedIndices);
  const me = useTutorialStore(s => s.me);
  const bot = useTutorialStore(s => s.bot);
  const currentTurnUserId = useTutorialStore(s => s.currentTurnUserId);

  const startTutorial = useTutorialStore(s => s.start);
  const toggleCard = useTutorialStore(s => s.toggleCard);
  const playCards = useTutorialStore(s => s.play);
  const passTurn = useTutorialStore(s => s.pass);
  const reset = useTutorialStore(s => s.reset);

  const { allowedAction, currentStep } = useTutorialFlow();

  useEffect(() => {
    startTutorial(user?.username ?? 'Você', user?.avatarIndex ?? 0, user?.level ?? 1);
    return () => { reset(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isMyTurn = currentTurnUserId === 'me';
  const isPlayPhase = allowedAction.type === 'play';
  const canPass = allowedAction.type === 'pass';
  const requiredCardIds = allowedAction.type === 'play' ? allowedAction.requiredCardIds : null;

  const selectedIds = [...selectedIndices].sort((a, b) => a - b).map(i => myHand[i]?.id).filter(Boolean);
  const requiredSorted = requiredCardIds ? [...requiredCardIds].sort() : null;
  const selectedSorted = [...selectedIds].sort();
  const canPlay =
    isPlayPhase &&
    requiredSorted !== null &&
    selectedSorted.length === requiredSorted.length &&
    selectedSorted.every((id, i) => id === requiredSorted[i]);

  const handleToggle = (i: number) => {
    if (!isPlayPhase) return;
    toggleCard(i, requiredCardIds);
  };

  const handlePlay = () => {
    if (!isPlayPhase) return;
    playCards(allowedAction.requiredCardIds);
  };

  const handlePass = () => {
    if (!canPass) return;
    passTurn();
  };

  const navbar = (
    <AppNavbar
      back="/lobby"
      mobileMinimal
      center={<span style={{ color: 'var(--color-text-primary)', fontWeight: 600, fontSize: 15 }}>Tutorial</span>}
    />
  );

  if (step === 'DONE') {
    return (
      <div className="h-dvh flex flex-col" style={{ background: 'var(--color-base)' }}>
        {navbar}
        <TutorialOverlay />
        <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8 text-center">
          <div className="text-5xl">🍣</div>
          <p style={{ color: 'var(--color-text-primary)', fontWeight: 700, fontSize: 22, fontFamily: 'var(--font-display)' }}>
            Você aprendeu!
          </p>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14, maxWidth: 420 }}>
            {currentStep.text}
          </p>
          <div className="flex gap-3 flex-wrap justify-center">
            <Button variant="primary" onClick={() => navigate('/lobby')}>Ir para o Lobby</Button>
            <Button variant="secondary" onClick={() => startTutorial(user?.username ?? 'Você', user?.avatarIndex ?? 0, user?.level ?? 1)}>Repetir tutorial</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-dvh flex flex-col overflow-hidden" style={{ background: 'var(--color-base)' }}>
      {navbar}
      <TutorialOverlay />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Opponents — usa o mesmo componente da mesa real */}
        <div
          className="px-3 sm:px-4 py-2 border-b border-[var(--color-border)] shrink-0 overflow-x-auto"
          style={{ background: 'var(--color-base)' }}
        >
          <div className="flex justify-center">
            <OpponentRow player={bot} isCurrentTurn={currentTurnUserId === 'bot'} compact />
          </div>
        </div>

        {/* Center — PlayArea idêntica ao jogo */}
        <div className="flex-1 flex flex-col items-center justify-center gap-3 px-2 sm:px-4 min-h-0">
          <div className="h-7" />
          <PlayArea
            pile={pile}
            drawPileCount={drawPileCount}
            discardPile={discardPile}
            saborActive={false}
            saborMinRequired={0}
            consecutivePasses={consecutivePasses}
          />
        </div>

        {/* My area */}
        <div
          className={cn(
            'relative shrink-0 border-t-2 bg-[var(--color-surface)] px-2 pt-1 pb-1.5 sm:px-4 flex flex-col transition-all',
            isMyTurn && isPlayPhase
              ? 'border-t-[var(--color-accent-strong)] shadow-[0_-8px_24px_-4px_var(--color-accent-strong-translucent)]'
              : 'border-t-[var(--color-border)]',
          )}
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <AvatarWithBorder index={me.avatarIndex} level={me.level ?? 1} size={36} />
              <span className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {me.username}
              </span>
              <LevelBadge level={me.level ?? 1} size="xs" />
              {isMyTurn && isPlayPhase && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-accent-strong)] text-[var(--color-on-accent)] font-bold uppercase tracking-wider">
                  Sua vez
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <TokenDisplay tokens={me.tokensLeft} size="sm" playerId={me.userId} />
              <span className="text-xs text-[var(--color-text-muted)] tabular-nums">{myHand.length} cartas</span>
            </div>
          </div>

          <div className="relative pb-1.5 pt-1 overflow-visible">
            <PlayerHand
              hand={myHand}
              isMyTurn={isMyTurn && isPlayPhase}
              selectedIndicesOverride={selectedIndices}
              onToggleOverride={handleToggle}
              allowedCardIds={requiredCardIds ?? undefined}
            />
          </div>

          {/* Botões de ação */}
          <div className="flex gap-2 justify-center pt-1">
            {isPlayPhase && (
              <Button
                variant="primary"
                onClick={handlePlay}
                disabled={!canPlay}
                data-testid="game-action-play-btn"
              >
                {selectedIndices.length > 0 ? `Jogar (${selectedIndices.length})` : 'Jogar'}
              </Button>
            )}
            {canPass && (
              <Button variant="secondary" onClick={handlePass} data-testid="game-action-pass-btn">
                Passar
              </Button>
            )}
            {allowedAction.type === 'wait' && (
              <span className="text-xs text-[var(--color-text-muted)] py-2">Bot jogando...</span>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
