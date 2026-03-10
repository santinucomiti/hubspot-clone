'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { listPipelines, type Pipeline } from '@/lib/api/pipelines';
import type { Deal, CreateDealInput, UpdateDealInput } from '@/lib/api/deals';
import { parseCurrencyToCents } from './utils';

const dealFormSchema = z.object({
  name: z.string().min(1, 'Le nom de l\'affaire est requis').max(200),
  amount: z.string().optional(),
  currency: z.string().optional(),
  closeDate: z.string().optional(),
  pipelineId: z.string().min(1, 'Le pipeline est requis'),
  stageId: z.string().min(1, 'L\'étape est requise'),
  ownerId: z.string().optional(),
});

type DealFormValues = z.infer<typeof dealFormSchema>;

interface DealFormProps {
  deal?: Deal;
  onSubmit: (data: CreateDealInput | UpdateDealInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function DealForm({
  deal,
  onSubmit,
  onCancel,
  isLoading = false,
}: DealFormProps) {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>(
    deal?.pipelineId ?? '',
  );

  const selectedPipeline = pipelines.find((p) => p.id === selectedPipelineId);
  const stages = selectedPipeline?.stages ?? [];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DealFormValues>({
    resolver: zodResolver(dealFormSchema),
    defaultValues: {
      name: deal?.name ?? '',
      amount: deal ? String(deal.amount / 100) : '',
      currency: deal?.currency ?? 'EUR',
      closeDate: deal?.closeDate
        ? format(new Date(deal.closeDate), 'yyyy-MM-dd')
        : '',
      pipelineId: deal?.pipelineId ?? '',
      stageId: deal?.stageId ?? '',
      ownerId: deal?.ownerId ?? '',
    },
  });

  const watchedPipelineId = watch('pipelineId');

  useEffect(() => {
    async function loadPipelines() {
      try {
        const data = await listPipelines();
        setPipelines(data);

        // Auto-select default pipeline if creating new deal
        if (!deal && data.length > 0) {
          const defaultPipeline = data.find((p) => p.isDefault) ?? data[0];
          setValue('pipelineId', defaultPipeline.id);
          setSelectedPipelineId(defaultPipeline.id);
          if (defaultPipeline.stages.length > 0) {
            setValue('stageId', defaultPipeline.stages[0].id);
          }
        }
      } catch {
        // Pipelines will be empty — form will show an error
      }
    }
    loadPipelines();
  }, [deal, setValue]);

  useEffect(() => {
    if (watchedPipelineId && watchedPipelineId !== selectedPipelineId) {
      setSelectedPipelineId(watchedPipelineId);
      const pipeline = pipelines.find((p) => p.id === watchedPipelineId);
      if (pipeline && pipeline.stages.length > 0) {
        setValue('stageId', pipeline.stages[0].id);
      }
    }
  }, [watchedPipelineId, selectedPipelineId, pipelines, setValue]);

  const onFormSubmit = (values: DealFormValues) => {
    const data: CreateDealInput | UpdateDealInput = {
      name: values.name,
      amount: values.amount ? parseCurrencyToCents(values.amount) : 0,
      currency: values.currency || 'EUR',
      closeDate: values.closeDate || undefined,
      pipelineId: values.pipelineId,
      stageId: values.stageId,
      ownerId: values.ownerId || undefined,
    };
    return onSubmit(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{deal ? 'Modifier l\'affaire' : 'Créer une nouvelle affaire'}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <CardContent className="space-y-4">
          {/* Nom de l'affaire */}
          <div className="space-y-2">
            <Label htmlFor="name">Nom de l&apos;affaire *</Label>
            <Input
              id="name"
              placeholder="ex. Acme Corp — Plan Entreprise"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Montant + Devise */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="amount">Montant</Label>
              <Input
                id="amount"
                placeholder="0,00"
                type="text"
                inputMode="decimal"
                {...register('amount')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Devise</Label>
              <Select
                value={watch('currency')}
                onValueChange={(v) => setValue('currency', v)}
              >
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date de clôture */}
          <div className="space-y-2">
            <Label htmlFor="closeDate">Date de clôture prévue</Label>
            <div className="relative">
              <Input id="closeDate" type="date" {...register('closeDate')} />
              <CalendarIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Pipeline */}
          <div className="space-y-2">
            <Label>Pipeline *</Label>
            <Select
              value={watch('pipelineId')}
              onValueChange={(v) => setValue('pipelineId', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un pipeline" />
              </SelectTrigger>
              <SelectContent>
                {pipelines.map((pipeline) => (
                  <SelectItem key={pipeline.id} value={pipeline.id}>
                    {pipeline.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.pipelineId && (
              <p className="text-sm text-red-500">
                {errors.pipelineId.message}
              </p>
            )}
          </div>

          {/* Étape */}
          <div className="space-y-2">
            <Label>Étape *</Label>
            <Select
              value={watch('stageId')}
              onValueChange={(v) => setValue('stageId', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une étape" />
              </SelectTrigger>
              <SelectContent>
                {stages.map((stage) => (
                  <SelectItem key={stage.id} value={stage.id}>
                    {stage.name} ({stage.probability}%)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.stageId && (
              <p className="text-sm text-red-500">{errors.stageId.message}</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? 'Enregistrement...'
              : deal
                ? 'Mettre à jour l\'affaire'
                : 'Créer une affaire'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
