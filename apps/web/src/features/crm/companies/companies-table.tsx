'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { type ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { DataTable } from '@/components/data-table';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { deleteCompany, type Company } from '@/lib/api/companies';

interface CompaniesTableProps {
  companies: Company[];
  onRefresh: () => void;
}

export function CompaniesTable({ companies, onRefresh }: CompaniesTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = useCallback(async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteCompany(deleteId);
      toast.success('Company deleted');
      onRefresh();
    } catch {
      toast.error('Failed to delete company');
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  }, [deleteId, onRefresh]);

  const columns: ColumnDef<Company>[] = useMemo(() => [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <Link href={`/companies/${row.original.id}`} className="font-medium text-primary hover:underline">
          {row.original.name}
        </Link>
      ),
    },
    { accessorKey: 'domain', header: 'Domain', cell: ({ row }) => row.original.domain || '\u2014' },
    { accessorKey: 'industry', header: 'Industry', cell: ({ row }) => row.original.industry || '\u2014' },
    { accessorKey: 'size', header: 'Size', cell: ({ row }) => row.original.size || '\u2014' },
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
            <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild><Link href={`/companies/${row.original.id}`}>View</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link href={`/companies/${row.original.id}?edit=true`}>Edit</Link></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(row.original.id)}>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ], []);

  return (
    <>
      <DataTable columns={columns} data={companies} searchKey="name" searchPlaceholder="Search companies..." />
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Company"
        description="This action cannot be undone. This will permanently delete the company and disassociate its contacts."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </>
  );
}
