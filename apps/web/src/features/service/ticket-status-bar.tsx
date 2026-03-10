'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/status-badge';
import {
  type TicketStatus,
  updateTicketStatus,
} from '@/lib/api/tickets';

const statusFlow: Record<TicketStatus, TicketStatus[]> = {
  OPEN: ['IN_PROGRESS', 'WAITING', 'CLOSED'],
  IN_PROGRESS: ['WAITING', 'RESOLVED', 'CLOSED'],
  WAITING: ['IN_PROGRESS', 'RESOLVED', 'CLOSED'],
  RESOLVED: ['OPEN', 'CLOSED'],
  CLOSED: ['OPEN'],
};

const statusLabels: Record<TicketStatus, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  WAITING: 'Waiting',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};

interface TicketStatusBarProps {
  ticketId: string;
  currentStatus: TicketStatus;
  onStatusChange: (newStatus: TicketStatus) => void;
}

export function TicketStatusBar({
  ticketId,
  currentStatus,
  onStatusChange,
}: TicketStatusBarProps) {
  const [isUpdating, setIsUpdating] = useState<TicketStatus | null>(null);

  const availableTransitions = statusFlow[currentStatus] || [];

  const handleStatusChange = async (newStatus: TicketStatus) => {
    setIsUpdating(newStatus);
    try {
      await updateTicketStatus(ticketId, newStatus);
      onStatusChange(newStatus);
      toast.success(`Status changed to ${statusLabels[newStatus]}`);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">
          Status:
        </span>
        <StatusBadge status={currentStatus} type="ticketStatus" />
      </div>

      {availableTransitions.length > 0 && (
        <>
          <div className="h-6 w-px bg-border" />
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Move to:</span>
            {availableTransitions.map((status) => (
              <Button
                key={status}
                variant="outline"
                size="sm"
                disabled={isUpdating !== null}
                onClick={() => handleStatusChange(status)}
              >
                {isUpdating === status ? 'Updating...' : statusLabels[status]}
              </Button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
