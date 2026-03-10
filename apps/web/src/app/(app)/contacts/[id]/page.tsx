'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ContactDetail, ContactForm } from '@/features/crm/contacts';
import { getContact, type Contact } from '@/lib/api/contacts';
import { getCompanies, type Company } from '@/lib/api/companies';

export default function ContactDetailPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const isEditing = searchParams.get('edit') === 'true';
  const [contact, setContact] = useState<Contact | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [c, comps] = await Promise.all([
          getContact(id),
          getCompanies({ limit: 100 }),
        ]);
        setContact(c);
        setCompanies(comps.data);
      } catch {
        setContact(null);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [id]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Contact not found</p>
        <Button asChild variant="link"><Link href="/contacts">Back to Contacts</Link></Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/contacts"><ArrowLeft className="h-4 w-4 mr-1" /> Back to Contacts</Link>
      </Button>
      {isEditing ? (
        <ContactForm contact={contact} companies={companies} />
      ) : (
        <ContactDetail contact={contact} />
      )}
    </div>
  );
}
