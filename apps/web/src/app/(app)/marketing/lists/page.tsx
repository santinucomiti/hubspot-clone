'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, List } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { EmptyState } from '@/components/empty-state';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { DataTable } from '@/components/data-table';
import {
  getContactLists,
  deleteContactList,
  type ContactList,
} from '@/lib/api/contact-lists';
import { getContactListColumns } from '@/features/marketing/lists';

export default function ContactListsPage() {
  const [lists, setLists] = useState<ContactList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<ContactList | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchLists = useCallback(async () => {
    try {
      const response = await getContactLists({ limit: 100 });
      setLists(response.data);
    } catch {
      toast.error('Impossible de charger les listes de contacts');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteContactList(deleteTarget.id);
      toast.success('Liste de contacts supprimée');
      setDeleteTarget(null);
      fetchLists();
    } catch {
      toast.error('Impossible de supprimer la liste de contacts');
    } finally {
      setIsDeleting(false);
    }
  }

  const columns = getContactListColumns({
    onDelete: setDeleteTarget,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Listes de contacts" />
        <div className="h-96 flex items-center justify-center text-muted-foreground">
          Chargement...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Listes de contacts"
        description="Organisez vos contacts en listes statiques ou dynamiques pour des campagnes ciblées."
        actions={
          <Button asChild>
            <Link href="/marketing/lists/new">
              <Plus className="mr-2 h-4 w-4" />
              Créer une liste
            </Link>
          </Button>
        }
      />

      {lists.length === 0 ? (
        <EmptyState
          icon={List}
          title="Aucune liste de contacts pour le moment"
          description="Créez votre première liste de contacts pour organiser les contacts de vos campagnes e-mail."
          action={
            <Button asChild>
              <Link href="/marketing/lists/new">
                <Plus className="mr-2 h-4 w-4" />
                Créer une liste
              </Link>
            </Button>
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={lists}
          searchKey="name"
          searchPlaceholder="Rechercher des listes..."
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Supprimer la liste de contacts"
        description={`Êtes-vous sûr de vouloir supprimer « ${deleteTarget?.name} » ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
