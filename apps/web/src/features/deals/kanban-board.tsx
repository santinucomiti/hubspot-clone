'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  closestCorners,
} from '@dnd-kit/core';
import { toast } from 'sonner';
import type { Deal } from '@/lib/api/deals';
import { moveDealStage } from '@/lib/api/deals';
import type { Pipeline } from '@/lib/api/pipelines';
import { KanbanColumn } from './kanban-column';
import { DealCardOverlay } from './deal-card';

interface KanbanBoardProps {
  pipeline: Pipeline;
  deals: Deal[];
  onDealMoved?: () => void;
}

export function KanbanBoard({
  pipeline,
  deals: initialDeals,
  onDealMoved,
}: KanbanBoardProps) {
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);

  // Update deals when parent re-fetches
  useMemo(() => {
    setDeals(initialDeals);
  }, [initialDeals]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement to start drag (prevents click conflicts)
      },
    }),
  );

  // Group deals by stage
  const dealsByStage = useMemo(() => {
    const grouped: Record<string, Deal[]> = {};
    for (const stage of pipeline.stages) {
      grouped[stage.id] = [];
    }
    for (const deal of deals) {
      if (grouped[deal.stageId]) {
        grouped[deal.stageId].push(deal);
      }
    }
    return grouped;
  }, [deals, pipeline.stages]);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const deal = deals.find((d) => d.id === active.id);
      if (deal) {
        setActiveDeal(deal);
      }
    },
    [deals],
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveDeal(null);

      if (!over) return;

      const dealId = active.id as string;
      const deal = deals.find((d) => d.id === dealId);
      if (!deal) return;

      // Determine target stage ID
      let targetStageId: string;
      const overData = over.data.current;

      if (overData?.type === 'column') {
        targetStageId = over.id as string;
      } else if (overData?.type === 'deal') {
        // Dropped on another deal card — move to that deal's stage
        const targetDeal = deals.find((d) => d.id === over.id);
        if (!targetDeal) return;
        targetStageId = targetDeal.stageId;
      } else {
        targetStageId = over.id as string;
      }

      // No change needed
      if (deal.stageId === targetStageId) return;

      // Optimistic update — move deal to new stage in local state
      setDeals((prev) =>
        prev.map((d) =>
          d.id === dealId ? { ...d, stageId: targetStageId } : d,
        ),
      );

      try {
        await moveDealStage(dealId, targetStageId);
        const targetStage = pipeline.stages.find((s) => s.id === targetStageId);
        toast.success(
          `Moved "${deal.name}" to ${targetStage?.name ?? 'new stage'}`,
        );
        onDealMoved?.();
      } catch {
        // Revert optimistic update on failure
        setDeals((prev) =>
          prev.map((d) =>
            d.id === dealId ? { ...d, stageId: deal.stageId } : d,
          ),
        );
        toast.error('Failed to move deal. Please try again.');
      }
    },
    [deals, pipeline.stages, onDealMoved],
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {pipeline.stages.map((stage) => (
          <KanbanColumn
            key={stage.id}
            stage={stage}
            deals={dealsByStage[stage.id] ?? []}
          />
        ))}
      </div>

      <DragOverlay>
        {activeDeal ? <DealCardOverlay deal={activeDeal} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
