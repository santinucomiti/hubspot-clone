'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { ArrowLeft, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/status-badge';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { CampaignAnalyticsDashboard } from '@/features/marketing/campaigns';
import {
  getCampaign,
  cancelCampaign,
  type Campaign,
} from '@/lib/api/campaigns';

export default function CampaignDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCancel, setShowCancel] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchCampaign = useCallback(async () => {
    try {
      const data = await getCampaign(params.id);
      setCampaign(data);
    } catch {
      toast.error('Failed to load campaign');
      router.push('/marketing/campaigns');
    } finally {
      setIsLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    fetchCampaign();
  }, [fetchCampaign]);

  async function handleCancel() {
    setIsCancelling(true);
    try {
      await cancelCampaign(params.id);
      toast.success('Campaign cancelled');
      setShowCancel(false);
      fetchCampaign();
    } catch {
      toast.error('Failed to cancel campaign');
    } finally {
      setIsCancelling(false);
    }
  }

  if (isLoading || !campaign) {
    return (
      <div className="space-y-6">
        <PageHeader title="Campaign" />
        <div className="h-96 flex items-center justify-center text-muted-foreground">
          Loading...
        </div>
      </div>
    );
  }

  const canCancel =
    campaign.status === 'SCHEDULED' || campaign.status === 'DRAFT';
  const showAnalytics =
    campaign.status === 'SENT' || campaign.status === 'SENDING';

  return (
    <div className="space-y-6">
      <PageHeader
        title={campaign.name}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/marketing/campaigns">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Campaigns
              </Link>
            </Button>
            {canCancel && (
              <Button
                variant="destructive"
                onClick={() => setShowCancel(true)}
              >
                <Ban className="mr-2 h-4 w-4" />
                Cancel Campaign
              </Button>
            )}
          </div>
        }
      />

      {/* Campaign details card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-3">
            Campaign Details
            <StatusBadge
              status={campaign.status}
              type="campaignStatus"
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Subject
              </p>
              <p className="text-sm">{campaign.subject}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                From
              </p>
              <p className="text-sm">
                {campaign.fromName} &lt;{campaign.fromEmail}&gt;
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Template
              </p>
              <p className="text-sm">{campaign.template?.name || '-'}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Created
              </p>
              <p className="text-sm">
                {format(new Date(campaign.createdAt), 'MMM d, yyyy HH:mm')}
              </p>
            </div>
            {campaign.scheduledAt && (
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Scheduled
                </p>
                <p className="text-sm">
                  {format(
                    new Date(campaign.scheduledAt),
                    'MMM d, yyyy HH:mm',
                  )}
                </p>
              </div>
            )}
            {campaign.sentAt && (
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Sent
                </p>
                <p className="text-sm">
                  {format(new Date(campaign.sentAt), 'MMM d, yyyy HH:mm')}
                </p>
              </div>
            )}
          </div>

          {/* Recipient lists */}
          {campaign.campaignLists && campaign.campaignLists.length > 0 && (
            <>
              <Separator className="my-4" />
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Recipient Lists
                </p>
                <div className="flex flex-wrap gap-2">
                  {campaign.campaignLists.map((cl) => (
                    <Badge key={cl.contactList.id} variant="secondary">
                      {cl.contactList.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Analytics section */}
      {showAnalytics && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Campaign Analytics</h2>
          <CampaignAnalyticsDashboard campaignId={campaign.id} />
        </div>
      )}

      <ConfirmDialog
        open={showCancel}
        onOpenChange={setShowCancel}
        title="Cancel Campaign"
        description={`Are you sure you want to cancel "${campaign.name}"? This action cannot be undone.`}
        confirmLabel="Cancel Campaign"
        variant="destructive"
        onConfirm={handleCancel}
        isLoading={isCancelling}
      />
    </div>
  );
}
