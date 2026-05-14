import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wine, ShoppingBag, HelpCircle, Info, User, LogOut, ArrowLeft, ShieldCheck } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { CoinDisplay } from '@/components/ui/CoinDisplay';
import { DiamondDisplay } from '@/components/ui/DiamondDisplay';
import { AccessBar } from '@/components/ui/AccessBar';
import { ShopModal } from '@/components/shop/ShopModal';
import { HelpModal } from '@/components/lobby/HelpModal';
import { LogoutConfirmDialog } from '@/components/ui/LogoutConfirmDialog';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

interface AppNavbarProps {
  /**
   * Slot opcional para conteudo customizado no centro (ex: titulo da tela,
   * tabs, breadcrumbs). Se omitido, fica vazio.
   */
  center?: ReactNode;

  /**
   * Mostra botao de "voltar" antes do logo. Se for string, e um path. Se for
   * `true`, navega pra /lobby (default). Se for funcao, usa onClick.
   */
  back?: string | boolean | (() => void);

  /**
   * Se true, o RulesDialog (Como jogar) tambem aparece. So faz sentido fora
   * da partida e fora do lobby da sala (in-game ja tem RulesDialog no proprio
   * GameBoard via componente). Default false.
   */
  showRulesButton?: boolean;

  /**
   * Por padrao, o nome de usuario aparece. Pode esconder em telas muito
   * pequenas (admin com muitos botoes, p.ex).
   */
  hideUsername?: boolean;

  /**
   * Callback do botao "Como jogar" — quando passado, mostra o botao ao lado
   * do logo na esquerda. So usado no lobby (RulesDialog detalhado nao faz
   * sentido in-game ou em telas administrativas).
   */
  onHowToPlay?: () => void;

  /**
   * Quando true, no mobile (<sm) esconde tudo do grupo direito que nao seja
   * essencial: moedas, premium, loja, info, AccessBar, admin e perfil ficam
   * agrupados em hidden sm:flex. Voltar, center e sair seguem visiveis.
   * In-game usa isso para liberar espaco da navbar e nao quebrar o layout.
   */
  mobileMinimal?: boolean;

  /**
   * Slot opcional que aparece SOMENTE no mobile (<sm), posicionado entre o
   * grupo de extras (escondido por mobileMinimal) e o botao Sair. Usado pelo
   * GameBoard para injetar gatilhos de chat e historico que migraram dos
   * paineis flutuantes. No desktop (sm+) este wrapper some via sm:hidden, sem
   * afetar o layout existente.
   */
  mobileExtraActions?: ReactNode;
}

/**
 * Navbar unica do app. Usada em: lobby, lobby da sala, in-game, perfil,
 * ranked, admin. Auth telas tem layout proprio.
 */
