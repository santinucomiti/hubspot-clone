'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';
import { getDashboard } from '@/lib/api/dashboard';
import type { DashboardData } from '@/lib/api/types';
import { PageHeader } from '@/components/page-header';
import { DealsByStageChart } from '@/components/dashboard/deals-by-stage-chart';
import { RecentActivities } from '@/components/dashboard/recent-activities';
import { UpcomingTasks } from '@/components/dashboard/upcoming-tasks';
import { TicketSummary } from '@/components/dashboard/ticket-summary';
import { CampaignStats } from '@/components/dashboard/campaign-stats';

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    try {
      const dashboardData = await getDashboard();
      setData(dashboardData);
    } catch {
      toast.error('Impossible de charger les données du tableau de bord');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const greeting = user
    ? `Bon retour, ${user.firstName}`
    : 'Bon retour';

  return (
    <div className="space-y-6">
      <PageHeader
        title={greeting}
        description="Voici un aperçu de votre activité CRM"
      />

      {/* Top row: Deals + Activities */}
      <div className="grid gap-6 md:grid-cols-2">
        <DealsByStageChart data={data?.dealsByStage} isLoading={isLoading} />
        <RecentActivities data={data?.recentActivities} isLoading={isLoading} />
      </div>

      {/* Bottom row: Tasks + Tickets + Campaigns */}
      <div className="grid gap-6 md:grid-cols-3">
        <UpcomingTasks data={data?.upcomingTasks} isLoading={isLoading} />
        <TicketSummary data={data?.ticketSummary} isLoading={isLoading} />
        <CampaignStats data={data?.campaignStats} isLoading={isLoading} />
      </div>
    </div>
  );
}
