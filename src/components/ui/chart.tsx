import * as React from 'react';
import { ResponsiveContainer, type TooltipProps } from 'recharts';
import { cn } from '@/lib/utils';

export interface ChartConfig {
  [key: string]: {
    label: string;
    color: string;
  };
}

const ChartConfigContext = React.createContext<ChartConfig | null>(null);

interface ChartContainerProps {
  config: ChartConfig;
  className?: string;
  children: React.ReactElement;
}

export function ChartContainer({ config, className, children }: ChartContainerProps) {
  return (
    <ChartConfigContext.Provider value={config}>
      <div className={cn('w-full h-[260px]', className)}>
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </ChartConfigContext.Provider>
  );
}

interface ChartTooltipContentProps {
  active?: boolean;
  payload?: TooltipProps<number, string>['payload'];
  label?: string;
  labelFormatter?: (label: string) => string;
  formatter?: (value: number, name: string) => string;
  hideLabel?: boolean;
}

export function ChartTooltipContent({
  active, payload, label, labelFormatter, formatter, hideLabel,
}: ChartTooltipContentProps) {
  const config = React.useContext(ChartConfigContext);
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-xs shadow-lg">
      {!hideLabel && label && (
        <div className="font-medium text-[var(--color-text-primary)] mb-1">
          {labelFormatter ? labelFormatter(label) : label}
        </div>
      )}
      <div className="flex flex-col gap-0.5">
        {payload.map((entry, i) => {
          const key = entry.dataKey as string;
          const meta = config?.[key];
          const color = meta?.color ?? entry.color ?? 'currentColor';
          const labelText = meta?.label ?? entry.name ?? key;
          const value = entry.value as number;
          return (
            <div key={i} className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-sm shrink-0"
                style={{ background: color }}
              />
              <span className="text-[var(--color-text-muted)]">{labelText}:</span>
              <span className="font-mono tabular-nums text-[var(--color-text-primary)] ml-auto">
                {formatter ? formatter(value, key) : value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
