import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Layers } from 'lucide-react';
import { AppNavbar } from '@/components/ui/AppNavbar';
import { Button } from '@/components/ui/button';
import { CardComponent } from '@/components/game/CardComponent';
import { TutorialOverlay } from '@/components/tutorial/TutorialOverlay';
import { useTutorialStore } from '@/stores/tutorialStore';
import { useAuthStore } from '@/stores/authStore';

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
  const drawnCard = useTutorialStore(s => s.drawnCard);
  const roundResult = useTutorialStore(s => s.roundResult);
  const winner = useTutorialStore(s => s.winner);

  const startGame = useTutorialStore(s => s.startGame);
  const toggleCard = useTutorialStore(s => s.toggleCard);
  const playSelected = useTutorialStore(s => s.playSelected);
  const pass = useTutorialStore(s => s.pass);
  const insertDrawnCard = useTutorialStore(s => s.insertDrawnCard);
  const discardDrawnCard = useTutorialStore(s => s.discardDrawnCard);
  const nextRound = useTutorialStore(s => s.nextRound);
  const reset = useTutorialStore(s => s.reset);

  useEffect(() => {
    startGame();
    return () => {
      reset();
    };
  }, []);

  const canPlay = useMemo(() => {
    if (selectedIndices.length === 0) return false;
    const selectedCards = selectedIndices.map(i => myHand[i]).filter(Boolean);
    if (selectedCards.length === 0) return false;
    if (pile.length === 0) return true;
    const selVal = Math.max(...selectedCards.map(c => c.value));
    const topVal = Math.max(...pile.map(c => c.value));
    if (selectedCards.length > pile.length) return true;
    if (selectedCards.length === pile.length && selVal > topVal) return true;
    return false;
  }, [selectedIndices, myHand, pile]);

  if (phase === 'IDLE') {
    return (
      <div
        className="h-dvh flex flex-col bg-[var(--color-base)]"
        style={{ background: 'var(--color-base)' }}
      >
        <AppNavbar back="/lobby" center={<span style={{ color: 'var(--color-text-primary)', fontWeight: 600, fontSize: 15 }}>Tutorial</span>} />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>Carregando...</p>
        </div>
      </div>
    );
  }

  if (phase === 'GAME_OVER') {
    return (
      <div className="h-dvh flex flex-col bg-[var(--color-base)]">
        <AppNavbar back="/lobby" center={<span style={{ color: 'var(--color-text-primary)', fontWeight: 600, fontSize: 15 }}>Tutorial</span>} />
        <TutorialOverlay />
        <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8 text-center">
          <p
            style={{
              color: 'var(--color-text-primary)',
              fontWeight: 700,
              fontSize: 22,
              fontFamily: 'var(--font-display)',
            }}
          >
            {winner === 'me' ? 'Você venceu!' : 'Bot venceu'}
          </p>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>
            Você já sabe o básico do Temakuri.
          </p>
          <div className="flex gap-3 flex-wrap justify-center">
            <Button variant="primary" onClick={() => navigate('/lobby')}>
              Ir para o Lobby
            </Button>
            <Button variant="secondary" onClick={() => startGame()}>
              Jogar de novo
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-dvh flex flex-col bg-[var(--color-base)] overflow-hidden">
      <AppNavbar
        back="/lobby"
        center={
          <span style={{ color: 'var(--color-text-primary)', fontWeight: 600, fontSize: 15 }}>
            Tutorial
          </span>
        }
      />

      <TutorialOverlay />

      <main className="flex-1 flex flex-col overflow-hidden pt-14">

        {/* Area do adversario */}
        <div
          className="flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border)]"
          style={{ background: 'var(--color-surface)' }}
        >
          <div
            className="w-10 h-10 rounded-full border border-[var(--color-border)] flex items-center justify-center shrink-0"
            style={{ background: 'var(--color-panel)' }}
          >
            <Bot size={20} style={{ color: 'var(--color-text-muted)' }} />
          </div>
          <div className="min-w-0">
            <div style={{ color: 'var(--color-text-primary)', fontWeight: 500, fontSize: 14 }}>
              Bot
            </div>
            <div style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>
              {botCardCount} cartas · {botTokens} pratos
            </div>
          </div>
          <div className="flex gap-1 ml-auto items-center">
            {Array.from({ length: Math.min(botCardCount, 6) }).map((_, i) => (
              <div
                key={i}
                className="w-8 h-12 rounded-md border border-[var(--color-border)]"
                style={{ background: 'var(--color-panel)' }}
              />
            ))}
            {botCardCount > 6 && (
              <span style={{ color: 'var(--color-text-muted)', fontSize: 11, alignSelf: 'center' }}>
                +{botCardCount - 6}
              </span>
            )}
          </div>
        </div>

        {/* Area central */}
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4">
          {phase === 'ROUND_END' && (
            <div className="flex flex-col items-center gap-4 p-8 text-center">
              <p style={{ color: 'var(--color-text-primary)', fontWeight: 600, fontSize: 16 }}>
                {roundResult?.iLost ? 'Você perdeu 1 prato' : 'Bot perdeu 1 prato'}
              </p>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>
                Você: {myTokens} pratos · Bot: {botTokens} pratos
              </p>
              <Button onClick={nextRound}>Próxima rodada</Button>
            </div>
          )}

          {phase === 'PASS_PICK' && drawnCard !== null && (
            <div className="flex flex-col items-center gap-4 w-full max-w-sm">
              <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>
                Onde inserir esta carta na sua mão?
              </p>
              <CardComponent card={drawnCard} />
              <div className="flex gap-1 items-center flex-wrap justify-center">
                {[...Array(myHand.length + 1)].map((_, idx) => (
                  <div key={idx} className="flex items-center gap-1">
                    <button
                      onClick={() => insertDrawnCard(idx)}
                      className="w-3 h-12 rounded-full transition-colors"
                      style={{
                        background: 'var(--color-border)',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-warning)';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-border)';
                      }}
                      aria-label={`Inserir na posição ${idx + 1}`}
                    />
                    {idx < myHand.length && (
                      <CardComponent card={myHand[idx]} small disabled />
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={discardDrawnCard}
                style={{ color: 'var(--color-text-muted)', fontSize: 12, background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Descartar
              </button>
            </div>
          )}

          {phase !== 'ROUND_END' && phase !== 'PASS_PICK' && (
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-center gap-1">
                <div
                  className="w-12 h-16 rounded-lg border border-[var(--color-border)] flex items-center justify-center"
                  style={{ background: 'var(--color-panel)' }}
                >
                  <Layers size={16} style={{ color: 'var(--color-text-muted)' }} />
                </div>
                <span style={{ color: 'var(--color-text-muted)', fontSize: 11 }}>
                  {drawPileCount} cartas
                </span>
              </div>

              <div className="flex flex-col items-center gap-1">
                {pile.length > 0 ? (
                  <>
                    <CardComponent card={pile[pile.length - 1]} small />
                    <span style={{ color: 'var(--color-text-muted)', fontSize: 11 }}>
                      {pile.length} carta{pile.length !== 1 ? 's' : ''}
                    </span>
                  </>
                ) : (
                  <div
                    className="w-12 h-16 rounded-lg border-2 border-dashed flex items-center justify-center"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    <span style={{ color: 'var(--color-text-muted)', fontSize: 10 }}>Mesa</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {phase === 'BOT_TURN' && (
            <p style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>
              Bot está pensando...
            </p>
          )}
        </div>

        {/* Minha area */}
        <div
          className="border-t border-[var(--color-border)] flex flex-col gap-2 pb-4"
          style={{ background: 'var(--color-surface)' }}
        >
          <div className="flex items-center gap-2 px-4 pt-3">
            <span style={{ color: 'var(--color-text-primary)', fontWeight: 500, fontSize: 14 }}>
              {user?.username ?? 'Você'}
            </span>
            <span style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>
              {myHand.length} cartas · {myTokens} pratos
            </span>
          </div>

          {phase !== 'PASS_PICK' && phase !== 'ROUND_END' && (
            <div
              className="flex gap-1 sm:gap-1.5 justify-center flex-wrap px-2"
              data-testid="player-hand"
            >
              {myHand.map((card, i) => (
                <CardComponent
                  key={card.id}
                  card={card}
                  selected={selectedIndices.includes(i)}
                  onClick={phase === 'MY_TURN' ? () => toggleCard(i) : undefined}
                  disabled={phase !== 'MY_TURN'}
                  responsiveSmall
                />
              ))}
            </div>
          )}

          {phase === 'MY_TURN' && (
            <div
              className="flex gap-2 justify-center px-3"
              data-testid="game-action-bar"
            >
              <Button
                variant="primary"
                onClick={playSelected}
                disabled={selectedIndices.length === 0 || !canPlay}
                data-testid="game-action-play-btn"
              >
                {selectedIndices.length > 0
                  ? `Jogar (${selectedIndices.length})`
                  : 'Jogar'}
              </Button>
              <Button
                variant="secondary"
                onClick={pass}
                data-testid="game-action-pass-btn"
              >
                Passar{drawPileCount > 0 ? ' (+1)' : ''}
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
