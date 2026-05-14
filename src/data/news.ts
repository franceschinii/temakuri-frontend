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
    date: '2026-05-14',
    pinned: true,
    title: 'O que vem a seguir',
    summary: 'Animações mais vivas, novos temas, mais avatares e melhor qualidade visual.',
    body: `Próximas atualizações que estão sendo trabalhadas:

**Animações mais vivas**
Cartas, transições de turno e efeitos da mesa vão ganhar movimento. A mesa vai parecer mais respirando, menos estática.

**Mais temas de mesa**
Além de Bambu, Sakura e Oni, novos visuais entram em produção. Foco em ambientes mais distintos entre si.

**Mais avatares**
Novos personagens em fase de desenho. A galera atual continua, mas a coleção vai crescer.

**Qualidade visual mais alta**
Os avatares e ícones existentes vão receber retoques — paleta mais rica, traços mais limpos, mais expressão.

Sem data fechada — cada peça vai pro changelog assim que ficar pronta. Obrigado por jogar.`,
  },
];
