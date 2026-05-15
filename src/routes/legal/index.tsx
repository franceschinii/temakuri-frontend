import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { DevFooter } from '@/components/ui/DevFooter';

const UPDATED_AT = '15 de maio de 2026';

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="flex flex-col gap-2 scroll-mt-6">
      <h2 className="text-base font-semibold text-[var(--color-text-primary)]" style={{ fontFamily: 'var(--font-display)' }}>
        {title}
      </h2>
      <div className="flex flex-col gap-2 text-sm leading-relaxed text-[var(--color-text-muted)]">
        {children}
      </div>
    </section>
  );
}

export default function LegalPage() {
  return (
    <div className="min-h-dvh bg-[var(--color-base)] flex flex-col">
      <div className="flex-1 w-full max-w-2xl mx-auto px-5 py-8 flex flex-col gap-8">
        <div className="flex items-center justify-between gap-4">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            <ArrowLeft size={15} /> Voltar
          </Link>
          <Logo className="h-7 w-auto opacity-80" />
        </div>

        <header className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-[var(--color-text-primary)]" style={{ fontFamily: 'var(--font-display)' }}>
            Termos de Uso e Política de Privacidade
          </h1>
          <p className="text-xs text-[var(--color-text-muted)]">Última atualização: {UPDATED_AT}</p>
        </header>

        <Section id="responsavel" title="1. Quem opera o Temakuri">
          <p>
            O Temakuri é um jogo de cartas on-line operado por <strong className="text-[var(--color-text-primary)]">André Franceschini</strong>,
            pessoa física, de forma independente. Não se trata de empresa ou pessoa jurídica.
          </p>
          <p>
            Contato geral e para assuntos de privacidade/proteção de dados (LGPD):{' '}
            <a href="mailto:contato@andrefranceschini.com.br" className="text-[var(--color-accent-mid)] hover:underline">
              contato@andrefranceschini.com.br
            </a>.
          </p>
        </Section>

        <Section id="termos" title="2. Termos de Uso">
          <p>
            Ao criar uma conta (incluindo conta de convidado) ou utilizar o Temakuri, você concorda com estes Termos.
            Se não concordar, não utilize o serviço.
          </p>
          <p>
            O serviço é fornecido "no estado em que se encontra", sem garantias de disponibilidade ininterrupta,
            ausência de erros ou adequação a um propósito específico. O operador pode alterar, suspender ou
            descontinuar funcionalidades a qualquer momento, buscando avisar quando possível.
          </p>
          <p>
            Você é responsável pela atividade na sua conta. É proibido usar o serviço para fraude, abuso de outros
            jogadores, exploração de falhas, automação não autorizada ou qualquer conduta ilegal. Contas que violem
            estas regras podem ser suspensas ou removidas.
          </p>
          <p>
            Compras de itens virtuais (diamantes, assinatura Premium, temas e demais conteúdos) são processadas por
            provedor de pagamento terceiro (Mercado Pago). Itens virtuais não têm valor monetário fora do jogo, não
            são transferíveis e não são resgatáveis em dinheiro. Reembolsos seguem a legislação aplicável e as regras
            do provedor de pagamento; em caso de dúvida, entre em contato pelo e-mail acima.
          </p>
        </Section>

        <Section id="privacidade" title="3. Política de Privacidade (LGPD)">
          <p>
            Este serviço busca cumprir a Lei nº 13.709/2018 (Lei Geral de Proteção de Dados — LGPD). O
            <strong className="text-[var(--color-text-primary)]"> controlador</strong> dos dados é André Franceschini
            (pessoa física), contactável em{' '}
            <a href="mailto:contato@andrefranceschini.com.br" className="text-[var(--color-accent-mid)] hover:underline">
              contato@andrefranceschini.com.br
            </a>.
          </p>
          <p>
            <strong className="text-[var(--color-text-primary)]">Dados coletados:</strong> nome de usuário, e-mail
            (quando informado no cadastro), senha (armazenada de forma criptografada/hash), e dados gerados pelo uso
            do jogo (estatísticas de partidas, progressão, histórico, saldo de moedas/diamantes). Pagamentos são
            tratados pelo Mercado Pago — não armazenamos dados de cartão.
          </p>
          <p>
            <strong className="text-[var(--color-text-primary)]">Finalidade e base legal:</strong> os dados são
            usados para operar a conta, possibilitar as partidas, processar compras e prevenir abuso, com base na
            execução do contrato de uso e no legítimo interesse de manter o serviço seguro.
          </p>
          <p>
            <strong className="text-[var(--color-text-primary)]">Compartilhamento:</strong> dados são compartilhados
            apenas com provedores estritamente necessários à operação (infraestrutura de hospedagem e Mercado Pago
            para pagamentos). Não vendemos dados pessoais.
          </p>
          <p>
            <strong className="text-[var(--color-text-primary)]">Seus direitos:</strong> você pode solicitar acesso,
            correção, portabilidade, anonimização ou exclusão dos seus dados, bem como informação sobre o tratamento,
            escrevendo para{' '}
            <a href="mailto:contato@andrefranceschini.com.br" className="text-[var(--color-accent-mid)] hover:underline">
              contato@andrefranceschini.com.br
            </a>. Atendemos as solicitações dentro de prazo razoável, observada a LGPD.
          </p>
          <p>
            <strong className="text-[var(--color-text-primary)]">Retenção:</strong> os dados são mantidos enquanto a
            conta existir. Contas de convidado e dados efêmeros podem ser removidos automaticamente após inatividade.
            Você pode pedir a exclusão da conta a qualquer momento pelo e-mail de contato.
          </p>
        </Section>

        <Section id="anuncios" title="4. Anúncios e cookies">
          <p>
            O serviço pode exibir anúncios fornecidos por terceiros (Google AdSense). Esses provedores podem usar
            cookies e identificadores para personalizar e medir anúncios, conforme as próprias políticas deles.
            Você pode gerenciar preferências de anúncios nas configurações da sua conta Google.
          </p>
        </Section>

        <Section id="marcas" title="5. Marcas de terceiros">
          <p>
            O Temakuri pode disponibilizar temas, cores ou elementos visuais que façam referência a times, clubes
            ou outras entidades. Tais nomes, escudos, brasões e logotipos são marcas registradas de seus respectivos
            titulares e não há vínculo, patrocínio ou afiliação entre o Temakuri e essas entidades.
          </p>
          <p>
            Especificamente, qualquer uso do nome ou do escudo do <strong className="text-[var(--color-text-primary)]">Sport
            Club Corinthians Paulista</strong> é feito sem fins de associação oficial. O clube, como legítimo titular
            da marca, pode reivindicar a qualquer momento a remoção desse conteúdo, e tal solicitação será atendida.
            Se você é representante do clube e deseja a retirada, escreva para{' '}
            <a href="mailto:contato@andrefranceschini.com.br" className="text-[var(--color-accent-mid)] hover:underline">
              contato@andrefranceschini.com.br
            </a>.
          </p>
        </Section>

        <Section id="alteracoes" title="6. Alterações">
          <p>
            Estes termos podem ser atualizados. Mudanças relevantes serão indicadas pela data de "Última atualização"
            no topo desta página. O uso continuado do serviço após alterações implica concordância com a versão vigente.
          </p>
        </Section>

        <p className="text-xs text-[var(--color-text-muted)] opacity-70">
          Este documento tem caráter informativo e de boa-fé; não constitui aconselhamento jurídico.
        </p>
      </div>

      <DevFooter />
    </div>
  );
}
