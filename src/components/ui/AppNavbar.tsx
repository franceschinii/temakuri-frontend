import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wine, ShoppingBag, HelpCircle, Info, User, LogOut, ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { CoinDisplay } from '@/components/ui/CoinDisplay';
import { AccessBar } from '@/components/ui/AccessBar';
import { ShopModal } from '@/components/shop/ShopModal';
import { HelpModal } from '@/components/lobby/HelpModal';
import { useAuthStore } from '@/stores/authStore';

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
}

/**
 * Navbar unica do app. Usada em: lobby, lobby da sala, in-game, perfil,
 * ranked, admin. Auth telas tem layout proprio.
 */
export function AppNavbar({ center, back, hideUsername, onHowToPlay }: AppNavbarProps) {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const [shopOpen, setShopOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const handleBack = () => {
    if (typeof back === 'function') return back();
    if (typeof back === 'string') return navigate(back);
    navigate('/lobby');
  };

  return (
    <>
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur-sm px-4 sm:px-6 py-3 flex items-center justify-between shrink-0 z-20 gap-3">
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
              className="p-1.5 rounded-lg transition-colors hover:bg-[var(--color-panel)] flex items-center gap-1.5"
              style={{ color: 'var(--color-text-muted)' }}
              title="Como jogar"
            >
              <HelpCircle size={16} />
              <span className="text-xs hidden md:inline">Como jogar</span>
            </button>
          )}
        </div>

        {/* Centro: slot customizado */}
        {center && (
          <div className="flex-1 flex items-center justify-center min-w-0">
            {center}
          </div>
        )}

        {/* Direita: acoes universais */}
        <div className="flex items-center gap-0.5">
          {/* Moedas */}
          {!user?.isGuest && (
            <span className="px-1.5" data-testid="access-bar-coins">
              <CoinDisplay amount={user?.coins ?? 0} size="sm" />
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
              className="text-xs transition-colors px-2 py-1 rounded-lg hover:bg-[var(--color-panel)] hidden sm:block"
              style={{ color: 'var(--color-warning)' }}
            >
              Admin
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
          {/* Sair */}
          <button
            onClick={() => logout().then(() => navigate('/'))}
            className="p-1.5 rounded-lg transition-colors hover:bg-[var(--color-panel)]"
            style={{ color: 'var(--color-text-muted)' }}
            title="Sair"
            data-testid="access-bar-logout-btn"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <ShopModal open={shopOpen} onClose={() => setShopOpen(false)} />
      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  );
}