export function AppNavbar({ center, back, hideUsername, onHowToPlay, mobileMinimal, mobileExtraActions }: AppNavbarProps) {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const [shopOpen, setShopOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const handleConfirmLogout = async () => {
    await logout();
    setLogoutOpen(false);
    navigate('/');
  };

  // Quando mobileMinimal e true, agrupa extras (moedas, loja, info, AccessBar,
  // admin, perfil) num wrapper que some no mobile e reaparece em sm+.
  const extrasGroupClass = cn('items-center gap-0.5', mobileMinimal ? 'hidden sm:flex' : 'flex');

  const handleBack = () => {
    if (typeof back === 'function') return back();
    if (typeof back === 'string') return navigate(back);
    navigate('/lobby');
  };

  return (
    <>
      <header className="relative border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur-sm px-4 sm:px-6 py-3 flex items-center justify-between shrink-0 z-20 gap-3">
        {/* Esquerda: voltar + logo */}
        <div className="flex items-center gap-2.5 min-w-0">
          {back !== undefined && back !== false && (
            <button
              onClick={handleBack}
              className="p-1.5 rounded-lg transition-colors hover:bg-[var(--color-panel)]"
              style={{ color: 'var(--color-text-muted)' }}
              title="Voltar"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <button
            onClick={() => navigate('/lobby')}
            className="flex items-center gap-2.5 min-w-0 shrink-0 hover:opacity-80 transition-opacity"
            title="Ir para o lobby"
          >
            <Logo variant="mark" size={22} />
            <span
              className="text-lg font-semibold tracking-wide hidden sm:inline"
              style={{ color: 'var(--color-accent-soft)', fontFamily: 'var(--font-display)' }}
            >
              Temakuri
            </span>
          </button>
          {onHowToPlay && (
            <button
              onClick={onHowToPlay}
              className={cn(
                'p-1.5 rounded-lg transition-colors hover:bg-[var(--color-panel)]',
                // In-game mobile (mobileMinimal=true) ja tem HelpCircle nos
                // mobileExtraActions. Esconder o botao ao lado do logo no
                // mobile pra nao duplicar; desktop sempre visivel.
                mobileMinimal ? 'hidden sm:block' : 'block',
              )}
              style={{ color: 'var(--color-text-muted)' }}
              title="Como jogar"
              aria-label="Como jogar"
            >
              <HelpCircle size={16} />
            </button>
          )}
        </div>

        {/* Centro: slot customizado.
            Mobile (<sm): fica no fluxo flex, dividindo espaco entre esquerda
            e direita. Desktop (sm+): centralizado absoluto na tela toda, para
            nao sofrer com a assimetria entre lado esquerdo (curto) e lado
            direito (muitos botoes). */}
        {center && (
          <div className="flex-1 flex items-center justify-center min-w-0 sm:hidden">
            {center}
          </div>
        )}
        {center && (
          <div className="hidden sm:flex absolute left-1/2 top-0 -translate-x-1/2 h-full items-center justify-center pointer-events-none max-w-[min(60vw,720px)]">
            <div className="pointer-events-auto flex items-center justify-center min-w-0">
              {center}
            </div>
          </div>
        )}

        {/* Direita: acoes universais */}
        <div className="flex items-center gap-0.5">
          {/* Grupo de extras — colapsa no mobile quando mobileMinimal */}
          <div className={extrasGroupClass}>
            {/* Moedas */}
            {!user?.isGuest && (
              <span className="px-1.5" data-testid="access-bar-coins">
                <CoinDisplay amount={user?.coins ?? 0} size="sm" />
              </span>
            )}
            {/* Diamantes (moeda premium) */}
            {!user?.isGuest && (
              <span className="px-1.5" data-testid="access-bar-diamonds">
                <DiamondDisplay amount={user?.diamonds ?? 0} size="sm" />
              </span>
            )}
            {/* Premium badge */}
            {user?.isPremium && (
              <span title="Premium" className="p-1.5" style={{ color: 'oklch(75% 0.2 310)' }}>
                <Wine size={16} />
              </span>
            )}
            {/* Loja */}
            {!user?.isGuest && (
              <button
                onClick={() => setShopOpen(true)}
                className="p-1.5 rounded-lg transition-colors hover:bg-[var(--color-panel)]"
                style={{ color: 'var(--color-text-muted)' }}
                title="Loja"
                data-testid="access-bar-shop-btn"
              >
                <ShoppingBag size={16} />
              </button>
            )}
            {/* Como funciona */}
            <button
              onClick={() => setHelpOpen(true)}
              className="p-1.5 rounded-lg transition-colors hover:bg-[var(--color-panel)]"
              style={{ color: 'var(--color-text-muted)' }}
              title="Como funciona"
            >
              <Info size={17} />
            </button>
            {/* Som + Música */}
            <AccessBar />
            {/* Admin */}
            {user?.isAdmin && (
              <button
                onClick={() => navigate('/admin')}
                className="flex items-center gap-1.5 text-xs font-medium transition-colors px-2 py-1.5 rounded-lg hover:bg-[var(--color-panel)]"
                style={{ color: 'var(--color-warning)' }}
                title="Admin"
                aria-label="Admin"
              >
                <ShieldCheck size={16} />
                <span className="hidden sm:inline">Admin</span>
              </button>
            )}
            {/* Perfil */}
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center gap-1.5 text-sm transition-colors px-1.5 py-1.5 rounded-lg hover:bg-[var(--color-panel)]"
              style={{ color: 'var(--color-text-muted)' }}
              title={user?.username ?? 'Perfil'}
              data-testid="access-bar-profile-link"
            >
              <User size={16} />
              {!hideUsername && (
                <span className="hidden sm:inline" data-testid="access-bar-username">{user?.username}</span>
              )}
            </button>
          </div>
          {/* Slot extra — somente mobile (<sm). No desktop some via sm:hidden. */}
          {mobileExtraActions && (
            <div className="flex sm:hidden items-center gap-0.5">
              {mobileExtraActions}
            </div>
          )}
          {/* Sair — sempre visivel, sempre vermelho, com confirmacao */}
          <button
            onClick={() => setLogoutOpen(true)}
            className="p-1.5 rounded-lg transition-colors hover:bg-[var(--color-danger)]/10"
            style={{ color: 'var(--color-danger)' }}
            title="Sair"
            data-testid="access-bar-logout-btn"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <ShopModal open={shopOpen} onClose={() => setShopOpen(false)} />
      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
      <LogoutConfirmDialog
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={handleConfirmLogout}
      />
    </>
  );
}
