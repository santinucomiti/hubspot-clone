'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { DataTable } from '@/components/data-table';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
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
import { ConfirmDialog } from '@/components/confirm-dialog';
import {
  type Ticket,
  type TicketStatus,
  type TicketPriority,
  type TicketQueryParams,
  getTickets,
  deleteTicket,
} from '@/lib/api/tickets';

const statusOptions: { label: string; value: TicketStatus }[] = [
  { label: 'Ouvert', value: 'OPEN' },
  { label: 'En cours', value: 'IN_PROGRESS' },
  { label: 'En attente', value: 'WAITING' },
  { label: 'Résolu', value: 'RESOLVED' },
  { label: 'Fermé', value: 'CLOSED' },
];

const priorityOptions: { label: string; value: TicketPriority }[] = [
  { label: 'Basse', value: 'LOW' },
  { label: 'Moyenne', value: 'MEDIUM' },
  { label: 'Haute', value: 'HIGH' },
  { label: 'Urgente', value: 'URGENT' },
];

export function TicketsTable() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<TicketQueryParams>({
    page: 1,
    limit: 25,
  });
  const [deleteTarget, setDeleteTarget] = useState<Ticket | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTickets = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getTickets(filters);
      setTickets(response.data);
    } catch {
      toast.error('Échec du chargement des tickets');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteTicket(deleteTarget.id);
      toast.success('Ticket supprimé');
      setDeleteTarget(null);
      fetchTickets();
    } catch {
      toast.error('Échec de la suppression du ticket');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFilterChange = (
    key: keyof TicketQueryParams,
    value: string | undefined,
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
      page: 1,
    }));
  };

  const columns: ColumnDef<Ticket>[] = [
    {
      accessorKey: 'subject',
      header: 'Objet',
      cell: ({ row }) => (
        <button
          className="text-left font-medium text-primary hover:underline"
          onClick={() => router.push(`/tickets/${row.original.id}`)}
        >
          {row.original.subject}
        </button>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Statut',
      cell: ({ row }) => (
        <StatusBadge status={row.original.status} type="ticketStatus" />
      ),
    },
    {
      accessorKey: 'priority',
      header: 'Priorité',
      cell: ({ row }) => (
        <StatusBadge status={row.original.priority} type="ticketPriority" />
      ),
    },
    {
      accessorKey: 'category',
      header: 'Catégorie',
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.category || '\u2014'}
        </span>
      ),
    },
    {
      accessorKey: 'owner',
      header: 'Propriétaire',
      cell: ({ row }) => {
        const owner = row.original.owner;
        return owner ? (
          <span>{owner.firstName} {owner.lastName}</span>
        ) : (
          <span className="text-muted-foreground">Non assigné</span>
        );
      },
    },
    {
      accessorKey: 'contact',
      header: 'Contact',
      cell: ({ row }) => {
        const contact = row.original.contact;
        return contact ? (
          <button
            className="text-primary hover:underline"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/contacts/${contact.id}`);
            }}
          >
            {contact.firstName} {contact.lastName}
          </button>
        ) : (
          <span className="text-muted-foreground">{'\u2014'}</span>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Créé',
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </span>
      ),
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
            <DropdownMenuItem
              onClick={() => router.push(`/tickets/${row.original.id}`)}
            >
              Voir les détails
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => setDeleteTarget(row.original)}
            >
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const filterToolbar = (
    <div className="flex items-center gap-2">
      <Select
        value={filters.status || ''}
        onValueChange={(value) =>
          handleFilterChange('status', value === 'ALL' ? undefined : value)
        }
      >
        <SelectTrigger className="h-8 w-[140px]">
          <SelectValue placeholder="Statut" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Tous les statuts</SelectItem>
          {statusOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.priority || ''}
        onValueChange={(value) =>
          handleFilterChange('priority', value === 'ALL' ? undefined : value)
        }
      >
        <SelectTrigger className="h-8 w-[140px]">
          <SelectValue placeholder="Priorité" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Toutes les priorités</SelectItem>
          {priorityOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={tickets}
        searchKey="subject"
        searchPlaceholder="Rechercher des tickets..."
        toolbar={filterToolbar}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Supprimer le ticket"
        description={`Êtes-vous sûr de vouloir supprimer "${deleteTarget?.subject}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </>
  );
}
