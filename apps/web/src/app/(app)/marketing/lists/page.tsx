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
      toast.error('Failed to load contact lists');
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
      toast.success('Contact list deleted');
      setDeleteTarget(null);
      fetchLists();
    } catch {
      toast.error('Failed to delete contact list');
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
        <PageHeader title="Contact Lists" />
        <div className="h-96 flex items-center justify-center text-muted-foreground">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contact Lists"
        description="Organize contacts into static or dynamic lists for targeted campaigns."
        actions={
          <Button asChild>
            <Link href="/marketing/lists/new">
              <Plus className="mr-2 h-4 w-4" />
              Create List
            </Link>
          </Button>
        }
      />

      {lists.length === 0 ? (
        <EmptyState
          icon={List}
          title="No contact lists yet"
          description="Create your first contact list to organize contacts for email campaigns."
          action={
            <Button asChild>
              <Link href="/marketing/lists/new">
                <Plus className="mr-2 h-4 w-4" />
                Create List
              </Link>
            </Button>
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={lists}
          searchKey="name"
          searchPlaceholder="Search lists..."
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Contact List"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
