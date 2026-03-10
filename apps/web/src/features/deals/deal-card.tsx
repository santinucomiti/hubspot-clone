'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Link from 'next/link';
import { Calendar, DollarSign, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Deal } from '@/lib/api/deals';
import { formatCurrency, formatDate, isOverdue } from './utils';

interface DealCardProps {
  deal: Deal;
  isDragging?: boolean;
}

export function DealCard({ deal, isDragging }: DealCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: deal.id,
    data: {
      type: 'deal',
      deal,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const dragging = isDragging || isSortableDragging;
  const overdue = isOverdue(deal.closeDate);

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Link href={`/deals/${deal.id}`}>
        <Card
          className={cn(
            'cursor-grab transition-shadow hover:shadow-md',
            dragging && 'opacity-50 shadow-lg rotate-2',
            overdue && 'border-l-4 border-l-red-500',
          )}
        >
          <CardContent className="p-3 space-y-2">
            {/* Deal Name */}
            <p className="font-medium text-sm leading-tight line-clamp-2">
              {deal.name}
            </p>

            {/* Amount */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <DollarSign className="h-3 w-3" />
              <span className="font-semibold text-foreground">
                {formatCurrency(deal.amount, deal.currency)}
              </span>
            </div>

            {/* Close Date */}
            {deal.closeDate && (
              <div
                className={cn(
                  'flex items-center gap-1 text-xs',
                  overdue ? 'text-red-600 font-medium' : 'text-muted-foreground',
                )}
              >
                <Calendar className="h-3 w-3" />
                <span>{formatDate(deal.closeDate)}</span>
              </div>
            )}

            {/* Owner */}
            {deal.owner && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <User className="h-3 w-3" />
                <span>
                  {deal.owner.firstName} {deal.owner.lastName}
                </span>
              </div>
            )}

            {/* Contact badges */}
            {deal.contacts && deal.contacts.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {deal.contacts.slice(0, 2).map((contact) => (
                  <span
                    key={contact.id}
                    className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
                  >
                    {contact.firstName} {contact.lastName}
                  </span>
                ))}
                {deal.contacts.length > 2 && (
                  <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                    +{deal.contacts.length - 2}
                  </span>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}

/**
 * Overlay version of DealCard for drag overlay (no interactivity).
 */
export function DealCardOverlay({ deal }: { deal: Deal }) {
  const overdue = isOverdue(deal.closeDate);

  return (
    <Card
      className={cn(
        'shadow-xl rotate-2 w-[260px]',
        overdue && 'border-l-4 border-l-red-500',
      )}
    >
      <CardContent className="p-3 space-y-2">
        <p className="font-medium text-sm leading-tight line-clamp-2">
          {deal.name}
        </p>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <DollarSign className="h-3 w-3" />
          <span className="font-semibold text-foreground">
            {formatCurrency(deal.amount, deal.currency)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
