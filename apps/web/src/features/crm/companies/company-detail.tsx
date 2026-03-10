'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Globe, Building2, Users, Calendar, User, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { StatusBadge } from '@/components/status-badge';
import { deleteCompany, type Company } from '@/lib/api/companies';
import { getContacts, type Contact } from '@/lib/api/contacts';
import type { LucideIcon } from 'lucide-react';

interface CompanyDetailProps {
  company: Company;
}

export function CompanyDetail({ company }: CompanyDetailProps) {
  const router = useRouter();
  const [showDelete, setShowDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    getContacts({ limit: 50 }).then((r) => {
      setContacts(r.data.filter((c) => c.companyId === company.id));
    }).catch(() => {});
  }, [company.id]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteCompany(company.id);
      toast.success('Entreprise supprimée');
      router.push('/companies');
    } catch {
      toast.error('Échec de la suppression de l\'entreprise');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{company.name}</h1>
          {company.domain && <p className="text-sm text-muted-foreground">{company.domain}</p>}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/companies/${company.id}?edit=true`}><Pencil className="h-4 w-4 mr-1" /> Modifier</Link>
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setShowDelete(true)}>
            <Trash2 className="h-4 w-4 mr-1" /> Supprimer
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader><CardTitle>Informations de l'entreprise</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InfoRow icon={Globe} label="Domaine" value={company.domain || '\u2014'} />
              <InfoRow icon={Building2} label="Secteur d'activité" value={company.industry || '\u2014'} />
              <InfoRow icon={Users} label="Taille" value={company.size || '\u2014'} />
              <InfoRow icon={User} label="Propriétaire" value={`${company.owner.firstName} ${company.owner.lastName}`} />
              <InfoRow icon={Calendar} label="Créé le" value={new Date(company.createdAt).toLocaleDateString()} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Contacts
              <span className="text-sm font-normal text-muted-foreground">{contacts.length}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {contacts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun contact associé</p>
            ) : (
              <div className="space-y-2">
                {contacts.map((c) => (
                  <Link key={c.id} href={`/contacts/${c.id}`} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                    <div>
                      <p className="text-sm font-medium">{c.firstName} {c.lastName}</p>
                      <p className="text-xs text-muted-foreground">{c.email}</p>
                    </div>
                    <StatusBadge status={c.lifecycleStage} type="lifecycle" />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        title="Supprimer l'entreprise"
        description={`Supprimer définitivement ${company.name} ? Les contacts seront dissociés mais pas supprimés.`}
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
