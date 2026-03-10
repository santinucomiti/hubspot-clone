'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Mail, Phone, Building2, Calendar, User, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/status-badge';
import { ConfirmDialog } from '@/components/confirm-dialog';
import Link from 'next/link';
import { deleteContact, type Contact } from '@/lib/api/contacts';
import type { LucideIcon } from 'lucide-react';

interface ContactDetailProps {
  contact: Contact;
}

export function ContactDetail({ contact }: ContactDetailProps) {
  const router = useRouter();
  const [showDelete, setShowDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteContact(contact.id);
      toast.success('Contact deleted');
      router.push('/contacts');
    } catch {
      toast.error('Failed to delete contact');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{contact.firstName} {contact.lastName}</h1>
          <StatusBadge status={contact.lifecycleStage} type="lifecycle" className="mt-1" />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/contacts/${contact.id}?edit=true`}><Pencil className="h-4 w-4 mr-1" /> Edit</Link>
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setShowDelete(true)}>
            <Trash2 className="h-4 w-4 mr-1" /> Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Contact Info */}
        <Card className="md:col-span-2">
          <CardHeader><CardTitle>Contact Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InfoRow icon={Mail} label="Email" value={contact.email} />
              <InfoRow icon={Phone} label="Phone" value={contact.phone || '\u2014'} />
              <InfoRow icon={User} label="Owner" value={`${contact.owner.firstName} ${contact.owner.lastName}`} />
              <InfoRow icon={Calendar} label="Created" value={new Date(contact.createdAt).toLocaleDateString()} />
            </div>
          </CardContent>
        </Card>

        {/* Associated Company */}
        <Card>
          <CardHeader><CardTitle>Company</CardTitle></CardHeader>
          <CardContent>
            {contact.company ? (
              <Link href={`/companies/${contact.company.id}`} className="flex items-center gap-2 text-primary hover:underline">
                <Building2 className="h-4 w-4" />
                {contact.company.name}
              </Link>
            ) : (
              <p className="text-sm text-muted-foreground">No company associated</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activities placeholder */}
      <Card>
        <CardHeader><CardTitle>Activity Timeline</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Activity timeline will be available soon.</p>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        title="Delete Contact"
        description={`Permanently delete ${contact.firstName} ${contact.lastName}? This cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="h-4 w-4 mt-0.5 text-muted-foreground" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
