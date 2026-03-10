'use client';

import { Mail, MousePointerClick, Eye } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface CampaignStatsData {
  totalSent: number;
  avgOpenRate: number;
  avgClickRate: number;
}

interface CampaignStatsProps {
  data?: CampaignStatsData;
  isLoading?: boolean;
}

export function CampaignStats({ data, isLoading }: CampaignStatsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-44" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const stats = [
    {
      label: 'Emails Sent',
      value: data ? data.totalSent.toLocaleString() : '0',
      icon: Mail,
    },
    {
      label: 'Avg Open Rate',
      value: data ? `${data.avgOpenRate.toFixed(1)}%` : '0%',
      icon: Eye,
    },
    {
      label: 'Avg Click Rate',
      value: data ? `${data.avgClickRate.toFixed(1)}%` : '0%',
      icon: MousePointerClick,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Campaign Stats</CardTitle>
        <CardDescription>Email campaign performance overview</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          {stats.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="flex flex-col items-center rounded-md border p-3 text-center"
            >
              <Icon className="h-5 w-5 text-muted-foreground mb-1" />
              <p className="text-xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
