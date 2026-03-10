'use client';

import Link from 'next/link';
import type { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { DataTable, DataTableColumnHeader } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/status-badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Deal } from '@/lib/api/deals';
import { formatCurrency, formatDate, getDealStatus } from './utils';

interface DealsTableProps {
  deals: Deal[];
  onDelete?: (deal: Deal) => void;
}

const columns: ColumnDef<Deal>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nom" />
    ),
    cell: ({ row }) => (
      <Link
        href={`/deals/${row.original.id}`}
        className="font-medium text-primary hover:underline"
      >
        {row.getValue('name')}
      </Link>
    ),
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Montant" />
    ),
    cell: ({ row }) =>
      formatCurrency(row.original.amount, row.original.currency),
  },
  {
    accessorKey: 'stage',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Étape" />
    ),
    cell: ({ row }) => row.original.stage?.name ?? '-',
    filterFn: (row, _id, value) => {
      return value.includes(row.original.stageId);
    },
  },
  {
    id: 'status',
    header: 'Statut',
    cell: ({ row }) => {
      const status = getDealStatus(row.original.stage);
      return <StatusBadge status={status} type="dealStatus" />;
    },
  },
  {
    accessorKey: 'closeDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date de clôture" />
    ),
    cell: ({ row }) => formatDate(row.original.closeDate),
  },
  {
    id: 'owner',
    header: 'Propriétaire',
    cell: ({ row }) =>
      row.original.owner
        ? `${row.original.owner.firstName} ${row.original.owner.lastName}`
        : '-',
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const deal = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Ouvrir le menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/deals/${deal.id}`}>Voir les détails</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/deals/${deal.id}?edit=true`}>Modifier</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function DealsTable({ deals }: DealsTableProps) {
  return (
    <DataTable
      columns={columns}
      data={deals}
      searchKey="name"
      searchPlaceholder="Rechercher des affaires..."
    />
  );
}
