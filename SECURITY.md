# Política de Segurança

## Versões suportadas

Apenas a versão mais recente em `main` recebe correções de segurança.

## Reportando uma vulnerabilidade

**Não abra uma issue pública para vulnerabilidades de segurança.**

Envie um e-mail para **contato@andrefranceschini.com.br** com:

- Descrição da vulnerabilidade
- Passos para reproduzir
- Impacto potencial
- Sugestão de correção (opcional)

Você receberá uma resposta em até 72 horas. Após a correção ser publicada, a vulnerabilidade pode ser divulgada publicamente com crédito ao descobridor, se desejado.

## Escopo

Este repositório contém o **frontend** do Temakuri. Vulnerabilidades relevantes incluem:

- XSS (Cross-Site Scripting)
- Exposição de dados sensíveis do usuário no cliente
- Bypass de autenticação no lado do cliente
- Dependências com CVEs críticos

Problemas relacionados ao servidor, banco de dados ou pagamentos devem ser reportados ao repositório do [backend](https://github.com/franceschinii/temakuri-backend).

## O que não é vulnerabilidade

- Funcionalidades intencionais do jogo (regras, balanceamento)
- Bugs de UI sem impacto de segurança
- Rate limiting ausente no frontend (responsabilidade do backend)
