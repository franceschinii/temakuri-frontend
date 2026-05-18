import { useEffect, useState } from 'react';
import { ChevronDown, Mail } from 'lucide-react';
import { AppNavbar } from '@/components/ui/AppNavbar';
import { DevFooter } from '@/components/ui/DevFooter';
import { useAuthStore } from '@/stores/authStore';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ: FaqItem[] = [
  {
    question: 'Como funciona o jogo?',
    answer: 'O Temakuri é um jogo de cartas para 2 a 6 jogadores. Cada jogador recebe 8 cartas e o objetivo é esvaziar a mão antes dos outros. No seu turno, você joga cartas adjacentes de mesmo valor que superem a jogada anterior — mais cartas, ou o mesmo número com valor maior. Se não conseguir, passa a vez e compra uma carta do monte. Quem sobrar com cartas ao final da rodada perde 1 prato. Sem pratos, está fora.',
  },
  {
    question: 'O que são pratos?',
    answer: 'Pratos são suas vidas na partida. Cada jogador começa com 2 pratos (configurável pelo host da sala). Você perde 1 prato quando é o último com cartas na mão ao final de uma rodada. Quando seus pratos acabam, você perde o jogo. Todos os outros são considerados vencedores.',
  },
  {
    question: 'O que é o modo Duelo?',
    answer: 'Quando restam apenas 2 jogadores em uma rodada, o jogo entra em modo Duelo. Cada jogador recebe 2 "Pratos do Dia" — cartas especiais de mesa. Ao passar a vez, você pega um Prato do Dia em vez de comprar do monte. Se não tiver mais Pratos do Dia, você perde a rodada automaticamente.',
  },
  {
    question: 'O que é Sabor?',
    answer: 'Sabor é um combo especial ativado quando alguém joga 2 ou mais cartas da mesma categoria (ex: todas sushi, todas ramen). Quando o Sabor está ativo, todos os jogadores precisam jogar pelo menos aquela quantidade de cartas até alguém quebrar o combo jogando categorias misturadas.',
  },
  {
    question: 'Como ganho moedas?',
    answer: 'Você ganha moedas ao concluir partidas. Todos os jogadores que não perderem recebem moedas — só o último a perder os pratos recebe menos. Em partidas 1v1 ranqueadas o valor é maior. Moedas são usadas na loja para comprar avatares e desbloquear modos como Mercado e Rodízio.',
  },
  {
    question: 'O que são diamantes?',
    answer: 'Diamantes são a moeda premium do jogo, adquirida na loja com pagamento real. Servem para comprar itens exclusivos e plano Premium. O pagamento é processado com segurança pelo Mercado Pago.',
  },
  {
    question: 'Posso jogar como convidado?',
    answer: 'Sim. Na tela inicial você pode entrar com um nome temporário sem criar conta. Convidados podem jogar normalmente, mas não acumulam XP, moedas, histórico ou itens da loja. Para salvar seu progresso, crie uma conta gratuita.',
  },
  {
    question: 'Como funciona o matchmaking?',
    answer: 'Clique em "Buscar" no lobby. O sistema coloca você em uma fila e encontra automaticamente outro jogador disponível. Quando o match é formado, ambos são direcionados para uma sala e a partida começa assim que os dois confirmarem.',
  },
  {
    question: 'Como criar uma sala privada?',
    answer: 'No lobby, clique em "Criar Sala" e marque a opção "Privada". Sua sala não aparecerá na lista pública — compartilhe o código com seus amigos para que eles entrem pelo campo "Entrar com código".',
  },
  {
    question: 'A música não está tocando. O que faço?',
    answer: 'Navegadores bloqueiam áudio até que o usuário interaja com a página. Clique em qualquer lugar da tela e a música deve iniciar. Se ainda assim não tocar, verifique se o som e a música estão ativados nas configurações (ícone de engrenagem na barra superior).',
  },
  {
    question: 'Minha conta foi suspensa. O que aconteceu?',
    answer: 'Suspensões em partidas ranqueadas ocorrem quando o jogador abandona partidas repetidamente. Após um número de advertências, o acesso ao modo ranqueado é temporariamente bloqueado. A suspensão expira automaticamente. Para recorrer, entre em contato pelo e-mail de suporte.',
  },
  {
    question: 'Como cancelo o plano Premium?',
    answer: 'Acesse seu perfil, clique em "Gerenciar assinatura" e selecione cancelar. O cancelamento é imediato e você mantém os benefícios até o fim do período já pago. Para reembolsos, entre em contato com o suporte dentro de 7 dias da cobrança.',
  },
];

