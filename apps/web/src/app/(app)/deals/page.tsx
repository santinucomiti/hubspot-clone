'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart3, Handshake, LayoutGrid, List, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/page-header';
import { EmptyState } from '@/components/empty-state';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { listDeals, type Deal } from '@/lib/api/deals';
import { listPipelines, type Pipeline } from '@/lib/api/pipelines';
import { KanbanBoard } from '@/features/deals/kanban-board';
import { DealsTable } from '@/features/deals/deals-table';
import { ForecastView } from '@/features/deals/forecast-view';

type ViewMode = 'kanban' | 'list' | 'forecast';

export default function DealsPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>('');
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const selectedPipeline = pipelines.find((p) => p.id === selectedPipelineId);

  const fetchData = useCallback(async () => {
    try {
      const pipelinesData = await listPipelines();
      setPipelines(pipelinesData);

      // Select default pipeline or first available
      const defaultPipeline =
        pipelinesData.find((p) => p.isDefault) ?? pipelinesData[0];
      if (defaultPipeline) {
        setSelectedPipelineId(defaultPipeline.id);
      }
    } catch {
      toast.error('Impossible de charger les pipelines');
    }
  }, []);

  const fetchDeals = useCallback(async () => {
    if (!selectedPipelineId) return;
    try {
      const response = await listDeals({
        pipelineId: selectedPipelineId,
        limit: 200,
      });
      setDeals(response.data);
    } catch {
      toast.error('Impossible de charger les affaires');
    } finally {
      setIsLoading(false);
    }
  }, [selectedPipelineId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (selectedPipelineId) {
      setIsLoading(true);
      fetchDeals();
    }
  }, [selectedPipelineId, fetchDeals]);

  if (isLoading && pipelines.length === 0) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="flex gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-96 w-72" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Affaires"
        description="Gérez votre pipeline de ventes et suivez l'avancement des affaires"
        actions={
          <Button onClick={() => router.push('/deals/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle affaire
          </Button>
        }
      />

      {/* Toolbar: Pipeline selector + View toggle */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          {pipelines.length > 1 && (
            <Select
              value={selectedPipelineId}
              onValueChange={setSelectedPipelineId}
            >
              <SelectTrigger className="w-[220px]">
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
          )}
        </div>

        <Tabs
          value={viewMode}
          onValueChange={(v) => setViewMode(v as ViewMode)}
        >
          <TabsList>
            <TabsTrigger value="kanban" className="gap-1.5">
              <LayoutGrid className="h-4 w-4" />
              Tableau
            </TabsTrigger>
            <TabsTrigger value="list" className="gap-1.5">
              <List className="h-4 w-4" />
              Liste
            </TabsTrigger>
            <TabsTrigger value="forecast" className="gap-1.5">
              <BarChart3 className="h-4 w-4" />
              Prévisions
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      {deals.length === 0 && !isLoading ? (
        <EmptyState
          icon={Handshake}
          title="Aucune affaire pour le moment"
          description="Créez votre première affaire pour commencer à suivre votre pipeline de ventes."
          action={
            <Button onClick={() => router.push('/deals/new')}>
              <Plus className="mr-2 h-4 w-4" />
              Créer une affaire
            </Button>
          }
        />
      ) : viewMode === 'kanban' && selectedPipeline ? (
        <KanbanBoard
          pipeline={selectedPipeline}
          deals={deals}
          onDealMoved={fetchDeals}
        />
      ) : viewMode === 'forecast' ? (
        <ForecastView />
      ) : (
        <DealsTable deals={deals} />
      )}
    </div>
  );
}
