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
    title: 'Em breve: Diamantes, Premium e novos visuais',
    summary: 'Pagamento real via PIX/Cartão, assinatura Premium R$ 7,90/mês e itens cosméticos exclusivos.',
    body: `Estamos preparando uma grande atualização com 3 frentes:

**Diamantes — Moeda Premium**
Comprados com dinheiro real via Mercado Pago (PIX, cartão de crédito, débito). Pacotes a partir de R$ 4,90:

• 100 diamantes — R$ 4,90
• 500 diamantes — R$ 19,90
• 1.200 diamantes — R$ 39,90 (bônus +22%)
• 3.000 diamantes — R$ 89,90 (bônus +50%)

**Premium — R$ 7,90/mês**
Assinatura mensal com benefícios exclusivos:

• 50 diamantes gratuitos todo mês
• Sem anúncios em nenhuma tela
• Todos os modos de jogo desbloqueados (Mercado, Rodízio, Degustação) enquanto a assinatura estiver ativa
• Badge exclusiva no perfil

**Novos Avatares e Temas**
Catálogo expandido com 6 avatares premium (Yokai, Kitsune, Tanuki, Geisha, Samurai, Dragão Dourado) e 3 temas de mesa (Bambu, Sakura, Oni). Comprados com diamantes.

**Quando?** Trabalhando ativamente nesse momento. Acompanhe o changelog para o lançamento.`,
  },
];
