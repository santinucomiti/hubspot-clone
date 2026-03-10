'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { createTicket, type CreateTicketRequest } from '@/lib/api/tickets';
import apiClient from '@/lib/api/client';

const ticketFormSchema = z.object({
  subject: z
    .string()
    .min(1, 'L\'objet est requis')
    .max(255, 'L\'objet doit contenir 255 caractères ou moins'),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  category: z.string().max(100).optional(),
  source: z.enum(['EMAIL', 'MANUAL', 'FORM']),
  ownerId: z.string().optional(),
  contactId: z.string().optional(),
  companyId: z.string().optional(),
});

type TicketFormValues = z.infer<typeof ticketFormSchema>;

interface UserOption {
  id: string;
  firstName: string;
  lastName: string;
}

interface ContactOption {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface CompanyOption {
  id: string;
  name: string;
}

export function TicketForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [contacts, setContacts] = useState<ContactOption[]>([]);
  const [companies, setCompanies] = useState<CompanyOption[]>([]);

  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      subject: '',
      description: '',
      priority: 'MEDIUM',
      category: '',
      source: 'MANUAL',
      ownerId: '',
      contactId: '',
      companyId: '',
    },
  });

  // Load users, contacts, companies for association dropdowns
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [usersRes, contactsRes, companiesRes] = await Promise.all([
          apiClient.get('/users').catch(() => ({ data: [] })),
          apiClient
            .get('/contacts', { params: { limit: 100 } })
            .catch(() => ({ data: { data: [] } })),
          apiClient
            .get('/companies', { params: { limit: 100 } })
            .catch(() => ({ data: { data: [] } })),
        ]);
        setUsers(usersRes.data as UserOption[]);
        setContacts(
          (contactsRes.data as { data: ContactOption[] }).data || [],
        );
        setCompanies(
          (companiesRes.data as { data: CompanyOption[] }).data || [],
        );
      } catch {
        // Silently fail — dropdowns will just be empty
      }
    };
    loadOptions();
  }, []);

  const onSubmit = async (values: TicketFormValues) => {
    setIsSubmitting(true);
    try {
      const payload: CreateTicketRequest = {
        subject: values.subject,
        description: values.description || undefined,
        priority: values.priority,
        category: values.category || undefined,
        source: values.source,
        ownerId: values.ownerId || undefined,
        contactId: values.contactId || undefined,
        companyId: values.companyId || undefined,
      };

      const ticket = await createTicket(payload);
      toast.success('Ticket créé avec succès');
      router.push(`/tickets/${ticket.id}`);
    } catch {
      toast.error('Échec de la création du ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations du ticket</CardTitle>
                <CardDescription>
                  Fournissez les détails du ticket de support.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Objet *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Brève description du problème"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Description détaillée du problème..."
                          className="min-h-[150px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Vous pouvez utiliser du HTML pour la mise en forme.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priorité</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner la priorité" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="LOW">Basse</SelectItem>
                            <SelectItem value="MEDIUM">Moyenne</SelectItem>
                            <SelectItem value="HIGH">Haute</SelectItem>
                            <SelectItem value="URGENT">Urgente</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Catégorie</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="ex. Facturation, Technique, Général"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Source</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner la source" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="MANUAL">Manuel</SelectItem>
                          <SelectItem value="EMAIL">E-mail</SelectItem>
                          <SelectItem value="FORM">Formulaire</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right sidebar: associations */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Assigner et lier</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="ownerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Propriétaire</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Assigner à..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.firstName} {user.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Lier un contact..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {contacts.map((contact) => (
                            <SelectItem key={contact.id} value={contact.id}>
                              {contact.firstName} {contact.lastName} ({contact.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="companyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Entreprise</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Lier une entreprise..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {companies.map((company) => (
                            <SelectItem key={company.id} value={company.id}>
                              {company.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => router.push('/tickets')}
              >
                Annuler
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? 'Création en cours...' : 'Créer un ticket'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
