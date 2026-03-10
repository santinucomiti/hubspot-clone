'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Users } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PageHeader } from '@/components/page-header';
import { ContactListForm } from '@/features/marketing/lists';
import { ContactPicker } from '@/features/marketing/lists/contact-picker';
import {
  getContactList,
  getContactListContacts,
  addContactListMembers,
  type ContactList,
  type ContactListContact,
  type ContactListFilter,
} from '@/lib/api/contact-lists';

export default function ContactListDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [list, setList] = useState<ContactList | null>(null);
  const [contacts, setContacts] = useState<ContactListContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [newMemberIds, setNewMemberIds] = useState<string[]>([]);
  const [isAddingMembers, setIsAddingMembers] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [listData, contactsData] = await Promise.all([
        getContactList(params.id),
        getContactListContacts(params.id),
      ]);
      setList(listData);
      setContacts(contactsData);
    } catch {
      toast.error('Impossible de charger la liste de contacts');
      router.push('/marketing/lists');
    } finally {
      setIsLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleAddMembers() {
    if (newMemberIds.length === 0) return;
    setIsAddingMembers(true);
    try {
      await addContactListMembers(params.id, newMemberIds);
      toast.success(`${newMemberIds.length} contact(s) ajouté(s) à la liste`);
      setNewMemberIds([]);
      fetchData();
    } catch {
      toast.error('Impossible d\'ajouter des membres');
    } finally {
      setIsAddingMembers(false);
    }
  }

  if (isLoading || !list) {
    return (
      <div className="space-y-6">
        <PageHeader title="Liste de contacts" />
        <div className="h-96 flex items-center justify-center text-muted-foreground">
          Chargement...
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="space-y-6">
        <PageHeader title={`Modifier : ${list.name}`} />
        <ContactListForm
          initialData={list}
          initialMembers={contacts.map((c) => c.id)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={list.name}
        description={`Liste ${list.type.toLowerCase()}`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/marketing/lists">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour aux Listes
              </Link>
            </Button>
            <Button onClick={() => setIsEditing(true)}>Modifier la liste</Button>
          </div>
        }
      />

      {/* List info card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Membres ({contacts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {contacts.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Aucun contact dans cette liste pour le moment.
            </p>
          ) : (
            <div className="space-y-2">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between rounded-md border px-4 py-2"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {contact.firstName} {contact.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {contact.email}
                    </p>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {contact.lifecycleStage.toLowerCase()}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add members section for static lists */}
      {list.type === 'STATIC' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ajouter des membres</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ContactPicker
              selectedIds={newMemberIds}
              onChange={setNewMemberIds}
            />
            <Separator />
            <Button
              onClick={handleAddMembers}
              disabled={newMemberIds.length === 0 || isAddingMembers}
            >
              {isAddingMembers
                ? 'Ajout en cours...'
                : `Ajouter ${newMemberIds.length} contact${newMemberIds.length !== 1 ? 's' : ''}`}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Filter rules display for dynamic lists */}
      {list.type === 'DYNAMIC' && list.filters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Règles de filtrage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(list.filters as ContactListFilter[]).map(
                (
                  filter: { field: string; operator: string; value: unknown },
                  index: number,
                ) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-sm"
                  >
                    {index > 0 && (
                      <span className="text-muted-foreground font-medium">
                        ET
                      </span>
                    )}
                    <Badge variant="secondary">{filter.field}</Badge>
                    <span className="text-muted-foreground">
                      {filter.operator}
                    </span>
                    <Badge variant="outline">
                      {Array.isArray(filter.value)
                        ? filter.value.join(', ')
                        : String(filter.value)}
                    </Badge>
                  </div>
                ),
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
