'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Megaphone } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { EmptyState } from '@/components/empty-state';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { DataTable } from '@/components/data-table';
import {
  getCampaigns,
  cancelCampaign,
  type Campaign,
} from '@/lib/api/campaigns';
import { getCampaignColumns } from '@/features/marketing/campaigns';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState<Campaign | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchCampaigns = useCallback(async () => {
    try {
      const response = await getCampaigns({ limit: 100 });
      setCampaigns(response.data);
    } catch {
      toast.error('Failed to load campaigns');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  async function handleCancel() {
    if (!cancelTarget) return;
    setIsCancelling(true);
    try {
      await cancelCampaign(cancelTarget.id);
      toast.success('Campaign cancelled');
      setCancelTarget(null);
      fetchCampaigns();
    } catch {
      toast.error('Failed to cancel campaign');
    } finally {
      setIsCancelling(false);
    }
  }

  const columns = getCampaignColumns({
    onCancel: setCancelTarget,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Campaigns" />
        <div className="h-96 flex items-center justify-center text-muted-foreground">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campaigns"
        description="Create, manage, and track your email marketing campaigns."
        actions={
          <Button asChild>
            <Link href="/marketing/campaigns/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Campaign
            </Link>
          </Button>
        }
      />

      {campaigns.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No campaigns yet"
          description="Create your first email campaign to reach your contacts."
          action={
            <Button asChild>
              <Link href="/marketing/campaigns/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Campaign
              </Link>
            </Button>
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={campaigns}
          searchKey="name"
          searchPlaceholder="Search campaigns..."
        />
      )}

      <ConfirmDialog
        open={!!cancelTarget}
        onOpenChange={(open) => !open && setCancelTarget(null)}
        title="Cancel Campaign"
        description={`Are you sure you want to cancel "${cancelTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Cancel Campaign"
        variant="destructive"
        onConfirm={handleCancel}
        isLoading={isCancelling}
      />
    </div>
  );
}
