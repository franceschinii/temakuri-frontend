import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Layers, Utensils, Zap } from 'lucide-react';
import { AppNavbar } from '@/components/ui/AppNavbar';
import { Button } from '@/components/ui/button';
import { CardComponent } from '@/components/game/CardComponent';
import { TutorialOverlay } from '@/components/tutorial/TutorialOverlay';
import { useTutorialStore } from '@/stores/tutorialStore';
import { useAuthStore } from '@/stores/authStore';

function TokenDots({ count, max = 2 }: { count: number; max?: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          className="w-3 h-3 rounded-full border"
          style={{
            background: i < count ? 'var(--color-token-gold, oklch(78% 0.2 75))' : 'transparent',
            borderColor: i < count ? 'var(--color-token-gold, oklch(78% 0.2 75))' : 'var(--color-border)',
          }}
        />
      ))}
    </div>
  );
}

export default function TutorialPage() {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);

  const phase = useTutorialStore(s => s.phase);
  const myHand = useTutorialStore(s => s.myHand);
  const botCardCount = useTutorialStore(s => s.botCardCount);
  const pile = useTutorialStore(s => s.pile);
  const drawPileCount = useTutorialStore(s => s.drawPileCount);
  const myTokens = useTutorialStore(s => s.myTokens);
  const botTokens = useTutorialStore(s => s.botTokens);
  const selectedIndices = useTutorialStore(s => s.selectedIndices);

  const startGame = useTutorialStore(s => s.startGame);
  const toggleCard = useTutorialStore(s => s.toggleCard);
  const playSelected = useTutorialStore(s => s.playSelected);
  const pass = useTutorialStore(s => s.pass);
  const reset = useTutorialStore(s => s.reset);

  useEffect(() => {
    startGame();
    return () => { reset(); };
  }, []);

  const isMyTurn = phase === 'STEP_1' || phase === 'STEP_3' || phase === 'STEP_6';
  const isBotTurn = phase === 'STEP_2' || phase === 'STEP_4';
  const canPass = phase === 'STEP_5';

  const canPlay = useMemo(() => {
    if (!isMyTurn || selectedIndices.length === 0) return false;
    const selectedCards = selectedIndices.map(i => myHand[i]).filter(Boolean);
    if (selectedCards.length === 0) return false;
    if (pile.length === 0) return true;
    const selVal = Math.max(...selectedCards.map(c => c.value));
    const topVal = Math.max(...pile.map(c => c.value));
    if (selectedCards.length > pile.length) return true;
    if (selectedCards.length === pile.length && selVal > topVal) return true;
    return false;
  }, [isMyTurn, selectedIndices, myHand, pile]);

  const navbar = (
    <AppNavbar
      back="/lobby"
      mobileMinimal
      center={<span style={{ color: 'var(--color-text-primary)', fontWeight: 600, fontSize: 15 }}>Tutorial</span>}
    />
  );

  if (phase === 'IDLE') {
    return (
      <div className="h-dvh flex flex-col" style={{ background: 'var(--color-base)' }}>
        {navbar}
        <div className="flex-1 flex items-center justify-center">
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>Carregando...</p>
        </div>
      </div>
    );
  }

  if (phase === 'GAME_OVER') {
    return (
      <div className="h-dvh flex flex-col" style={{ background: 'var(--color-base)' }}>
        {navbar}
        <TutorialOverlay />
        <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8 text-center">
          <p style={{ color: 'var(--color-text-primary)', fontWeight: 700, fontSize: 22, fontFamily: 'var(--font-display)' }}>
            Você aprendeu!
          </p>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>
            Você já sabe o básico do Temakuri. Hora de jogar de verdade!
          </p>
          <div className="flex gap-3 flex-wrap justify-center">
            <Button variant="primary" onClick={() => navigate('/lobby')}>Ir para o Lobby</Button>
            <Button variant="secondary" onClick={() => startGame()}>Repetir tutorial</Button>
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

        {/* Area do bot */}
        <div
          className="flex items-center gap-3 px-3 sm:px-4 py-2.5 border-b border-[var(--color-border)] shrink-0"
          style={{
            background: isBotTurn ? 'var(--color-panel)' : 'var(--color-surface)',
            transition: 'background 0.3s',
          }}
        >
          <div className="relative shrink-0">
            <div
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 flex items-center justify-center"
              style={{
                background: 'var(--color-panel)',
                borderColor: isBotTurn ? 'var(--color-accent-mid)' : 'var(--color-border)',
              }}
            >
              <Bot size={18} style={{ color: 'var(--color-text-muted)' }} />
            </div>
            {isBotTurn && (
              <div
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                style={{ background: 'var(--color-accent-mid)' }}
              >
                <Zap size={9} style={{ color: 'white' }} />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span style={{ color: 'var(--color-text-primary)', fontWeight: 500, fontSize: 14 }}>Bot</span>
              {isBotTurn && (
                <span style={{ color: 'var(--color-accent-mid)', fontSize: 11, fontWeight: 600 }}>
                  pensando...
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Utensils size={11} style={{ color: 'var(--color-text-muted)' }} />
              <TokenDots count={botTokens} />
              <span style={{ color: 'var(--color-text-muted)', fontSize: 11 }}>
                · {botCardCount} cartas
              </span>
            </div>
          </div>

          <div className="flex gap-0.5 items-center shrink-0">
            {Array.from({ length: Math.min(botCardCount, 5) }).map((_, i) => (
              <div
                key={i}
                className="w-7 h-10 sm:w-8 sm:h-12 rounded border border-[var(--color-border)]"
                style={{ background: 'var(--color-panel)' }}
              />
            ))}
            {botCardCount > 5 && (
              <span style={{ color: 'var(--color-text-muted)', fontSize: 10, marginLeft: 2 }}>
                +{botCardCount - 5}
              </span>
            )}
          </div>
        </div>

        {/* Mesa */}
        <div className="flex-1 flex flex-col items-center justify-center gap-3 px-4 min-h-0">
          <div className="flex items-center gap-5 sm:gap-8">
            {/* Monte */}
            <div className="flex flex-col items-center gap-1">
              <div
                className="w-11 h-16 sm:w-14 sm:h-20 rounded-lg border border-[var(--color-border)] flex items-center justify-center"
                style={{ background: 'var(--color-panel)' }}
              >
                <Layers size={16} style={{ color: 'var(--color-text-muted)' }} />
              </div>
              <span style={{ color: 'var(--color-text-muted)', fontSize: 11 }}>
                {drawPileCount}
              </span>
            </div>

            {/* Pilha central */}
            <div className="flex flex-col items-center gap-1">
              {pile.length > 0 ? (
                <>
                  <CardComponent card={pile[pile.length - 1]} responsiveSmall />
                  <span style={{ color: 'var(--color-text-muted)', fontSize: 11 }}>
                    {pile.length} carta{pile.length !== 1 ? 's' : ''}
                  </span>
                </>
              ) : (
                <div
                  className="w-11 h-16 sm:w-14 sm:h-20 rounded-lg border-2 border-dashed flex items-center justify-center"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <span style={{ color: 'var(--color-text-muted)', fontSize: 10 }}>Mesa</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Minha area */}
        <div className="border-t border-[var(--color-border)] shrink-0 pb-3" style={{ background: 'var(--color-surface)' }}>
          {/* Info bar */}
          <div className="flex items-center gap-2 px-3 sm:px-4 pt-2.5 pb-1.5">
            <div
              className="w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0"
              style={{
                background: 'var(--color-panel)',
                borderColor: isMyTurn ? 'var(--color-accent-mid)' : 'var(--color-border)',
              }}
            >
              {isMyTurn && <Zap size={12} style={{ color: 'var(--color-accent-mid)' }} />}
            </div>
            <span style={{ color: 'var(--color-text-primary)', fontWeight: 500, fontSize: 14 }}>
              {user?.username ?? 'Você'}
            </span>
            {isMyTurn && (
              <span style={{ color: 'var(--color-accent-mid)', fontSize: 11, fontWeight: 600 }}>
                sua vez
              </span>
            )}
            <div className="ml-auto flex items-center gap-1.5">
              <Utensils size={11} style={{ color: 'var(--color-text-muted)' }} />
              <TokenDots count={myTokens} />
              <span style={{ color: 'var(--color-text-muted)', fontSize: 11 }}>
                · {myHand.length} cartas
              </span>
            </div>
          </div>

          {/* Mão */}
          <div
            className="flex gap-1 sm:gap-1.5 justify-center flex-nowrap overflow-x-auto overflow-y-visible px-2 pt-3 pb-1 [scrollbar-width:none] [touch-action:pan-x]"
            data-testid="player-hand"
          >
            {myHand.map((card, i) => (
              <CardComponent
                key={card.id}
                card={card}
                selected={selectedIndices.includes(i)}
                onClick={(isMyTurn || canPass) ? () => toggleCard(i) : undefined}
                disabled={!isMyTurn}
                responsiveSmall
              />
            ))}
          </div>

          {/* Botoes de acao */}
          {(isMyTurn || canPass) && (
            <div className="flex gap-2 justify-center px-3 pt-1" data-testid="game-action-bar">
              {isMyTurn && (
                <Button
                  variant="primary"
                  onClick={playSelected}
                  disabled={selectedIndices.length === 0 || !canPlay}
                  data-testid="game-action-play-btn"
                >
                  {selectedIndices.length > 0 ? `Jogar (${selectedIndices.length})` : 'Jogar'}
                </Button>
              )}
              {canPass && (
                <Button variant="secondary" onClick={pass} data-testid="game-action-pass-btn">
                  Passar
                </Button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
