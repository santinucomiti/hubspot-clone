'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface DealsByStageChartProps {
  data?: { stage: string; count: number; amount: number }[];
  isLoading?: boolean;
}

export function DealsByStageChart({
  data,
  isLoading,
}: DealsByStageChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const maxAmount = data
    ? Math.max(...data.map((d) => d.amount), 1)
    : 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Deals by Stage</CardTitle>
        <CardDescription>Pipeline overview with amounts</CardDescription>
      </CardHeader>
      <CardContent>
        {!data || data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No deal data available
          </p>
        ) : (
          <div className="space-y-3">
            {data.map((item) => (
              <div key={item.stage} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{item.stage}</span>
                  <span className="text-muted-foreground">
                    {item.count} deals &middot;{' '}
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'EUR',
                      minimumFractionDigits: 0,
                    }).format(item.amount / 100)}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-hubspot-orange transition-all"
                    style={{
                      width: `${(item.amount / maxAmount) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
