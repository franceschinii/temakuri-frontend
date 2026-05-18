import { AnimatePresence, motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';
import { useTutorialFlow } from '@/hooks/useTutorialFlow';
import { useTutorialStore } from '@/stores/tutorialStore';

export function TutorialOverlay() {
  const { currentStep, allowedAction } = useTutorialFlow();
  const advance = useTutorialStore(s => s.advanceFromOverlay);

  if (!currentStep) return null;

  const showCta = allowedAction.type === 'overlay-click';

  return (
    <AnimatePresence>
      <motion.div
        key={currentStep.id}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -20, opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        style={{
          position: 'fixed',
          top: 'calc(var(--navbar-height, 56px) + 8px)',
          left: 0,
          right: 0,
          zIndex: 500,
          padding: '0 12px',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 14,
            padding: '14px 18px',
            maxWidth: 520,
            margin: '0 auto',
            pointerEvents: 'auto',
            boxShadow: '0 6px 28px rgba(0,0,0,0.35)',
            display: 'flex',
            gap: 14,
            alignItems: 'flex-start',
          }}
        >
          <div style={{ color: 'var(--color-accent-mid)', flexShrink: 0, paddingTop: 2 }}>
            <GraduationCap size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                color: 'var(--color-text-primary)',
                fontWeight: 600,
                fontSize: 15,
                marginBottom: 5,
              }}
            >
              {currentStep.title}
            </div>
            <div
              style={{
                color: 'var(--color-text-muted)',
                fontSize: 13,
                lineHeight: 1.6,
              }}
            >
              {currentStep.text}
            </div>
            {showCta && allowedAction.type === 'overlay-click' && (
              <button
                onClick={advance}
                style={{
                  marginTop: 10,
                  background: 'var(--color-accent-mid)',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: 13,
                  padding: '6px 14px',
                  borderRadius: 8,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {allowedAction.ctaLabel}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
