'use client';

import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { cn } from '@/lib/utils';
import type { Deal } from '@/lib/api/deals';
import type { PipelineStage } from '@/lib/api/pipelines';
import { formatCurrency } from './utils';
import { DealCard } from './deal-card';

interface KanbanColumnProps {
  stage: PipelineStage;
  deals: Deal[];
}

export function KanbanColumn({ stage, deals }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
    data: {
      type: 'column',
      stage,
    },
  });

  const totalAmount = deals.reduce((sum, deal) => sum + deal.amount, 0);
  const dealIds = deals.map((d) => d.id);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col rounded-lg bg-muted/50 w-[280px] min-w-[280px] shrink-0',
        isOver && 'ring-2 ring-primary/50 bg-primary/5',
      )}
    >
      {/* En-tête de colonne */}
      <div className="p-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm">{stage.name}</h3>
            <span className="inline-flex items-center justify-center h-5 min-w-[20px] rounded-full bg-muted px-1.5 text-xs font-medium text-muted-foreground">
              {deals.length}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            {stage.probability}%
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {formatCurrency(totalAmount)}
        </p>
      </div>

      {/* Cartes */}
      <SortableContext items={dealIds} strategy={verticalListSortingStrategy}>
        <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-[100px]">
          {deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
