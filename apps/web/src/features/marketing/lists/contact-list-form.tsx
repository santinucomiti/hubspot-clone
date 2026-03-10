'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FilterBuilder } from './filter-builder';
import { ContactPicker } from './contact-picker';
import {
  createContactList,
  updateContactList,
  addContactListMembers,
  type ContactList,
  type ContactListFilter,
} from '@/lib/api/contact-lists';

const contactListSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(255),
  type: z.enum(['STATIC', 'DYNAMIC']),
});

type ContactListFormValues = z.infer<typeof contactListSchema>;

interface ContactListFormProps {
  initialData?: ContactList;
  initialMembers?: string[];
}

export function ContactListForm({
  initialData,
  initialMembers = [],
}: ContactListFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filters, setFilters] = useState<ContactListFilter[]>(
    initialData?.filters || [],
  );
  const [selectedContactIds, setSelectedContactIds] =
    useState<string[]>(initialMembers);
  const isEditing = !!initialData;

  const form = useForm<ContactListFormValues>({
    resolver: zodResolver(contactListSchema),
    defaultValues: {
      name: initialData?.name || '',
      type: initialData?.type || 'STATIC',
    },
  });

  const listType = form.watch('type');

  async function onSubmit(data: ContactListFormValues) {
    setIsSubmitting(true);
    try {
      if (isEditing) {
        await updateContactList(initialData.id, {
          name: data.name,
          filters: data.type === 'DYNAMIC' ? filters : undefined,
        });
        toast.success('Liste de contacts mise à jour');
      } else {
        const list = await createContactList({
          name: data.name,
          type: data.type,
          filters: data.type === 'DYNAMIC' ? filters : undefined,
        });

        // For static lists, add selected contacts as members
        if (data.type === 'STATIC' && selectedContactIds.length > 0) {
          await addContactListMembers(list.id, selectedContactIds);
        }

        toast.success('Liste de contacts créée');
      }

      router.push('/marketing/lists');
      router.refresh();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Échec de la sauvegarde de la liste de contacts';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>
              {isEditing ? 'Modifier la liste de contacts' : 'Créer une liste de contacts'}
            </CardTitle>
            <CardDescription>
              {isEditing
                ? 'Mettez à jour les paramètres de votre liste de contacts.'
                : 'Créez une nouvelle liste de contacts statique ou dynamique.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de la liste</FormLabel>
                  <FormControl>
                    <Input placeholder="ex. Clients VIP" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isEditing && (
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type de liste</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner le type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="STATIC">
                          Statique - Sélectionner les contacts manuellement
                        </SelectItem>
                        <SelectItem value="DYNAMIC">
                          Dynamique - Remplissage automatique selon les règles de filtre
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
        </Card>

        {/* Dynamic list: filter builder */}
        {listType === 'DYNAMIC' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Règles de filtre</CardTitle>
              <CardDescription>
                Définissez des critères pour inclure automatiquement les contacts correspondants.
                Les contacts correspondant à TOUTES les règles seront inclus (logique ET).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FilterBuilder filters={filters} onChange={setFilters} />
            </CardContent>
          </Card>
        )}

        {/* Static list: contact picker */}
        {listType === 'STATIC' && !isEditing && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sélectionner des contacts</CardTitle>
              <CardDescription>
                Recherchez et sélectionnez des contacts à ajouter à cette liste.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ContactPicker
                selectedIds={selectedContactIds}
                onChange={setSelectedContactIds}
              />
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? 'Sauvegarde...'
              : isEditing
                ? 'Mettre à jour la liste'
                : 'Créer la liste'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/marketing/lists')}
          >
            Annuler
          </Button>
        </div>
      </form>
    </Form>
  );
}
