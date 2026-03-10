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
  { label: 'Open', value: 'OPEN' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Waiting', value: 'WAITING' },
  { label: 'Resolved', value: 'RESOLVED' },
  { label: 'Closed', value: 'CLOSED' },
];

const priorityOptions: { label: string; value: TicketPriority }[] = [
  { label: 'Low', value: 'LOW' },
  { label: 'Medium', value: 'MEDIUM' },
  { label: 'High', value: 'HIGH' },
  { label: 'Urgent', value: 'URGENT' },
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
      toast.error('Failed to load tickets');
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
      toast.success('Ticket deleted');
      setDeleteTarget(null);
      fetchTickets();
    } catch {
      toast.error('Failed to delete ticket');
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
      header: 'Subject',
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
      header: 'Status',
      cell: ({ row }) => (
        <StatusBadge status={row.original.status} type="ticketStatus" />
      ),
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ row }) => (
        <StatusBadge status={row.original.priority} type="ticketPriority" />
      ),
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.category || '\u2014'}
        </span>
      ),
    },
    {
      accessorKey: 'owner',
      header: 'Owner',
      cell: ({ row }) => {
        const owner = row.original.owner;
        return owner ? (
          <span>{owner.firstName} {owner.lastName}</span>
        ) : (
          <span className="text-muted-foreground">Unassigned</span>
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
      header: 'Created',
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
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => router.push(`/tickets/${row.original.id}`)}
            >
              View details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => setDeleteTarget(row.original)}
            >
              Delete
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
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All statuses</SelectItem>
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
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All priorities</SelectItem>
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
        searchPlaceholder="Search tickets..."
        toolbar={filterToolbar}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete ticket"
        description={`Are you sure you want to delete "${deleteTarget?.subject}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </>
  );
}
