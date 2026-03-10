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
      toast.error('Impossible de charger les campagnes');
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
      toast.success('Campagne annulée');
      setCancelTarget(null);
      fetchCampaigns();
    } catch {
      toast.error('Impossible d\'annuler la campagne');
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
        <PageHeader title="Campagnes" />
        <div className="h-96 flex items-center justify-center text-muted-foreground">
          Chargement...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campagnes"
        description="Créez, gérez et suivez vos campagnes d'e-mail marketing."
        actions={
          <Button asChild>
            <Link href="/marketing/campaigns/new">
              <Plus className="mr-2 h-4 w-4" />
              Créer une campagne
            </Link>
          </Button>
        }
      />

      {campaigns.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="Aucune campagne pour le moment"
          description="Créez votre première campagne e-mail pour atteindre vos contacts."
          action={
            <Button asChild>
              <Link href="/marketing/campaigns/new">
                <Plus className="mr-2 h-4 w-4" />
                Créer une campagne
              </Link>
            </Button>
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={campaigns}
          searchKey="name"
          searchPlaceholder="Rechercher des campagnes..."
        />
      )}

      <ConfirmDialog
        open={!!cancelTarget}
        onOpenChange={(open) => !open && setCancelTarget(null)}
        title="Annuler la campagne"
        description={`Êtes-vous sûr de vouloir annuler « ${cancelTarget?.name} » ? Cette action est irréversible.`}
        confirmLabel="Annuler la campagne"
        variant="destructive"
        onConfirm={handleCancel}
        isLoading={isCancelling}
      />
    </div>
  );
}
