# Contribuindo com o Temakuri (Frontend)

Obrigado pelo interesse em contribuir! Este documento explica como o projeto funciona e como participar.

## Código de conduta

Trate todos com respeito. Contribuições que contenham ofensas, discriminação ou assédio serão descartadas.

## Como contribuir

### Reportar bugs

Abra uma [issue](https://github.com/franceschinii/temakuri-frontend/issues) com:

- Descrição clara do problema
- Passos para reproduzir
- Comportamento esperado vs. observado
- Screenshot ou gravação de tela (se aplicável)
- Navegador e dispositivo

### Sugerir melhorias

Abra uma issue com a tag `enhancement`. Descreva o problema que a melhoria resolve, não apenas a solução.

### Enviar código

1. Faça fork do repositório
2. Crie uma branch curta a partir de `main`:
   ```
   git checkout -b feat/nome-curto
   ```
3. Faça commits pequenos e atômicos seguindo [Conventional Commits](https://www.conventionalcommits.org/) em português:
   ```
   feat(lobby): adiciona contador de jogadores online
   fix(game): corrige contagem de pratos no modo duelo
   ```
4. Abra um Pull Request para `main` descrevendo o que mudou e por quê

### O que aceito vs. o que não aceito

**Aceito:**
- Correções de bugs com testes ou reprodução clara
- Melhorias de acessibilidade e responsividade
- Traduções (i18n)
- Melhorias de performance mensuráveis
- Correções de typo em textos visíveis ao jogador

**Não aceito sem discussão prévia:**
- Mudanças de design ou identidade visual
- Novas features grandes sem issue aprovada primeiro
- Refatorações de arquitetura sem alinhamento
- Dependências novas sem justificativa clara

## Setup local

```bash
git clone https://github.com/franceschinii/temakuri-frontend.git
cd temakuri-frontend
npm install
cp .env.example .env
# edite .env com a URL do backend local
npm run dev
```

## Stack

- React 19 + TypeScript
- Vite 6
- Zustand 5 (estado)
- Tailwind CSS 4
- Framer Motion 12
- Radix UI
- Socket.IO Client (jogo em tempo real)

## Padrões do projeto

- Componentes em `src/components/`, rotas em `src/routes/`
- Estado global via Zustand stores em `src/stores/`
- Sem comentários óbvios — o código deve se explicar pelos nomes
- CSS via Tailwind + CSS custom properties (`var(--color-*)`)
- Sem `any` no TypeScript

## Dúvidas

Abra uma issue com a tag `question` ou envie e-mail para contato@andrefranceschini.com.br.
