import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw, ChevronDown, ChevronRight, Search, Filter } from 'lucide-react';
import api from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AdminLog {
  id: string;
  category: string;
  action: string;
  level: 'info' | 'warn' | 'error';
  userId: string | null;
  username: string | null;
  ip: string | null;
  metadata: Record<string, unknown> | null;
  statusCode: number | null;
  createdAt: string;
}

interface LogsResponse {
  items: AdminLog[];
  nextCursor: string | null;
}

const CATEGORIES = ['', 'auth', 'admin', 'payment', 'shop', 'game', 'matchmaking', 'system'] as const;
const LEVELS = ['', 'info', 'warn', 'error'] as const;

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function levelColor(level: string): string {
  if (level === 'error') return 'text-[var(--color-danger)] bg-[var(--color-danger)]/10';
  if (level === 'warn') return 'text-[var(--color-warning)] bg-[var(--color-warning)]/10';
  return 'text-[var(--color-text-muted)] bg-[var(--color-panel)]';
}

function categoryColor(cat: string): string {
  const map: Record<string, string> = {
    auth: 'text-blue-400 border-blue-400/30',
    admin: 'text-purple-400 border-purple-400/30',
    payment: 'text-green-400 border-green-400/30',
    shop: 'text-yellow-400 border-yellow-400/30',
    game: 'text-orange-400 border-orange-400/30',
    matchmaking: 'text-pink-400 border-pink-400/30',
    system: 'text-gray-400 border-gray-400/30',
  };
  return map[cat] ?? 'text-[var(--color-text-muted)] border-[var(--color-border)]';
}

