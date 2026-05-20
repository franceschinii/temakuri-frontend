# Changelog

## [0.8.0-beta] — 2026-05-18

### Novidades
- **Tour guiado no lobby:** na primeira visita, um tour com spotlight destaca cada elemento importante da tela (criar sala, buscar partida, ranking, tutorial, ajuda). Pode ser refeito a qualquer momento pelo modal "Como funciona".
- **Modo tutorial:** rota `/tutorial` com partida simulada offline contra um bot local. Ensina as mecânicas básicas do jogo com dicas reativas em overlay. Zero dependência de backend.
- **Modal de configurações:** botão de engrenagem na navbar substitui os dois controles individuais de áudio. Reúne som, música e atalho direto para a página de suporte.
- **Página de suporte:** rota pública `/support` com FAQ, widget de chat ao vivo (Freshworks) e contato por e-mail.

### Melhorias
- Lobby mobile: ícones ocultados nos botões Buscar, Ranking e Tutorial para liberar espaço no grid.
- Rodapé: link "Suporte" adicionado em mobile e desktop.

---

## [0.7.0-beta] — anterior

- Tema/avatar Ninja (preto e branco).
- Card de avaliações no lobby e aba de gestão no admin.
- Suporte a subtítulos (`#`, `##`, `###`) no MiniMarkdown do changelog.
- NewsCard consumindo API; gerenciamento de notícias no admin.
- Banner explicativo para jogadores out-of-round.
- Diversas correções de layout mobile e sincronização de estado pós-partida.
