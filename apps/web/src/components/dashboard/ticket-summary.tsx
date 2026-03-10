'use client';

import { Ticket } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface TicketSummaryData {
  open: number;
  inProgress: number;
  waiting: number;
  resolved: number;
}

interface TicketSummaryProps {
  data?: TicketSummaryData;
  isLoading?: boolean;
}

const statusConfig = [
  { key: 'open' as const, label: 'Open', color: 'bg-blue-500' },
  { key: 'inProgress' as const, label: 'In Progress', color: 'bg-amber-500' },
  { key: 'waiting' as const, label: 'Waiting', color: 'bg-gray-400' },
  { key: 'resolved' as const, label: 'Resolved', color: 'bg-emerald-500' },
];

export function TicketSummary({ data, isLoading }: TicketSummaryProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-44" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const total = data
    ? data.open + data.inProgress + data.waiting + data.resolved
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Ticket Summary</CardTitle>
        <CardDescription>
          {total} total active tickets
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!data ? (
          <div className="flex flex-col items-center py-4 text-center">
            <Ticket className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              No ticket data available
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {statusConfig.map(({ key, label, color }) => (
              <div
                key={key}
                className="flex items-center gap-3 rounded-md border p-3"
              >
                <div className={`h-3 w-3 rounded-full ${color}`} />
                <div>
                  <p className="text-2xl font-bold">{data[key]}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
