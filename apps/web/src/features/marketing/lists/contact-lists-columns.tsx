'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import Link from 'next/link';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTableColumnHeader } from '@/components/data-table';
import type { ContactList } from '@/lib/api/contact-lists';

interface ColumnActions {
  onDelete: (list: ContactList) => void;
}

export function getContactListColumns(
  actions: ColumnActions,
): ColumnDef<ContactList>[] {
  return [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Nom" />
      ),
      cell: ({ row }) => (
        <Link
          href={`/marketing/lists/${row.original.id}`}
          className="font-medium text-primary hover:underline"
        >
          {row.getValue('name')}
        </Link>
      ),
    },
    {
      accessorKey: 'type',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type" />
      ),
      cell: ({ row }) => {
        const type = row.getValue('type') as string;
        return (
          <Badge variant="outline" className={
            type === 'STATIC'
              ? 'bg-blue-500/10 text-blue-700 border-blue-500/20'
              : 'bg-purple-500/10 text-purple-700 border-purple-500/20'
          }>
            {type === 'STATIC' ? 'statique' : 'dynamique'}
          </Badge>
        );
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
              <Link href={`/marketing/lists/${row.original.id}`}>
                <Pencil className="mr-2 h-4 w-4" />
                Modifier
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
