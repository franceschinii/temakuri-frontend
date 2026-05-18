import { useQuery } from '@tanstack/react-query';
import {
  Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, Tooltip, XAxis, YAxis,
} from 'recharts';
import { TrendingUp, AlertTriangle, ShieldAlert, ShoppingCart, Activity, Users, DollarSign, Ban } from 'lucide-react';
import api from '@/lib/api';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/Skeleton';

interface DashboardData {
  game: {
    matchesByDay: { date: string; finished: number; abandoned: number }[];
    abandonRate24h: { abandoned: number; finished: number; rate: number };
    winnersByMode: { mode: string; count: number }[];
  };
  system: {
    errorsByCategory24h: { category: string; warn: number; error: number }[];
    requestsByHour7d: { hour: string; count: number }[];
    topErrorActions24h: { action: string; count: number }[];
  };
  monetization: {
    revenueByDay30d: { date: string; coins: number; premium: number; bundle: number; total: number }[];
    totalRevenue30d: number;
    topBuyers30d: { userId: string; username: string; count: number; totalSpent: number }[];
    salesBySku30d: { sku: string; count: number }[];
  };
  moderation: {
    topAdminActions7d: { username: string; userId: string; count: number }[];
    bannedTotal: number;
    suspendedRankedTotal: number;
    failedLogins24h: number;
  };
}

