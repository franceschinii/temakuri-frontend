import { AnimatePresence, motion } from 'framer-motion';
import { GraduationCap, X } from 'lucide-react';
import { useTutorialFlow } from '@/hooks/useTutorialFlow';

export function TutorialOverlay() {
  const { currentStep, dismiss } = useTutorialFlow();

  return (
    <AnimatePresence>
      {currentStep && (
        <motion.div
          key={currentStep.id}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          style={{
            position: 'fixed',
            top: 56,
            left: 0,
            right: 0,
            zIndex: 500,
            padding: '0 16px',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 12,
              padding: '12px 16px',
              maxWidth: 480,
              margin: '0 auto',
              pointerEvents: 'auto',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              display: 'flex',
              gap: 12,
              alignItems: 'flex-start',
            }}
          >
            <div style={{ color: 'var(--color-accent-mid)', flexShrink: 0, paddingTop: 2 }}>
              <GraduationCap size={18} />
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  color: 'var(--color-text-primary)',
                  fontWeight: 600,
                  fontSize: 13,
                  marginBottom: 3,
                }}
              >
                {currentStep.title}
              </div>
              <div
                style={{
                  color: 'var(--color-text-muted)',
                  fontSize: 12,
                  lineHeight: 1.5,
                }}
              >
                {currentStep.text}
              </div>
            </div>
            <button
              onClick={dismiss}
              style={{
                color: 'var(--color-text-muted)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 2,
                flexShrink: 0,
              }}
              aria-label="Fechar dica"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
