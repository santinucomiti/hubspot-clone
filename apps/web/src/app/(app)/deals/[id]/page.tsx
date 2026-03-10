'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  getDeal,
  updateDeal,
  type Deal,
  type UpdateDealInput,
} from '@/lib/api/deals';
import { getPipeline, type Pipeline } from '@/lib/api/pipelines';
import { DealDetail } from '@/features/deals/deal-detail';
import { DealForm } from '@/features/deals/deal-form';

export default function DealDetailPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [pipeline, setPipeline] = useState<Pipeline | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const isEditing = searchParams.get('edit') === 'true';

  const fetchDeal = useCallback(async () => {
    try {
      const dealData = await getDeal(params.id);
      setDeal(dealData);

      // Also fetch the pipeline for stage information
      const pipelineData = await getPipeline(dealData.pipelineId);
      setPipeline(pipelineData);
    } catch {
      toast.error('Impossible de charger l\'affaire');
      router.push('/deals');
    } finally {
      setIsLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    fetchDeal();
  }, [fetchDeal]);

  const handleUpdate = async (data: UpdateDealInput) => {
    if (!deal) return;
    setIsSaving(true);
    try {
      await updateDeal(deal.id, data);
      toast.success('Affaire mise à jour avec succès');
      router.push(`/deals/${deal.id}`);
      fetchDeal();
    } catch {
      toast.error('Impossible de mettre à jour l\'affaire');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (!deal) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEditing ? 'Modifier l\'affaire' : deal.name}
        actions={
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              isEditing ? router.push(`/deals/${deal.id}`) : router.push('/deals')
            }
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {isEditing ? 'Annuler' : 'Retour aux Affaires'}
          </Button>
        }
      />

      {isEditing ? (
        <div className="mx-auto max-w-2xl">
          <DealForm
            deal={deal}
            onSubmit={handleUpdate}
            onCancel={() => router.push(`/deals/${deal.id}`)}
            isLoading={isSaving}
          />
        </div>
      ) : (
        <DealDetail
          deal={deal}
          pipeline={pipeline ?? undefined}
          onUpdate={fetchDeal}
        />
      )}
    </div>
  );
}