export function LogsAdmin() {
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');
  const [username, setUsername] = useState('');
  const [action, setAction] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const params = useMemo(() => {
    const p: Record<string, string> = { limit: '100' };
    if (category) p.category = category;
    if (level) p.level = level;
    if (username) p.username = username;
    if (action) p.action = action;
    if (from) p.from = new Date(from).toISOString();
    if (to) p.to = new Date(to).toISOString();
    return p;
  }, [category, level, username, action, from, to]);

  const { data, isLoading, refetch, isFetching } = useQuery<LogsResponse>({
    queryKey: ['admin-logs', params],
    queryFn: async () => {
      const res = await api.get('/admin/logs', { params });
      return res.data;
    },
    refetchInterval: 10_000,
  });

  const { data: stats } = useQuery<Array<{ category: string; level: string; count: number }>>({
    queryKey: ['admin-logs-stats'],
    queryFn: async () => {
      const res = await api.get('/admin/logs/stats');
      return res.data;
    },
    refetchInterval: 30_000,
  });

  const toggleExpanded = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const totalByCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of stats ?? []) {
      map.set(s.category, (map.get(s.category) ?? 0) + s.count);
    }
    return map;
  }, [stats]);

  const errorsCount = (stats ?? []).filter(s => s.level === 'error').reduce((sum, s) => sum + s.count, 0);
  const warnsCount = (stats ?? []).filter(s => s.level === 'warn').reduce((sum, s) => sum + s.count, 0);

  const clearFilters = () => {
    setCategory(''); setLevel(''); setUsername(''); setAction(''); setFrom(''); setTo('');
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Stats banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-2">
          <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">Últimas 24h</div>
          <div className="text-lg font-bold text-[var(--color-text-primary)]">
            {[...totalByCategory.values()].reduce((a, b) => a + b, 0)}
          </div>
        </div>
        <div className="rounded-lg border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 px-3 py-2">
          <div className="text-[10px] uppercase tracking-wider text-[var(--color-danger)]">Errors 24h</div>
          <div className="text-lg font-bold text-[var(--color-danger)]">{errorsCount}</div>
        </div>
        <div className="rounded-lg border border-[var(--color-warning)]/30 bg-[var(--color-warning)]/5 px-3 py-2">
          <div className="text-[10px] uppercase tracking-wider text-[var(--color-warning)]">Warns 24h</div>
          <div className="text-lg font-bold text-[var(--color-warning)]">{warnsCount}</div>
        </div>
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-2">
          <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">Categorias</div>
          <div className="text-xs text-[var(--color-text-primary)] truncate">
            {[...totalByCategory.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([c, n]) => `${c}:${n}`).join(' · ') || '—'}
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] p-3 flex flex-col gap-3">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
          <Filter size={12} /> Filtros
          <div className="flex-1 h-px bg-[var(--color-border)]" />
          <button onClick={clearFilters} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">Limpar</button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1.5 text-[var(--color-text-primary)]"
          >
            <option value="">Todas categorias</option>
            {CATEGORIES.filter(Boolean).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={level}
            onChange={e => setLevel(e.target.value)}
            className="text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1.5 text-[var(--color-text-primary)]"
          >
            <option value="">Todos níveis</option>
            {LEVELS.filter(Boolean).map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <Input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} className="text-sm" />
          <Input placeholder="Action (contém)" value={action} onChange={e => setAction(e.target.value)} className="text-sm" />
          <Input type="datetime-local" value={from} onChange={e => setFrom(e.target.value)} className="text-sm" title="De" />
          <Input type="datetime-local" value={to} onChange={e => setTo(e.target.value)} className="text-sm" title="Até" />
        </div>
      </div>

      {/* Lista */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--color-border)] bg-[var(--color-panel)]">
          <span className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
            {data?.items.length ?? 0} registros
          </span>
          <div className="flex-1 h-px bg-[var(--color-border)]" />
          <button
            onClick={() => refetch()}
            className={cn('text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors p-1.5 rounded-lg hover:bg-[var(--color-surface)]', isFetching && 'animate-spin')}
            title="Atualizar"
          >
            <RefreshCw size={13} />
          </button>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-sm text-[var(--color-text-muted)]">Carregando...</div>
        ) : !data?.items.length ? (
          <div className="p-8 text-center text-sm text-[var(--color-text-muted)]">Nenhum log encontrado para os filtros.</div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {data.items.map(log => {
              const isOpen = expanded.has(log.id);
              const hasMeta = log.metadata && Object.keys(log.metadata).length > 0;
              return (
                <div key={log.id} className="flex flex-col text-sm">
                  <button
                    onClick={() => hasMeta && toggleExpanded(log.id)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 text-left hover:bg-[var(--color-panel)] transition-colors',
                      hasMeta && 'cursor-pointer',
                    )}
                  >
                    <span className="text-[10px] text-[var(--color-text-muted)] font-mono tabular-nums shrink-0 w-32">
                      {formatDate(log.createdAt)}
                    </span>
                    <span className={cn('text-[10px] px-1.5 py-0.5 rounded border font-medium uppercase tracking-wider shrink-0', categoryColor(log.category))}>
                      {log.category}
                    </span>
                    <span className={cn('text-[10px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wider shrink-0', levelColor(log.level))}>
                      {log.level}
                    </span>
                    <span className="text-xs font-mono text-[var(--color-text-primary)] truncate flex-1">
                      {log.action}
                    </span>
                    {log.statusCode != null && (
                      <span className={cn(
                        'text-[10px] font-mono tabular-nums shrink-0',
                        log.statusCode >= 500 ? 'text-[var(--color-danger)]' :
                        log.statusCode >= 400 ? 'text-[var(--color-warning)]' :
                        'text-[var(--color-text-muted)]',
                      )}>
                        {log.statusCode}
                      </span>
                    )}
                    {log.username && (
                      <span className="text-[10px] text-[var(--color-accent-mid)] truncate shrink-0 max-w-[120px]" title={log.username}>
                        {log.username}
                      </span>
                    )}
                    {hasMeta && (isOpen ? <ChevronDown size={12} className="shrink-0 text-[var(--color-text-muted)]" /> : <ChevronRight size={12} className="shrink-0 text-[var(--color-text-muted)]" />)}
                  </button>
                  {isOpen && hasMeta && (
                    <div className="px-3 pb-3 pt-1 bg-[var(--color-panel)]">
                      <pre className="text-[10px] font-mono text-[var(--color-text-muted)] overflow-x-auto whitespace-pre-wrap break-all">
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                      {log.ip && (
                        <div className="text-[10px] text-[var(--color-text-muted)] mt-2">
                          IP: <span className="font-mono">{log.ip}</span>
                          {log.userId && <> · userId: <span className="font-mono">{log.userId}</span></>}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
