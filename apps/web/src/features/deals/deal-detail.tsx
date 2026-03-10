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
      toast.error('Aucune étape "Gagnée" configurée dans ce pipeline');
      return;
    }
    try {
      await updateDeal(deal.id, { stageId: wonStage.id });
      toast.success('Affaire marquée comme gagnée !');
      onUpdate();
    } catch {
      toast.error('Échec de la mise à jour de l\'affaire');
      throw new Error('Failed');
    }
  };

  const handleMarkLost = async (reason?: string) => {
    if (!pipeline) return;
    const lostStage = pipeline.stages.find((s) => s.isLost);
    if (!lostStage) {
      toast.error('Aucune étape "Perdue" configurée dans ce pipeline');
      return;
    }
    try {
      await updateDeal(deal.id, {
        stageId: lostStage.id,
        lostReason: reason,
      });
      toast.success('Affaire marquée comme perdue');
      onUpdate();
    } catch {
      toast.error('Échec de la mise à jour de l\'affaire');
      throw new Error('Failed');
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteDeal(deal.id);
      toast.success('Affaire supprimée');
      router.push('/deals');
    } catch {
      toast.error('Échec de la suppression de l\'affaire');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Carte d'en-tête */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <CardTitle className="text-2xl">{deal.name}</CardTitle>
                  <StatusBadge status={status} type="dealStatus" />
                </div>
                <CardDescription className="mt-1">
                  {deal.stage?.name ?? 'Étape inconnue'} &middot;{' '}
                  {pipeline?.name ?? 'Pipeline inconnu'}
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
                      Gagnée
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-300 hover:bg-red-50"
                      onClick={() => setShowLostDialog(true)}
                    >
                      <XCircle className="mr-1.5 h-4 w-4" />
                      Perdue
                    </Button>
                  </>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => router.push(`/deals/${deal.id}?edit=true`)}
                >
                  <Edit className="mr-1.5 h-4 w-4" />
                  Modifier
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
              {/* Montant */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Montant</p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(deal.amount, deal.currency)}
                  </p>
                </div>
              </div>

              {/* Date de clôture */}
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
                  <p className="text-sm text-muted-foreground">Date de clôture</p>
                  <p
                    className={`text-lg font-semibold ${overdue ? 'text-red-600' : ''}`}
                  >
                    {formatDate(deal.closeDate)}
                    {overdue && (
                      <span className="ml-2 text-xs font-normal text-red-500">
                        En retard
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Propriétaire */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Propriétaire</p>
                  <p className="text-lg font-semibold">
                    {deal.owner
                      ? `${deal.owner.firstName} ${deal.owner.lastName}`
                      : 'Non assigné'}
                  </p>
                </div>
              </div>

              {/* Probabilité */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Trophy className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Probabilité</p>
                  <p className="text-lg font-semibold">
                    {deal.stage?.probability ?? 0}%
                  </p>
                </div>
              </div>
            </div>

            {/* Raison de la perte */}
            {deal.lostReason && (
              <>
                <Separator className="my-4" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Raison de la perte
                  </p>
                  <p className="mt-1 text-sm">{deal.lostReason}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Associations */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Contacts associés */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4" />
                Contacts associés
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
                        Voir
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Aucun contact associé
                </p>
              )}
            </CardContent>
          </Card>

          {/* Entreprises associées */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="h-4 w-4" />
                Entreprises associées
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
                        Voir
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Aucune entreprise associée
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Chronologie d'activité (espace réservé) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Chronologie d&apos;activité</CardTitle>
            <CardDescription>
              Notes, appels, e-mails et réunions liés à cette affaire
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              La chronologie d&apos;activité sera alimentée par le module Activités.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Dialogues */}
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
        title="Supprimer l'affaire"
        description={`Êtes-vous sûr de vouloir supprimer « ${deal.name} » ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </>
  );
}
