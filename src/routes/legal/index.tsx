import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { DevFooter } from '@/components/ui/DevFooter';

const UPDATED_AT = '15 de maio de 2026';
const CONTACT = 'contato@andrefranceschini.com.br';

function Mail() {
  return (
    <a href={`mailto:${CONTACT}`} className="text-[var(--color-accent-mid)] hover:underline whitespace-nowrap">
      {CONTACT}
    </a>
  );
}

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

const B = ({ children }: { children: React.ReactNode }) => (
  <strong className="text-[var(--color-text-primary)]">{children}</strong>
);

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
          <Logo className="h-12 sm:h-14 w-auto" />
        </div>

        <header className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-[var(--color-text-primary)]" style={{ fontFamily: 'var(--font-display)' }}>
            Termos de Uso e Política de Privacidade
          </h1>
          <p className="text-xs text-[var(--color-text-muted)]">Última atualização: {UPDATED_AT}</p>
        </header>

        <Section id="responsavel" title="1. Identificação do operador">
          <p>
            O Temakuri é um jogo de cartas on-line operado por <B>André Franceschini</B>, pessoa física,
            de forma independente. Não se trata de empresa ou pessoa jurídica. Para qualquer assunto —
            suporte, privacidade, proteção de dados, propriedade intelectual ou jurídico — o canal oficial
            de contato é <Mail />.
          </p>
        </Section>

        <Section id="aceitacao" title="2. Aceitação dos termos">
          <p>
            Ao acessar o serviço, criar uma conta (registrada ou de convidado) ou realizar qualquer compra,
            você declara que leu, entendeu e concorda integralmente com estes Termos e com a Política de
            Privacidade. Se não concordar, não utilize o serviço. O uso continuado após eventuais
            atualizações implica concordância com a versão vigente.
          </p>
        </Section>

        <Section id="idade" title="3. Idade mínima e menores de idade">
          <p>
            O serviço destina-se a pessoas com <B>13 anos ou mais</B>. Usuários entre 13 e 18 anos só devem
            utilizar o serviço com ciência e supervisão dos pais ou responsáveis legais.
          </p>
          <p>
            <B>Compras por menores de 18 anos</B> só podem ser feitas com autorização e supervisão do
            responsável legal, que assume a responsabilidade pela transação. O operador pode cancelar
            compras e contas quando identificar uso por menor sem autorização.
          </p>
        </Section>

        <Section id="conta" title="4. Conta e conduta do usuário">
          <p>
            Você é responsável pela segurança da sua conta e por toda atividade realizada nela. É proibido:
            usar o serviço para fraude; abusar, ofender ou assediar outros jogadores; explorar falhas;
            utilizar automação, bots ou ferramentas não autorizadas; tentar obter acesso indevido a contas
            ou sistemas; ou qualquer conduta ilícita.
          </p>
          <p>
            O operador pode, a seu critério e quando razoável, advertir, suspender ou remover contas que
            violem estas regras ou a legislação, podendo reter dados mínimos necessários para cumprir
            obrigações legais e prevenir reincidência.
          </p>
        </Section>

        <Section id="itens" title="5. Itens virtuais, pagamentos e reembolso">
          <p>
            O serviço oferece itens virtuais (diamantes, assinatura Premium, temas, avatares e demais
            conteúdos). Itens virtuais <B>não têm valor monetário fora do jogo</B>, não são transferíveis
            entre contas e não são conversíveis em dinheiro. Eles consistem em licença de uso, limitada e
            revogável, dentro do próprio serviço.
          </p>
          <p>
            Os pagamentos são processados pelo provedor terceiro <B>Mercado Pago</B>. Não coletamos nem
            armazenamos dados de cartão; esses dados são tratados diretamente pelo provedor, conforme as
            políticas dele.
          </p>
          <p>
            <B>Direito de arrependimento (art. 49 do Código de Defesa do Consumidor):</B> você pode
            solicitar o cancelamento de uma compra em até <B>7 (sete) dias corridos</B> a partir da
            contratação, <B>desde que o item virtual ainda não tenha sido utilizado/consumido</B> no jogo.
            Itens já utilizados (ex.: diamantes gastos, benefícios Premium usufruídos) não são reembolsáveis.
            Solicitações devem ser feitas por <Mail />, informando dados da compra. Reembolsos seguem os
            prazos e meios do provedor de pagamento.
          </p>
          <p>
            A assinatura Premium é recorrente. Você pode cancelar a renovação a qualquer momento pela loja;
            o cancelamento encerra cobranças futuras e os benefícios permanecem até o fim do período já pago.
          </p>
        </Section>

        <Section id="privacidade" title="6. Política de Privacidade (LGPD)">
          <p>
            Este serviço busca cumprir a Lei nº 13.709/2018 (LGPD) e o Marco Civil da Internet (Lei nº
            12.965/2014). O <B>controlador</B> dos dados é André Franceschini (pessoa física), contactável
            em <Mail />.
          </p>
          <p>
            <B>Dados tratados:</B> nome de usuário; e-mail (quando informado); senha (armazenada apenas como
            hash criptográfico, nunca em texto puro); dados de uso e progressão (estatísticas de partidas,
            histórico, saldo de moedas/diamantes, inventário); dados técnicos mínimos de conexão (ex.:
            registros de acesso, exigidos pelo Marco Civil). Pagamentos são tratados pelo Mercado Pago.
          </p>
          <p>
            <B>Finalidades e bases legais:</B> operar a conta e possibilitar as partidas (execução de
            contrato); processar compras (execução de contrato); prevenir fraude e abuso e manter o serviço
            seguro (legítimo interesse); cumprir obrigações legais, como guarda de registros de acesso
            (obrigação legal).
          </p>
          <p>
            <B>Compartilhamento:</B> os dados são compartilhados apenas com operadores estritamente
            necessários ao funcionamento (infraestrutura de hospedagem e Mercado Pago para pagamentos), e
            com autoridades quando exigido por lei ou ordem judicial. <B>Não vendemos dados pessoais</B> e
            não os usamos para perfilamento publicitário próprio.
          </p>
          <p>
            <B>Direitos do titular (art. 18 da LGPD):</B> você pode solicitar confirmação de tratamento,
            acesso, correção, anonimização, portabilidade, eliminação dos dados, informação sobre
            compartilhamentos e revogação de consentimento, escrevendo para <Mail />. As solicitações são
            atendidas dentro de prazo razoável, observada a legislação. Você também pode peticionar à
            Autoridade Nacional de Proteção de Dados (ANPD).
          </p>
          <p>
            <B>Retenção e eliminação:</B> os dados são mantidos enquanto a conta existir. Contas de
            convidado e dados efêmeros podem ser removidos automaticamente após inatividade. Registros de
            acesso são guardados pelo prazo legal mínimo. Você pode solicitar a exclusão da conta a qualquer
            momento por <Mail />; alguns dados podem ser retidos pelo tempo necessário ao cumprimento de
            obrigações legais.
          </p>
          <p>
            <B>Segurança:</B> adotamos medidas técnicas razoáveis para proteger os dados (senha em hash,
            transporte criptografado). Nenhum sistema é totalmente imune; em caso de incidente de segurança
            relevante, os titulares e a ANPD serão comunicados conforme a LGPD.
          </p>
          <p>
            <B>Transferência internacional:</B> provedores de infraestrutura podem processar dados em
            servidores fora do Brasil. Nesses casos, buscamos provedores que adotem padrões adequados de
            proteção, conforme a LGPD.
          </p>
        </Section>

        <Section id="cookies" title="7. Cookies e anúncios">
          <p>
            Utilizamos armazenamento local/cookies estritamente necessários para autenticação e
            funcionamento do jogo. O serviço pode exibir anúncios de terceiros (Google AdSense), que podem
            usar cookies e identificadores para personalizar e medir anúncios conforme as políticas
            próprias do Google. Você pode gerenciar preferências de anúncios na sua conta Google e
            controlar cookies nas configurações do navegador.
          </p>
        </Section>

        <Section id="propriedade" title="8. Propriedade intelectual">
          <p>
            O nome "Temakuri", a identidade visual, o código e o conteúdo original do jogo pertencem ao
            operador. É vedada a reprodução, distribuição ou engenharia reversa sem autorização, salvo o uso
            normal previsto nestes Termos.
          </p>
        </Section>

        <Section id="marcas" title="9. Marcas de terceiros">
          <p>
            O Temakuri pode disponibilizar temas, cores, avatares ou elementos visuais que façam referência
            a times, clubes ou outras entidades. Tais nomes, escudos, brasões e logotipos são marcas
            registradas de seus respectivos titulares. <B>Não há vínculo, patrocínio, afiliação ou
            endosso</B> entre o Temakuri e essas entidades.
          </p>
          <p>
            Especificamente, qualquer referência ao nome ou ao escudo do <B>Sport Club Corinthians
            Paulista</B> é feita sem fins de associação oficial e sem intenção de violar direitos. O clube,
            como legítimo titular da marca, pode <B>reivindicar a qualquer momento</B> a remoção desse
            conteúdo, e tal solicitação será <B>prontamente atendida</B>. Representantes do clube podem
            solicitar a retirada por <Mail />.
          </p>
        </Section>

        <Section id="responsabilidade" title="10. Limitação de responsabilidade">
          <p>
            O serviço é fornecido "no estado em que se encontra", sem garantia de disponibilidade
            ininterrupta ou ausência de erros. Na máxima extensão permitida pela lei, o operador não se
            responsabiliza por danos indiretos, perda de progresso, indisponibilidade temporária ou falhas
            de provedores terceiros. Nada nestes Termos exclui direitos que a legislação consumerista
            assegure de forma inafastável.
          </p>
        </Section>

        <Section id="alteracoes" title="11. Alterações e legislação aplicável">
          <p>
            Estes Termos podem ser atualizados; mudanças relevantes são indicadas pela data de "Última
            atualização" no topo desta página. Aplica-se a legislação brasileira. Fica eleito o foro do
            domicílio do consumidor para dirimir controvérsias, quando aplicável a relação de consumo.
          </p>
        </Section>

        <Section id="contato" title="12. Contato">
          <p>
            Dúvidas, solicitações de privacidade (LGPD), pedidos de reembolso ou retirada de conteúdo:{' '}
            <Mail />.
          </p>
        </Section>
      </div>

      <DevFooter />
    </div>
  );
}
