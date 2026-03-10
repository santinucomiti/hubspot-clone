'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus, Users } from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { EmptyState } from '@/components/empty-state';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ContactsTable } from '@/features/crm/contacts';
import { getContacts, type Contact, type ContactListParams } from '@/lib/api/contacts';
import { getUsers, type User } from '@/lib/api/users';

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('');
  const [ownerFilter, setOwnerFilter] = useState<string>('');
  const [page, setPage] = useState(1);

  const fetchContacts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: ContactListParams = { page, limit: 25 };
      if (search) params.search = search;
      if (stageFilter) params.lifecycleStage = stageFilter;
      if (ownerFilter) params.ownerId = ownerFilter;
      const result = await getContacts(params);
      setContacts(result.data);
      setTotal(result.meta.total);
    } catch {
      setContacts([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, stageFilter, ownerFilter]);

  useEffect(() => {
    getUsers().then(setUsers).catch(() => {});
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // Debounce search
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contacts"
        description={`${total} contact${total !== 1 ? 's' : ''}`}
        actions={
          <Button asChild>
            <Link href="/contacts/new"><Plus className="h-4 w-4 mr-1" /> Create Contact</Link>
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Input
          placeholder="Search contacts..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="h-9 w-64"
        />
        <Select value={stageFilter} onValueChange={(v) => { setStageFilter(v === 'all' ? '' : v); setPage(1); }}>
          <SelectTrigger className="h-9 w-[160px]">
            <SelectValue placeholder="All stages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All stages</SelectItem>
            <SelectItem value="SUBSCRIBER">Subscriber</SelectItem>
            <SelectItem value="LEAD">Lead</SelectItem>
            <SelectItem value="OPPORTUNITY">Opportunity</SelectItem>
            <SelectItem value="CUSTOMER">Customer</SelectItem>
          </SelectContent>
        </Select>
        <Select value={ownerFilter} onValueChange={(v) => { setOwnerFilter(v === 'all' ? '' : v); setPage(1); }}>
          <SelectTrigger className="h-9 w-[160px]">
            <SelectValue placeholder="All owners" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All owners</SelectItem>
            {users.map((u) => (
              <SelectItem key={u.id} value={u.id}>{u.firstName} {u.lastName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
      ) : contacts.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No contacts yet"
          description="Create your first contact to start managing relationships."
          action={<Button asChild><Link href="/contacts/new">Create Contact</Link></Button>}
        />
      ) : (
        <ContactsTable contacts={contacts} onRefresh={fetchContacts} users={users} />
      )}
    </div>
  );
}
