'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Calendar,
  DollarSign,
  Edit,
  Trash2,
  Trophy,
  XCircle,
  User,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from '@/components/status-badge';
import { ConfirmDialog } from '@/components/confirm-dialog';
import type { Deal } from '@/lib/api/deals';
import { updateDeal, deleteDeal } from '@/lib/api/deals';
import type { Pipeline } from '@/lib/api/pipelines';
import {
  formatCurrency,
  formatDate,
  getDealStatus,
  isOverdue,
} from './utils';
import { DealWonLostDialog } from './deal-won-lost-dialog';

interface DealDetailProps {
  deal: Deal;
  pipeline?: Pipeline;
  onUpdate: () => void;
}

export function DealDetail({ deal, pipeline, onUpdate }: DealDetailProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showWonDialog, setShowWonDialog] = useState(false);
  const [showLostDialog, setShowLostDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const status = getDealStatus(deal.stage);
  const overdue = isOverdue(deal.closeDate);

  const handleMarkWon = async () => {
    if (!pipeline) return;
    const wonStage = pipeline.stages.find((s) => s.isWon);
    if (!wonStage) {
      toast.error('No "Won" stage configured in this pipeline');
      return;
    }
    try {
      await updateDeal(deal.id, { stageId: wonStage.id });
      toast.success('Deal marked as won!');
      onUpdate();
    } catch {
      toast.error('Failed to update deal');
      throw new Error('Failed');
    }
  };

  const handleMarkLost = async (reason?: string) => {
    if (!pipeline) return;
    const lostStage = pipeline.stages.find((s) => s.isLost);
    if (!lostStage) {
      toast.error('No "Lost" stage configured in this pipeline');
      return;
    }
    try {
      await updateDeal(deal.id, {
        stageId: lostStage.id,
        lostReason: reason,
      });
      toast.success('Deal marked as lost');
      onUpdate();
    } catch {
      toast.error('Failed to update deal');
      throw new Error('Failed');
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteDeal(deal.id);
      toast.success('Deal deleted');
      router.push('/deals');
    } catch {
      toast.error('Failed to delete deal');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header Card */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <CardTitle className="text-2xl">{deal.name}</CardTitle>
                  <StatusBadge status={status} type="dealStatus" />
                </div>
                <CardDescription className="mt-1">
                  {deal.stage?.name ?? 'Unknown Stage'} &middot;{' '}
                  {pipeline?.name ?? 'Unknown Pipeline'}
                </CardDescription>
              </div>

              <div className="flex items-center gap-2">
                {status === 'ACTIVE' && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                      onClick={() => setShowWonDialog(true)}
                    >
                      <Trophy className="mr-1.5 h-4 w-4" />
                      Won
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-300 hover:bg-red-50"
                      onClick={() => setShowLostDialog(true)}
                    >
                      <XCircle className="mr-1.5 h-4 w-4" />
                      Lost
                    </Button>
                  </>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => router.push(`/deals/${deal.id}?edit=true`)}
                >
                  <Edit className="mr-1.5 h-4 w-4" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {/* Amount */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(deal.amount, deal.currency)}
                  </p>
                </div>
              </div>

              {/* Close Date */}
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    overdue ? 'bg-red-100' : 'bg-primary/10'
                  }`}
                >
                  <Calendar
                    className={`h-5 w-5 ${overdue ? 'text-red-600' : 'text-primary'}`}
                  />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Close Date</p>
                  <p
                    className={`text-lg font-semibold ${overdue ? 'text-red-600' : ''}`}
                  >
                    {formatDate(deal.closeDate)}
                    {overdue && (
                      <span className="ml-2 text-xs font-normal text-red-500">
                        Overdue
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Owner */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Owner</p>
                  <p className="text-lg font-semibold">
                    {deal.owner
                      ? `${deal.owner.firstName} ${deal.owner.lastName}`
                      : 'Unassigned'}
                  </p>
                </div>
              </div>

              {/* Probability */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Trophy className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Probability</p>
                  <p className="text-lg font-semibold">
                    {deal.stage?.probability ?? 0}%
                  </p>
                </div>
              </div>
            </div>

            {/* Lost Reason */}
            {deal.lostReason && (
              <>
                <Separator className="my-4" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Lost Reason
                  </p>
                  <p className="mt-1 text-sm">{deal.lostReason}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Associations */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Associated Contacts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4" />
                Associated Contacts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {deal.contacts && deal.contacts.length > 0 ? (
                <div className="space-y-3">
                  {deal.contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {contact.firstName} {contact.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {contact.email}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/contacts/${contact.id}`)}
                      >
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No contacts associated
                </p>
              )}
            </CardContent>
          </Card>

          {/* Associated Companies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="h-4 w-4" />
                Associated Companies
              </CardTitle>
            </CardHeader>
            <CardContent>
              {deal.companies && deal.companies.length > 0 ? (
                <div className="space-y-3">
                  {deal.companies.map((company) => (
                    <div
                      key={company.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium">{company.name}</p>
                        {company.domain && (
                          <p className="text-xs text-muted-foreground">
                            {company.domain}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          router.push(`/companies/${company.id}`)
                        }
                      >
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No companies associated
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Activity Timeline (placeholder) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Activity Timeline</CardTitle>
            <CardDescription>
              Notes, calls, emails, and meetings related to this deal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Activity timeline will be populated from the Activities module.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <DealWonLostDialog
        open={showWonDialog}
        onOpenChange={setShowWonDialog}
        type="won"
        dealName={deal.name}
        onConfirm={handleMarkWon}
      />

      <DealWonLostDialog
        open={showLostDialog}
        onOpenChange={setShowLostDialog}
        type="lost"
        dealName={deal.name}
        onConfirm={handleMarkLost}
      />

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Deal"
        description={`Are you sure you want to delete "${deal.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </>
  );
}
