'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { type ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { DataTable } from '@/components/data-table';
import { StatusBadge } from '@/components/status-badge';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Contact } from '@/lib/api/contacts';
import { deleteContact, bulkContactAction } from '@/lib/api/contacts';

interface ContactsTableProps {
  contacts: Contact[];
  onRefresh: () => void;
  users: { id: string; firstName: string; lastName: string }[];
}

export function ContactsTable({ contacts, onRefresh, users }: ContactsTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [bulkAction, setBulkAction] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleDelete = useCallback(async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteContact(deleteId);
      toast.success('Contact deleted');
      onRefresh();
    } catch {
      toast.error('Failed to delete contact');
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  }, [deleteId, onRefresh]);

  const handleBulkAction = useCallback(async (action: string, value?: string) => {
    if (selectedIds.length === 0) return;
    try {
      if (action === 'delete') {
        await bulkContactAction({ ids: selectedIds, action: 'delete' });
        toast.success(`${selectedIds.length} contact(s) deleted`);
      } else if (action === 'assignOwner' && value) {
        await bulkContactAction({ ids: selectedIds, action: 'assignOwner', ownerId: value });
        toast.success(`Owner assigned to ${selectedIds.length} contact(s)`);
      } else if (action === 'updateLifecycleStage' && value) {
        await bulkContactAction({ ids: selectedIds, action: 'updateLifecycleStage', lifecycleStage: value });
        toast.success(`Stage updated for ${selectedIds.length} contact(s)`);
      }
      setSelectedIds([]);
      onRefresh();
    } catch {
      toast.error('Bulk action failed');
    }
    setBulkAction(null);
  }, [selectedIds, onRefresh]);

  const columns: ColumnDef<Contact>[] = useMemo(() => [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => {
            table.toggleAllPageRowsSelected(!!value);
            const rows = table.getRowModel().rows;
            setSelectedIds(value ? rows.map((r) => r.original.id) : []);
          }}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => {
            row.toggleSelected(!!value);
            setSelectedIds((prev) =>
              value ? [...prev, row.original.id] : prev.filter((id) => id !== row.original.id)
            );
          }}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'firstName',
      header: 'Name',
      cell: ({ row }) => (
        <Link href={`/contacts/${row.original.id}`} className="font-medium text-primary hover:underline">
          {row.original.firstName} {row.original.lastName}
        </Link>
      ),
    },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'phone', header: 'Phone' },
    {
      accessorKey: 'lifecycleStage',
      header: 'Stage',
      cell: ({ row }) => <StatusBadge status={row.original.lifecycleStage} type="lifecycle" />,
    },
    {
      accessorKey: 'company',
      header: 'Company',
      cell: ({ row }) =>
        row.original.company ? (
          <Link href={`/companies/${row.original.company.id}`} className="hover:underline">
            {row.original.company.name}
          </Link>
        ) : (
          <span className="text-muted-foreground">&mdash;</span>
        ),
    },
    {
      accessorKey: 'owner',
      header: 'Owner',
      cell: ({ row }) => `${row.original.owner.firstName} ${row.original.owner.lastName}`,
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/contacts/${row.original.id}`}>View</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/contacts/${row.original.id}?edit=true`}>Edit</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(row.original.id)}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ], []);

  const bulkToolbar = selectedIds.length > 0 ? (
    <div className="flex items-center gap-2 ml-2">
      <span className="text-sm text-muted-foreground">{selectedIds.length} selected</span>
      <Select onValueChange={(v) => handleBulkAction('updateLifecycleStage', v)}>
        <SelectTrigger className="h-8 w-[160px]">
          <SelectValue placeholder="Set stage..." />
        </SelectTrigger>
        <SelectContent>
          {['SUBSCRIBER', 'LEAD', 'OPPORTUNITY', 'CUSTOMER'].map((s) => (
            <SelectItem key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select onValueChange={(v) => handleBulkAction('assignOwner', v)}>
        <SelectTrigger className="h-8 w-[160px]">
          <SelectValue placeholder="Assign owner..." />
        </SelectTrigger>
        <SelectContent>
          {users.map((u) => (
            <SelectItem key={u.id} value={u.id}>{u.firstName} {u.lastName}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button variant="destructive" size="sm" onClick={() => setBulkAction('delete')}>
        <Trash2 className="h-4 w-4 mr-1" /> Delete
      </Button>
    </div>
  ) : null;

  return (
    <>
      <DataTable columns={columns} data={contacts} searchKey="firstName" searchPlaceholder="Search contacts..." toolbar={bulkToolbar} />
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Contact"
        description="This action cannot be undone. This will permanently delete the contact."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
      <ConfirmDialog
        open={bulkAction === 'delete'}
        onOpenChange={(open) => !open && setBulkAction(null)}
        title="Delete Contacts"
        description={`This will permanently delete ${selectedIds.length} contact(s).`}
        confirmLabel="Delete All"
        variant="destructive"
        onConfirm={() => handleBulkAction('delete')}
      />
    </>
  );
}
