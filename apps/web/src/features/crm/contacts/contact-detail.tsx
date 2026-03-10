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
      toast.success('Contact supprimé');
      router.push('/contacts');
    } catch {
      toast.error('Échec de la suppression du contact');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{contact.firstName} {contact.lastName}</h1>
          <StatusBadge status={contact.lifecycleStage} type="lifecycle" className="mt-1" />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/contacts/${contact.id}?edit=true`}><Pencil className="h-4 w-4 mr-1" /> Modifier</Link>
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setShowDelete(true)}>
            <Trash2 className="h-4 w-4 mr-1" /> Supprimer
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Informations du contact */}
        <Card className="md:col-span-2">
          <CardHeader><CardTitle>Informations du contact</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InfoRow icon={Mail} label="E-mail" value={contact.email} />
              <InfoRow icon={Phone} label="Téléphone" value={contact.phone || '\u2014'} />
              <InfoRow icon={User} label="Propriétaire" value={`${contact.owner.firstName} ${contact.owner.lastName}`} />
              <InfoRow icon={Calendar} label="Créé le" value={new Date(contact.createdAt).toLocaleDateString()} />
            </div>
          </CardContent>
        </Card>

        {/* Entreprise associée */}
        <Card>
          <CardHeader><CardTitle>Entreprise</CardTitle></CardHeader>
          <CardContent>
            {contact.company ? (
              <Link href={`/companies/${contact.company.id}`} className="flex items-center gap-2 text-primary hover:underline">
                <Building2 className="h-4 w-4" />
                {contact.company.name}
              </Link>
            ) : (
              <p className="text-sm text-muted-foreground">Aucune entreprise associée</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Chronologie des activités */}
      <Card>
        <CardHeader><CardTitle>Chronologie des activités</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">La chronologie des activités sera bientôt disponible.</p>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        title="Supprimer le contact"
        description={`Supprimer définitivement ${contact.firstName} ${contact.lastName} ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
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
