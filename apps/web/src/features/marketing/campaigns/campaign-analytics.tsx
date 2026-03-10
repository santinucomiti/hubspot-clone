'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  Send,
  Mail,
  MousePointerClick,
  AlertTriangle,
  UserMinus,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  getCampaignAnalytics,
  type CampaignAnalytics as CampaignAnalyticsType,
} from '@/lib/api/campaigns';

interface CampaignAnalyticsProps {
  campaignId: string;
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  className?: string;
}

function StatCard({ title, value, subtitle, icon, className }: StatCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}

export function CampaignAnalyticsDashboard({
  campaignId,
}: CampaignAnalyticsProps) {
  const [analytics, setAnalytics] = useState<CampaignAnalyticsType | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    try {
      const data = await getCampaignAnalytics(campaignId);
      setAnalytics(data);
    } catch {
      toast.error('Failed to load campaign analytics');
    } finally {
      setIsLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-16 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!analytics) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        No analytics data available yet.
      </p>
    );
  }

  function formatRate(rate: number): string {
    return `${(rate * 100).toFixed(1)}%`;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard
        title="Sent"
        value={analytics.sent.toLocaleString()}
        subtitle="Total emails sent"
        icon={<Send className="h-4 w-4 text-muted-foreground" />}
      />
      <StatCard
        title="Delivered"
        value={analytics.delivered.toLocaleString()}
        subtitle={`${analytics.sent > 0 ? formatRate(analytics.delivered / analytics.sent) : '0%'} delivery rate`}
        icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />}
      />
      <StatCard
        title="Opened"
        value={analytics.opened.toLocaleString()}
        subtitle={`${formatRate(analytics.openRate)} open rate`}
        icon={<Mail className="h-4 w-4 text-blue-600" />}
      />
      <StatCard
        title="Clicked"
        value={analytics.clicked.toLocaleString()}
        subtitle={`${formatRate(analytics.clickRate)} click rate`}
        icon={<MousePointerClick className="h-4 w-4 text-purple-600" />}
      />
      <StatCard
        title="Bounced"
        value={analytics.bounced.toLocaleString()}
        subtitle={`${formatRate(analytics.bounceRate)} bounce rate`}
        icon={<AlertTriangle className="h-4 w-4 text-amber-600" />}
      />
      <StatCard
        title="Unsubscribed"
        value={analytics.unsubscribed.toLocaleString()}
        subtitle={`${formatRate(analytics.unsubscribeRate)} unsubscribe rate`}
        icon={<UserMinus className="h-4 w-4 text-red-600" />}
      />
    </div>
  );
}
