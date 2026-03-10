'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { EmptyState } from '@/components/empty-state';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { DataTable } from '@/components/data-table';
import {
  getEmailTemplates,
  deleteEmailTemplate,
  type EmailTemplate,
} from '@/lib/api/email-templates';
import { getEmailTemplateColumns } from '@/features/marketing/templates';

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<EmailTemplate | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTemplates = useCallback(async () => {
    try {
      const response = await getEmailTemplates({ limit: 100 });
      setTemplates(response.data);
    } catch {
      toast.error('Impossible de charger les modèles d\'e-mail');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteEmailTemplate(deleteTarget.id);
      toast.success('Modèle supprimé');
      setDeleteTarget(null);
      fetchTemplates();
    } catch {
      toast.error('Impossible de supprimer le modèle');
    } finally {
      setIsDeleting(false);
    }
  }

  const columns = getEmailTemplateColumns({
    onDelete: setDeleteTarget,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Modèles d'e-mail" />
        <div className="h-96 flex items-center justify-center text-muted-foreground">
          Chargement...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Modèles d'e-mail"
        description="Concevez des modèles d'e-mail réutilisables pour vos campagnes marketing."
        actions={
          <Button asChild>
            <Link href="/marketing/templates/new">
              <Plus className="mr-2 h-4 w-4" />
              Créer un modèle
            </Link>
          </Button>
        }
      />

      {templates.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Aucun modèle d'e-mail pour le moment"
          description="Créez votre premier modèle d'e-mail pour commencer à construire des campagnes marketing."
          action={
            <Button asChild>
              <Link href="/marketing/templates/new">
                <Plus className="mr-2 h-4 w-4" />
                Créer un modèle
              </Link>
            </Button>
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={templates}
          searchKey="name"
          searchPlaceholder="Rechercher des modèles..."
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Supprimer le modèle d'e-mail"
        description={`Êtes-vous sûr de vouloir supprimer « ${deleteTarget?.name} » ? Cette action est irréversible. Les campagnes utilisant ce modèle ne seront pas affectées.`}
        confirmLabel="Supprimer"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
