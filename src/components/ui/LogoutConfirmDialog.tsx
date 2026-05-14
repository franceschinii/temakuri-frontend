import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';

interface LogoutConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
}

export function LogoutConfirmDialog({ open, onClose, onConfirm }: LogoutConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Sair da conta?"
      description="Você precisará entrar novamente para continuar jogando."
      testId="logout-confirm-dialog"
    >
      <div className="flex gap-2 justify-end pt-2">
        <Button variant="secondary" type="button" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="danger" type="button" onClick={() => void onConfirm()}>
          Sair
        </Button>
      </div>
    </Modal>
  );
}
