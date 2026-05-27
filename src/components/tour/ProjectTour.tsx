import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface TourStep {
  selector: string;
  title: string;
  text: string;
  placement: 'top' | 'bottom' | 'left' | 'right';
}

const STEPS: TourStep[] = [
  {
    selector: '[data-tour="tour-logo"]',
    title: 'Bem-vindo ao Temakuri',
    text: 'Este é o seu centro de comando. Daqui você cria salas, entra em partidas e acompanha tudo que acontece no jogo.',
    placement: 'bottom',
  },
  {
    selector: '[data-tour="tour-create-room"]',
    title: 'Criar uma sala',
    text: 'Clique aqui para abrir uma sala nova. Você escolhe o modo de jogo, número de jogadores e se quer deixar pública ou só para convidados.',
    placement: 'bottom',
  },
  {
    selector: '[data-tour="tour-join-code"]',
    title: 'Entrar com código',
    text: 'Recebeu um código de um amigo? Cole aqui e entre direto na sala dele.',
    placement: 'bottom',
  },
  {
    selector: '[data-tour="tour-matchmaking"]',
    title: 'Busca automática',
    text: 'Quer jogar rápido? Clique aqui e o jogo encontra um adversário para você automaticamente.',
    placement: 'bottom',
  },
  {
    selector: '[data-tour="tour-rooms-list"]',
    title: 'Salas abertas',
    text: 'Salas públicas aparecem aqui em tempo real. Clique em qualquer uma para entrar.',
    placement: 'top',
  },
  {
    selector: '[data-tour="tour-how-to-play"]',
    title: 'Regras do jogo',
    text: 'Clique aqui sempre que quiser rever as regras completas do Temakuri.',
    placement: 'bottom',
  },
  {
    selector: '[data-tour="tour-help-icon"]',
    title: 'Como funciona',
    text: 'Aqui ficam informações sobre moedas, ranks, bordas e ícones do jogo.',
    placement: 'bottom',
  },
];

interface ProjectTourProps {
  open: boolean;
  onClose: () => void;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
  bottom: number;
  right: number;
}

const EMPTY_RECT: Rect = { top: 0, left: 0, width: 0, height: 0, bottom: 0, right: 0 };

export function ProjectTour({ open, onClose }: ProjectTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [rect, setRect] = useState<Rect>(EMPTY_RECT);
  const retryRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const clearRetry = () => {
    if (retryRef.current) {
      clearInterval(retryRef.current);
      retryRef.current = null;
    }
  };

  const applyRect = (el: Element) => {
    const r = el.getBoundingClientRect();
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height, bottom: r.bottom, right: r.right });
  };

  useEffect(() => {
    if (!open) return;

    setCurrentStep(0);
    setRect(EMPTY_RECT);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    clearRetry();

    const step = STEPS[currentStep];
    if (!step) return;

    let attempts = 0;

    const tryFind = () => {
      const el = document.querySelector(step.selector);
      if (el) {
        clearRetry();
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });

        setTimeout(() => {
          applyRect(el);

          if (resizeObserverRef.current) resizeObserverRef.current.disconnect();
          resizeObserverRef.current = new ResizeObserver(() => applyRect(el));
          resizeObserverRef.current.observe(el);
        }, 300);
      } else {
        attempts++;
        if (attempts >= 10) clearRetry();
      }
    };

    tryFind();
    retryRef.current = setInterval(tryFind, 100);

    return () => {
      clearRetry();
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
    };
  }, [open, currentStep]);

  useEffect(() => {
    if (!open) return;

    const handleResize = () => {
      const step = STEPS[currentStep];
      if (!step) return;
      const el = document.querySelector(step.selector);
      if (el) applyRect(el);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [open, currentStep]);

  const step = STEPS[currentStep];
  const pad = 6;

  const getTooltipPosition = (): React.CSSProperties => {
    if (!step || rect.width === 0) return { top: 100, left: 100 };

    const tooltipWidth = 320;
    const tooltipOffset = 12;

    if (step.placement === 'bottom') {
      const rawLeft = rect.left + rect.width / 2 - tooltipWidth / 2;
      const left = Math.max(12, Math.min(rawLeft, window.innerWidth - tooltipWidth - 12));
      return { top: rect.bottom + pad + tooltipOffset, left };
    }

    if (step.placement === 'top') {
      const rawLeft = rect.left + rect.width / 2 - tooltipWidth / 2;
      const left = Math.max(12, Math.min(rawLeft, window.innerWidth - tooltipWidth - 12));
      return { bottom: window.innerHeight - rect.top + pad + tooltipOffset, left };
    }

    if (step.placement === 'right') {
      const top = Math.max(12, rect.top + rect.height / 2 - 60);
      return { top, left: rect.right + pad + tooltipOffset };
    }

    if (step.placement === 'left') {
      const top = Math.max(12, rect.top + rect.height / 2 - 60);
      const right = window.innerWidth - rect.left + pad + tooltipOffset;
      return { top, right };
    }

    return { top: 100, left: 100 };
  };

  const tooltipStyle: React.CSSProperties = {
    position: 'fixed',
    zIndex: 9999,
    width: '100%',
    maxWidth: 320,
    minWidth: 220,
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 14,
    padding: 16,
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    ...getTooltipPosition(),
  };

  return createPortal(
    <AnimatePresence>
      {open && step && (
        <>
          {/* Bloqueia cliques em qualquer elemento da página por baixo do tour */}
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9997,
            }}
          />
          <div
            style={{
              position: 'fixed',
              top: rect.top - pad,
              left: rect.left - pad,
              width: rect.width + pad * 2,
              height: rect.height + pad * 2,
              borderRadius: 10,
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.72)',
              zIndex: 9998,
              pointerEvents: 'none',
              transition: 'top 0.25s ease, left 0.25s ease, width 0.25s ease, height 0.25s ease',
            }}
          />

          <AnimatePresence mode="wait">
            <motion.div
              key={`tour-step-${currentStep}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.18 }}
              style={tooltipStyle}
            >
              <div style={{ color: 'var(--color-text-muted)', fontSize: 11, marginBottom: 8 }}>
                {currentStep + 1} de {STEPS.length}
              </div>
              <div style={{ color: 'var(--color-text-primary)', fontWeight: 600, marginBottom: 4, fontSize: 14 }}>
                {step.title}
              </div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: 13, lineHeight: 1.5, marginBottom: 14 }}>
                {step.text}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  onClick={onClose}
                  style={{ color: 'var(--color-text-muted)', fontSize: 12, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  Pular tour
                </button>
                <div style={{ display: 'flex', gap: 8 }}>
                  {currentStep > 0 && (
                    <button
                      onClick={() => setCurrentStep(s => s - 1)}
                      className="inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 bg-[var(--color-panel)] text-[var(--color-text-primary)] border border-[var(--color-border)] hover:bg-[var(--color-surface)] active:scale-95 h-8 px-3 text-sm select-none"
                    >
                      Anterior
                    </button>
                  )}
                  {currentStep < STEPS.length - 1 ? (
                    <button
                      onClick={() => setCurrentStep(s => s + 1)}
                      className="inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 bg-[var(--color-accent-strong)] text-[var(--color-on-accent)] hover:bg-[var(--color-accent-mid)] active:scale-95 h-8 px-3 text-sm select-none"
                    >
                      Próximo
                    </button>
                  ) : (
                    <button
                      onClick={onClose}
                      className="inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 bg-[var(--color-accent-strong)] text-[var(--color-on-accent)] hover:bg-[var(--color-accent-mid)] active:scale-95 h-8 px-3 text-sm select-none"
                    >
                      Concluir
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
