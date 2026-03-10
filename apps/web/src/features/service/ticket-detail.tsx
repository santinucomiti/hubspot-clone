'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  Calendar,
  Handshake,
  User,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/status-badge';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { TicketStatusBar } from './ticket-status-bar';
import { TicketComments } from './ticket-comments';
import {
  type TicketDetail as TicketDetailType,
  type TicketComment,
  type TicketStatus,
  getTicket,
  deleteTicket,
} from '@/lib/api/tickets';

interface TicketDetailProps {
  ticketId: string;
}

export function TicketDetail({ ticketId }: TicketDetailProps) {
  const router = useRouter();
  const [ticket, setTicket] = useState<TicketDetailType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTicket = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getTicket(ticketId);
      setTicket(data);
    } catch {
      toast.error('Failed to load ticket');
      router.push('/tickets');
    } finally {
      setIsLoading(false);
    }
  }, [ticketId, router]);

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  const handleStatusChange = (newStatus: TicketStatus) => {
    if (ticket) {
      setTicket({ ...ticket, status: newStatus });
    }
  };

  const handleCommentAdded = (comment: TicketComment) => {
    if (ticket) {
      setTicket({
        ...ticket,
        comments: [...ticket.comments, comment],
      });
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteTicket(ticketId);
      toast.success('Ticket deleted');
      router.push('/tickets');
    } catch {
      toast.error('Failed to delete ticket');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!ticket) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/tickets')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{ticket.subject}</h1>
          <p className="text-sm text-muted-foreground">
            Created {new Date(ticket.createdAt).toLocaleDateString()} via{' '}
            {ticket.source.toLowerCase()}
          </p>
        </div>
        <Button
          variant="outline"
          className="text-destructive"
          onClick={() => setShowDeleteDialog(true)}
        >
          Delete
        </Button>
      </div>

      {/* Status bar */}
      <TicketStatusBar
        ticketId={ticket.id}
        currentStatus={ticket.status}
        onStatusChange={handleStatusChange}
      />

      {/* Content grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: description + comments */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {ticket.description && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: ticket.description }}
                />
              </CardContent>
            </Card>
          )}

          {/* Comments thread */}
          <Card>
            <CardContent className="pt-6">
              <TicketComments
                ticketId={ticket.id}
                comments={ticket.comments}
                onCommentAdded={handleCommentAdded}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right sidebar: ticket details */}
        <div className="space-y-6">
          {/* Ticket properties */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <StatusBadge status={ticket.status} type="ticketStatus" />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Priority</span>
                <StatusBadge status={ticket.priority} type="ticketPriority" />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Category</span>
                <span className="text-sm">{ticket.category || '\u2014'}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Source</span>
                <span className="text-sm capitalize">
                  {ticket.source.toLowerCase()}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Owner</span>
                <span className="text-sm">
                  {ticket.owner
                    ? `${ticket.owner.firstName} ${ticket.owner.lastName}`
                    : 'Unassigned'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Associations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Associations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Contact */}
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                {ticket.contact ? (
                  <Link
                    href={`/contacts/${ticket.contact.id}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {ticket.contact.firstName} {ticket.contact.lastName}
                  </Link>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    No contact linked
                  </span>
                )}
              </div>

              {/* Company */}
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                {ticket.company ? (
                  <Link
                    href={`/companies/${ticket.company.id}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {ticket.company.name}
                  </Link>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    No company linked
                  </span>
                )}
              </div>

              {/* Deal */}
              <div className="flex items-center gap-2">
                <Handshake className="h-4 w-4 text-muted-foreground" />
                {ticket.deal ? (
                  <Link
                    href={`/deals/${ticket.deal.id}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {ticket.deal.name}
                  </Link>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    No deal linked
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Status history */}
          {ticket.statusHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Status History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {ticket.statusHistory.map((entry) => (
                    <div key={entry.id} className="flex items-start gap-2">
                      <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
                      <div className="text-sm">
                        <span className="font-medium">
                          {entry.changedBy.firstName} {entry.changedBy.lastName}
                        </span>{' '}
                        changed status from{' '}
                        <StatusBadge
                          status={entry.fromStatus}
                          type="ticketStatus"
                          className="mx-1 inline-flex"
                        />{' '}
                        to{' '}
                        <StatusBadge
                          status={entry.toStatus}
                          type="ticketStatus"
                          className="mx-1 inline-flex"
                        />
                        <p className="text-xs text-muted-foreground">
                          {new Date(entry.changedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete ticket"
        description={`Are you sure you want to delete "${ticket.subject}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
