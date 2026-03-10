'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PageHeader } from '@/components/page-header';
import { createDeal, type CreateDealInput, type UpdateDealInput } from '@/lib/api/deals';
import { DealForm } from '@/features/deals/deal-form';

export default function NewDealPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: CreateDealInput | UpdateDealInput) => {
    setIsLoading(true);
    try {
      const deal = await createDeal(data as CreateDealInput);
      toast.success('Affaire créée avec succès');
      router.push(`/deals/${deal.id}`);
    } catch {
      toast.error('Impossible de créer l\'affaire');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Nouvelle affaire" />
      <DealForm
        onSubmit={handleSubmit}
        onCancel={() => router.push('/deals')}
        isLoading={isLoading}
      />
    </div>
  );
}