function shortDate(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function shortHour(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}h`;
}

function KpiCard({ label, value, icon: Icon, accent }: { label: string; value: string | number; icon: any; accent?: 'green' | 'red' | 'yellow' | 'blue' }) {
  const colors = {
    green: 'text-green-400 border-green-400/30 bg-green-400/5',
    red: 'text-[var(--color-danger)] border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5',
    yellow: 'text-[var(--color-warning)] border-[var(--color-warning)]/30 bg-[var(--color-warning)]/5',
    blue: 'text-blue-400 border-blue-400/30 bg-blue-400/5',
  };
  const className = accent ? colors[accent] : 'text-[var(--color-text-muted)] border-[var(--color-border)] bg-[var(--color-panel)]';
  return (
    <div className={`rounded-lg border px-3 py-3 flex items-center gap-3 ${className}`}>
      <Icon size={20} className="shrink-0" />
      <div className="flex flex-col min-w-0">
        <div className="text-[10px] uppercase tracking-wider opacity-80">{label}</div>
        <div className="text-lg font-bold tabular-nums truncate">{value}</div>
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-2 pt-2">
      <Icon size={16} className="text-[var(--color-accent-mid)]" />
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)] uppercase tracking-wider">{title}</h3>
      {subtitle && <span className="text-xs text-[var(--color-text-muted)]">· {subtitle}</span>}
      <div className="flex-1 h-px bg-[var(--color-border)]" />
    </div>
  );
}

function ChartPanel({ title, children, footer }: { title: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 flex flex-col gap-3">
      <div className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">{title}</div>
      <div>{children}</div>
      {footer && <div className="text-[10px] text-[var(--color-text-muted)]">{footer}</div>}
    </div>
  );
}

// Cores semantic para os charts — alinhadas com variáveis do tema
const COLORS = {
  finished: 'oklch(70% 0.16 150)',
  abandoned: 'oklch(65% 0.18 25)',
  warn: 'oklch(78% 0.18 80)',
  error: 'oklch(65% 0.22 25)',
  requests: 'oklch(70% 0.15 230)',
  coins: 'oklch(78% 0.2 75)',
  premium: 'oklch(75% 0.2 310)',
  bundle: 'oklch(72% 0.18 200)',
  primary: 'oklch(68% 0.18 165)',
};

const PIE_COLORS = ['oklch(70% 0.16 150)', 'oklch(78% 0.18 80)', 'oklch(70% 0.15 230)', 'oklch(75% 0.2 310)', 'oklch(72% 0.18 200)'];

export function DashboardAdmin() {
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ['admin-dashboard'],
    queryFn: async () => (await api.get('/admin/dashboard')).data,
    refetchInterval: 30_000,
  });

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[320px]" />)}
      </div>
    );
  }

  const matchesConfig: ChartConfig = {
    finished: { label: 'Finalizadas', color: COLORS.finished },
    abandoned: { label: 'Abandonadas', color: COLORS.abandoned },
  };
  const errorsConfig: ChartConfig = {
    warn: { label: 'Warnings', color: COLORS.warn },
    error: { label: 'Erros', color: COLORS.error },
  };
  const requestsConfig: ChartConfig = {
    count: { label: 'Requests', color: COLORS.requests },
  };
  const revenueConfig: ChartConfig = {
    coins: { label: 'Diamantes (coins)', color: COLORS.coins },
    premium: { label: 'Premium', color: COLORS.premium },
    bundle: { label: 'Bundle', color: COLORS.bundle },
  };

  const totalMatches24h = data.game.abandonRate24h.finished + data.game.abandonRate24h.abandoned;
  const abandonPct = (data.game.abandonRate24h.rate * 100).toFixed(1);

  return (
    <div className="flex flex-col gap-4">

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <KpiCard label="Partidas 24h" value={totalMatches24h} icon={Activity} accent="blue" />
        <KpiCard label="Abandono 24h" value={`${abandonPct}%`} icon={AlertTriangle} accent={data.game.abandonRate24h.rate > 0.3 ? 'red' : 'yellow'} />
        <KpiCard label="Diamantes vendidos 30d" value={data.monetization.totalRevenue30d} icon={DollarSign} accent="green" />
        <KpiCard label="Logins falhos 24h" value={data.moderation.failedLogins24h} icon={ShieldAlert} accent={data.moderation.failedLogins24h > 20 ? 'red' : undefined} />
      </div>

      {/* COMPORTAMENTO DE JOGO */}
      <SectionHeader icon={Activity} title="Comportamento de jogo" subtitle="últimos 7 dias" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <ChartPanel title="Partidas por dia">
          <ChartContainer config={matchesConfig}>
            <BarChart data={data.game.matchesByDay}>
              <CartesianGrid vertical={false} stroke="var(--color-border)" strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={shortDate} stroke="var(--color-text-muted)" fontSize={11} />
              <YAxis stroke="var(--color-text-muted)" fontSize={11} />
              <Tooltip content={<ChartTooltipContent labelFormatter={shortDate} />} cursor={{ fill: 'var(--color-panel)' }} />
              <Bar dataKey="finished" fill={COLORS.finished} radius={[4, 4, 0, 0]} stackId="a" />
              <Bar dataKey="abandoned" fill={COLORS.abandoned} radius={[4, 4, 0, 0]} stackId="a" />
            </BarChart>
          </ChartContainer>
        </ChartPanel>

        <ChartPanel title="Vencedores por modo (7d)" footer={data.game.winnersByMode.length === 0 ? 'Sem dados ainda — modos ainda não estão sendo logados no game.over.' : undefined}>
          {data.game.winnersByMode.length === 0 ? (
            <div className="h-[260px] flex items-center justify-center text-xs text-[var(--color-text-muted)]">
              Sem dados
            </div>
          ) : (
            <ChartContainer config={{}}>
              <PieChart>
                <Tooltip content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={data.game.winnersByMode}
                  dataKey="count"
                  nameKey="mode"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={(entry: any) => `${entry.mode}: ${entry.count}`}
                >
                  {data.game.winnersByMode.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          )}
        </ChartPanel>
      </div>

      {/* SAÚDE DO SISTEMA */}
      <SectionHeader icon={TrendingUp} title="Saúde do sistema" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <ChartPanel title="Erros por categoria (24h)">
          {data.system.errorsByCategory24h.length === 0 ? (
            <div className="h-[260px] flex items-center justify-center text-xs text-[var(--color-text-muted)]">
              Sem erros nas últimas 24h ✓
            </div>
          ) : (
            <ChartContainer config={errorsConfig}>
              <BarChart data={data.system.errorsByCategory24h} layout="vertical">
                <CartesianGrid horizontal={false} stroke="var(--color-border)" strokeDasharray="3 3" />
                <XAxis type="number" stroke="var(--color-text-muted)" fontSize={11} />
                <YAxis type="category" dataKey="category" stroke="var(--color-text-muted)" fontSize={11} width={80} />
                <Tooltip content={<ChartTooltipContent />} cursor={{ fill: 'var(--color-panel)' }} />
                <Bar dataKey="warn" fill={COLORS.warn} radius={[0, 4, 4, 0]} stackId="a" />
                <Bar dataKey="error" fill={COLORS.error} radius={[0, 4, 4, 0]} stackId="a" />
              </BarChart>
            </ChartContainer>
          )}
        </ChartPanel>

        <ChartPanel title="Requests por 6h (7d)">
          <ChartContainer config={requestsConfig}>
            <LineChart data={data.system.requestsByHour7d}>
              <CartesianGrid vertical={false} stroke="var(--color-border)" strokeDasharray="3 3" />
              <XAxis dataKey="hour" tickFormatter={shortHour} stroke="var(--color-text-muted)" fontSize={10} />
              <YAxis stroke="var(--color-text-muted)" fontSize={11} />
              <Tooltip content={<ChartTooltipContent labelFormatter={shortHour} />} />
              <Line type="monotone" dataKey="count" stroke={COLORS.requests} strokeWidth={2} dot={false} />
            </LineChart>
          </ChartContainer>
        </ChartPanel>
      </div>

      {data.system.topErrorActions24h.length > 0 && (
        <ChartPanel title="Top endpoints com erro (24h)">
          <ul className="flex flex-col gap-1">
            {data.system.topErrorActions24h.map((a, i) => (
              <li key={i} className="flex items-center justify-between text-xs px-2 py-1.5 rounded bg-[var(--color-panel)]">
                <span className="font-mono text-[var(--color-text-primary)] truncate">{a.action}</span>
                <span className="text-[var(--color-danger)] font-mono tabular-nums">{a.count}</span>
              </li>
            ))}
          </ul>
        </ChartPanel>
      )}

      {/* MONETIZAÇÃO */}
      <SectionHeader icon={DollarSign} title="Monetização" subtitle="últimos 30 dias" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <ChartPanel title="Diamantes vendidos por dia" footer="Soma de DiamondTransaction com type=PURCHASE">
          <ChartContainer config={revenueConfig}>
            <BarChart data={data.monetization.revenueByDay30d}>
              <CartesianGrid vertical={false} stroke="var(--color-border)" strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={shortDate} stroke="var(--color-text-muted)" fontSize={10} interval={4} />
              <YAxis stroke="var(--color-text-muted)" fontSize={11} />
              <Tooltip content={<ChartTooltipContent labelFormatter={shortDate} />} cursor={{ fill: 'var(--color-panel)' }} />
              <Bar dataKey="coins" fill={COLORS.coins} stackId="a" />
              <Bar dataKey="premium" fill={COLORS.premium} stackId="a" />
              <Bar dataKey="bundle" fill={COLORS.bundle} stackId="a" />
            </BarChart>
          </ChartContainer>
        </ChartPanel>

        <ChartPanel title="Top 5 compradores (30d)">
          {data.monetization.topBuyers30d.length === 0 ? (
            <div className="h-[260px] flex items-center justify-center text-xs text-[var(--color-text-muted)]">
              Sem compras no período
            </div>
          ) : (
            <ul className="flex flex-col gap-2 h-[260px] overflow-y-auto">
              {data.monetization.topBuyers30d.map((b, i) => (
                <li key={b.userId} className="flex items-center gap-3 px-3 py-2 rounded bg-[var(--color-panel)]">
                  <span className="text-xs text-[var(--color-text-muted)] font-mono w-4">{i + 1}</span>
                  <span className="text-sm text-[var(--color-text-primary)] flex-1 truncate">{b.username}</span>
                  <span className="text-xs text-[var(--color-text-muted)] tabular-nums">{b.count}x</span>
                  <span className="text-sm font-bold text-[var(--color-accent-mid)] tabular-nums">{b.totalSpent}</span>
                </li>
              ))}
            </ul>
          )}
        </ChartPanel>
      </div>

      {data.monetization.salesBySku30d.length > 0 && (
        <ChartPanel title="Vendas por SKU (30d)">
          <ChartContainer config={{}} className="h-[200px]">
            <BarChart data={data.monetization.salesBySku30d}>
              <CartesianGrid vertical={false} stroke="var(--color-border)" strokeDasharray="3 3" />
              <XAxis dataKey="sku" stroke="var(--color-text-muted)" fontSize={10} angle={-20} textAnchor="end" height={50} />
              <YAxis stroke="var(--color-text-muted)" fontSize={11} />
              <Tooltip content={<ChartTooltipContent />} cursor={{ fill: 'var(--color-panel)' }} />
              <Bar dataKey="count" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </ChartPanel>
      )}

      {/* MODERAÇÃO */}
      <SectionHeader icon={ShieldAlert} title="Moderação e abuso" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <KpiCard label="Banidos" value={data.moderation.bannedTotal} icon={Ban} accent={data.moderation.bannedTotal > 0 ? 'red' : undefined} />
        <KpiCard label="Suspensos ranked" value={data.moderation.suspendedRankedTotal} icon={ShieldAlert} accent={data.moderation.suspendedRankedTotal > 0 ? 'yellow' : undefined} />
        <KpiCard label="Logins falhos 24h" value={data.moderation.failedLogins24h} icon={Users} accent={data.moderation.failedLogins24h > 20 ? 'red' : undefined} />
        <KpiCard label="Ações admin 7d" value={data.moderation.topAdminActions7d.reduce((s, a) => s + a.count, 0)} icon={ShoppingCart} accent="blue" />
      </div>

      {data.moderation.topAdminActions7d.length > 0 && (
        <ChartPanel title="Top admins por ações (7d)">
          <ul className="flex flex-col gap-2">
            {data.moderation.topAdminActions7d.map((a, i) => (
              <li key={a.userId} className="flex items-center gap-3 px-3 py-2 rounded bg-[var(--color-panel)]">
                <span className="text-xs text-[var(--color-text-muted)] font-mono w-4">{i + 1}</span>
                <span className="text-sm text-[var(--color-text-primary)] flex-1 truncate">{a.username}</span>
                <span className="text-sm font-bold text-[var(--color-accent-mid)] tabular-nums">{a.count}</span>
              </li>
            ))}
          </ul>
        </ChartPanel>
      )}
    </div>
  );
}
