'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus, Building2 } from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { EmptyState } from '@/components/empty-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { CompaniesTable } from '@/features/crm/companies';
import { getCompanies, type Company, type CompanyListParams } from '@/lib/api/companies';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const fetchCompanies = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: CompanyListParams = { page, limit: 25 };
      if (search) params.search = search;
      const result = await getCompanies(params);
      setCompanies(result.data);
      setTotal(result.meta.total);
    } catch {
      setCompanies([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Entreprises"
        description={`${total} entreprise${total !== 1 ? 's' : ''}`}
        actions={
          <Button asChild>
            <Link href="/companies/new"><Plus className="h-4 w-4 mr-1" /> Créer une entreprise</Link>
          </Button>
        }
      />

      <div className="flex items-center gap-3">
        <Input
          placeholder="Rechercher des entreprises..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="h-9 w-64"
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
      ) : companies.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Aucune entreprise pour le moment"
          description="Créez votre première entreprise pour organiser vos contacts."
          action={<Button asChild><Link href="/companies/new">Créer une entreprise</Link></Button>}
        />
      ) : (
        <CompaniesTable companies={companies} onRefresh={fetchCompanies} />
      )}
    </div>
  );
}
