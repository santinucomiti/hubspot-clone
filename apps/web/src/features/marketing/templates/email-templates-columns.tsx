'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import Link from 'next/link';
import { MoreHorizontal, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTableColumnHeader } from '@/components/data-table';
import type { EmailTemplate } from '@/lib/api/email-templates';

interface ColumnActions {
  onDelete: (template: EmailTemplate) => void;
}

export function getEmailTemplateColumns(
  actions: ColumnActions,
): ColumnDef<EmailTemplate>[] {
  return [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Nom" />
      ),
      cell: ({ row }) => (
        <Link
          href={`/marketing/templates/${row.original.id}`}
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
        <span className="text-muted-foreground">
          {row.getValue('subject')}
        </span>
      ),
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
      accessorKey: 'updatedAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Mis à jour" />
      ),
      cell: ({ row }) =>
        format(new Date(row.getValue('updatedAt')), 'MMM d, yyyy'),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Ouvrir le menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/marketing/templates/${row.original.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                Voir / Modifier
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => actions.onDelete(row.original)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
}
