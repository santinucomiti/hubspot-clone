'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CompanyForm } from '@/features/crm/companies';

export default function NewCompanyPage() {
  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/companies"><ArrowLeft className="h-4 w-4 mr-1" /> Back to Companies</Link>
      </Button>
      <CompanyForm />
    </div>
  );
}
