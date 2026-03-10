'use client';

import { useCallback, useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import apiClient from '@/lib/api/client';

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface ContactPickerProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export function ContactPicker({ selectedIds, onChange }: ContactPickerProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchContacts = useCallback(async (query: string) => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/contacts', {
        params: { search: query, limit: 50 },
      });
      setContacts(response.data.data || []);
    } catch {
      setContacts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts(search);
  }, [search, fetchContacts]);

  function toggleContact(contactId: string) {
    if (selectedIds.includes(contactId)) {
      onChange(selectedIds.filter((id) => id !== contactId));
    } else {
      onChange([...selectedIds, contactId]);
    }
  }

  function removeContact(contactId: string) {
    onChange(selectedIds.filter((id) => id !== contactId));
  }

  const selectedContacts = contacts.filter((c) => selectedIds.includes(c.id));

  return (
    <div className="space-y-4">
      {/* Selected contacts badges */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedContacts.map((contact) => (
            <Badge key={contact.id} variant="secondary" className="gap-1">
              {contact.firstName} {contact.lastName}
              <button
                type="button"
                onClick={() => removeContact(contact.id)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {selectedIds.length > selectedContacts.length && (
            <Badge variant="outline">
              +{selectedIds.length - selectedContacts.length} autre(s) sélectionné(s)
            </Badge>
          )}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher des contacts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Contact list */}
      <ScrollArea className="h-[300px] rounded-md border">
        <div className="p-2">
          {isLoading ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Chargement des contacts...
            </p>
          ) : contacts.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Aucun contact trouvé.
            </p>
          ) : (
            contacts.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-muted/50 cursor-pointer"
                onClick={() => toggleContact(contact.id)}
              >
                <Checkbox
                  checked={selectedIds.includes(contact.id)}
                  onCheckedChange={() => toggleContact(contact.id)}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {contact.firstName} {contact.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {contact.email}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      <p className="text-xs text-muted-foreground">
        {selectedIds.length} contact{selectedIds.length !== 1 ? 's' : ''} sélectionné{selectedIds.length !== 1 ? 's' : ''}
      </p>
    </div>
  );
}
