export interface NewsItem {
  date: string; // YYYY-MM-DD
  pinned: boolean;
  title: string;
  summary: string;
  body: string;
}

/**
 * Notícias exibidas no lobby (acima do changelog).
 * Adicionar entradas no TOPO. `pinned: true` aparece destacado.
 */
export const NEWS: NewsItem[] = [
  {
    date: '2026-05-13',
    pinned: true,
    title: 'Novos avatares, temas e bordas chegando',
    summary: 'Em breve: visuais exclusivos para você personalizar sua mesa e seu perfil.',
    body: `Estamos preparando uma atualização visual grande pro Temakuri:

**Avatares novos**
Mais 6 personagens estilizados pra escolher: Yokai, Kitsune, Tanuki, Geisha, Samurai e Dragão Dourado. Cada um com paleta de cores única.

**Temas de mesa**
3 visuais para a partida — Bambu, Sakura e Oni. Você escolhe o clima da sua jogatina.

**Plano Premium opcional**
Quem quiser apoiar o desenvolvimento do jogo vai poder assinar um plano mensal que dá visual exclusivo, remove os anúncios e libera todos os modos de jogo. Continua tudo jogável de graça, sempre.

**Quando?** Estou trabalhando ativamente. Vou postar no changelog assim que cada peça ficar pronta. Obrigado por jogar.`,
  },
];
