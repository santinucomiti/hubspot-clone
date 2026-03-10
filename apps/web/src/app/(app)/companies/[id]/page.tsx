'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CompanyDetail, CompanyForm } from '@/features/crm/companies';
import { getCompany, type Company } from '@/lib/api/companies';

export default function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const isEditing = searchParams.get('edit') === 'true';
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getCompany(id)
      .then(setCompany)
      .catch(() => setCompany(null))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Company not found</p>
        <Button asChild variant="link"><Link href="/companies">Back to Companies</Link></Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/companies"><ArrowLeft className="h-4 w-4 mr-1" /> Back to Companies</Link>
      </Button>
      {isEditing ? <CompanyForm company={company} /> : <CompanyDetail company={company} />}
    </div>
  );
}
