'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import Link from 'next/link';
import { MoreHorizontal, Eye, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTableColumnHeader } from '@/components/data-table';
import { StatusBadge } from '@/components/status-badge';
import type { Campaign } from '@/lib/api/campaigns';

interface ColumnActions {
  onCancel: (campaign: Campaign) => void;
}

export function getCampaignColumns(
  actions: ColumnActions,
): ColumnDef<Campaign>[] {
  return [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Nom" />
      ),
      cell: ({ row }) => (
        <Link
          href={`/marketing/campaigns/${row.original.id}`}
          className="font-medium text-primary hover:underline"
        >
          {row.getValue('name')}
        </Link>
      ),
    },
    {
      accessorKey: 'subject',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Objet" />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground max-w-[200px] truncate block">
          {row.getValue('subject')}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Statut" />
      ),
      cell: ({ row }) => (
        <StatusBadge
          status={row.getValue('status')}
          type="campaignStatus"
        />
      ),
    },
    {
      accessorKey: 'scheduledAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Planifié" />
      ),
      cell: ({ row }) => {
        const date = row.getValue('scheduledAt') as string | null;
        return date
          ? format(new Date(date), 'MMM d, yyyy HH:mm')
          : '-';
      },
    },
    {
      accessorKey: 'sentAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Envoyé" />
      ),
      cell: ({ row }) => {
        const date = row.getValue('sentAt') as string | null;
        return date
          ? format(new Date(date), 'MMM d, yyyy HH:mm')
          : '-';
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Créé" />
      ),
      cell: ({ row }) =>
        format(new Date(row.getValue('createdAt')), 'MMM d, yyyy'),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const campaign = row.original;
        const canCancel =
          campaign.status === 'SCHEDULED' || campaign.status === 'DRAFT';

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
                <Link href={`/marketing/campaigns/${campaign.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  Voir les détails
                </Link>
              </DropdownMenuItem>
              {canCancel && (
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => actions.onCancel(campaign)}
                >
                  <Ban className="mr-2 h-4 w-4" />
                  Annuler
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