function FaqEntry({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[var(--color-border)]">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-4 py-4 text-left"
      >
        <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
          {item.question}
        </span>
        <ChevronDown
          size={16}
          style={{
            color: 'var(--color-text-muted)',
            flexShrink: 0,
            transition: 'transform 0.2s',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>
      {open && (
        <p className="pb-4 text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
          {item.answer}
        </p>
      )}
    </div>
  );
}

declare global {
  interface Window {
    fcWidget?: {
      setExternalId: (id: string) => void;
      user: {
        setFirstName: (name: string) => void;
        setEmail: (email: string) => void;
        setProperties: (props: Record<string, string>) => void;
      };
    };
  }
}

export default function SupportPage() {
  const user = useAuthStore(s => s.user);

  useEffect(() => {
    // Evita carregar duas vezes se navegar para a pagina mais de uma vez
    if (document.getElementById('freshworks-widget')) return;

    const script = document.createElement('script');
    script.id = 'freshworks-widget';
    script.src = '//fw-cdn.com/16336684/7183433.js';
    script.setAttribute('chat', 'true');
    script.async = true;

    script.onload = () => {
      if (!window.fcWidget) return;
      if (user?.id) {
        window.fcWidget.setExternalId(String(user.id));
      }
      if (user?.username) {
        window.fcWidget.user.setFirstName(user.username);
      }
      if (user?.email) {
        window.fcWidget.user.setEmail(user.email);
      }

      // Remove o fundo branco que o Freshchat injeta no container do launcher.
      // O iframe em si nao e acessivel (cross-origin), mas o wrapper externo e.
      const patchFrame = () => {
        const frame = document.getElementById('fc_frame') as HTMLElement | null;
        if (frame) {
          frame.style.background = 'transparent';
          frame.style.boxShadow = 'none';
          const parent = frame.parentElement;
          if (parent) {
            parent.style.background = 'transparent';
            parent.style.boxShadow = 'none';
          }
        }
      };
      // Tenta imediatamente e repete ate o frame ser injetado
      patchFrame();
      const interval = setInterval(() => {
        if (document.getElementById('fc_frame')) {
          patchFrame();
          clearInterval(interval);
        }
      }, 200);
    };

    document.body.appendChild(script);

    return () => {
      const el = document.getElementById('freshworks-widget');
      if (el) document.body.removeChild(el);
      document.getElementById('fc_frame')?.remove();
    };
  }, []);

  return (
    <div
      className="min-h-dvh flex flex-col"
      style={{ background: 'var(--color-base)', color: 'var(--color-text-primary)' }}
    >
      <AppNavbar
        back="/lobby"
        center={<span style={{ color: 'var(--color-text-primary)', fontWeight: 600, fontSize: 15 }}>Suporte</span>}
      />

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-6 flex flex-col gap-6">

        {/* Hero */}
        <div>
          <h1 className="text-3xl font-bold mb-1" style={{ fontFamily: 'var(--font-display)' }}>
            Suporte
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
            Encontrou um problema ou tem dúvidas? Estamos aqui para ajudar.
          </p>
        </div>

        {/* FAQ */}
        <section>
          <h2 className="text-base font-semibold mb-4">Perguntas frequentes</h2>
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 divide-y-0">
            {FAQ.map(item => (
              <FaqEntry key={item.question} item={item} />
            ))}
          </div>
        </section>

        {/* Contato por email */}
        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 flex gap-4 items-start">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'var(--color-panel)' }}
          >
            <Mail size={18} style={{ color: 'var(--color-accent-mid)' }} />
          </div>
          <div>
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
              Fale por e-mail
            </p>
            <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--color-text-muted)' }}>
              Para problemas com conta, pagamentos ou qualquer outro assunto que o chat não resolva, envie um e-mail descrevendo o problema. Respondemos em até 48 horas úteis.
            </p>
            <a
              href="mailto:contato@andrefranceschini.com.br"
              className="text-sm font-medium transition-colors"
              style={{ color: 'var(--color-accent-mid)' }}
            >
              contato@andrefranceschini.com.br
            </a>
          </div>
        </section>

      </main>

      <DevFooter />
    </div>
  );
}
