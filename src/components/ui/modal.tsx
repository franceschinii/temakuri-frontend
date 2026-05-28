import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  onClose?: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  testId?: string;
}

export function Modal({ open, onClose, title, description, children, className, testId }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose?.()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-110 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          data-testid={testId}
          className={cn(
            'fixed left-1/2 top-1/2 z-120 w-[calc(100vw-2rem)] max-w-md max-h-[90dvh] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-panel shadow-2xl flex flex-col overflow-hidden',
            'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            className,
          )}
        >
          {title ? (
            <div className="flex items-center justify-between px-6 pt-6 pb-3 shrink-0">
              <Dialog.Title className="text-lg font-semibold text-[var(--color-text-primary)]">
                {title}
              </Dialog.Title>
              {onClose && (
                <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">
                  <X size={18} />
                </button>
              )}
            </div>
          ) : (
            <VisuallyHidden asChild>
              <Dialog.Title>Modal</Dialog.Title>
            </VisuallyHidden>
          )}
          {description ? (
            <Dialog.Description className="px-6 pb-3 text-sm text-[var(--color-text-muted)] shrink-0">
              {description}
            </Dialog.Description>
          ) : (
            <VisuallyHidden asChild>
              <Dialog.Description>{title ?? 'Conteúdo da janela'}</Dialog.Description>
            </VisuallyHidden>
          )}
          <div className={cn('overflow-y-auto px-6 pb-6 flex-1 min-h-0', !title && !description && 'pt-6')}>
            {children}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
