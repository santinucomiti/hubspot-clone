'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ContactForm } from '@/features/crm/contacts';
import { getCompanies, type Company } from '@/lib/api/companies';

export default function NewContactPage() {
  const [companies, setCompanies] = useState<Company[]>([]);

  useEffect(() => {
    getCompanies({ limit: 100 }).then((r) => setCompanies(r.data)).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/contacts"><ArrowLeft className="h-4 w-4 mr-1" /> Retour aux Contacts</Link>
      </Button>
      <ContactForm companies={companies} />
    </div>
  );
}
