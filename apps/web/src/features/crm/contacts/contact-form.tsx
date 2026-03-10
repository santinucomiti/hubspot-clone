'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createContact, updateContact, type Contact } from '@/lib/api/contacts';
import type { Company } from '@/lib/api/companies';

const contactSchema = z.object({
  firstName: z.string().min(1, 'Le prénom est obligatoire').max(100),
  lastName: z.string().min(1, 'Le nom est obligatoire').max(100),
  email: z.string().email('Adresse e-mail invalide'),
  phone: z.string().max(50).optional().or(z.literal('')),
  lifecycleStage: z.enum(['SUBSCRIBER', 'LEAD', 'OPPORTUNITY', 'CUSTOMER']),
  companyId: z.string().optional().or(z.literal('')),
});

type ContactFormValues = z.infer<typeof contactSchema>;

interface ContactFormProps {
  contact?: Contact;
  companies: Company[];
}

export function ContactForm({ contact, companies }: ContactFormProps) {
  const router = useRouter();
  const isEditing = !!contact;

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      firstName: contact?.firstName ?? '',
      lastName: contact?.lastName ?? '',
      email: contact?.email ?? '',
      phone: contact?.phone ?? '',
      lifecycleStage: contact?.lifecycleStage ?? 'SUBSCRIBER',
      companyId: contact?.companyId ?? '',
    },
  });

  const onSubmit = async (values: ContactFormValues) => {
    try {
      const data = {
        ...values,
        phone: values.phone || undefined,
        companyId: values.companyId || undefined,
      };
      if (isEditing) {
        await updateContact(contact.id, data);
        toast.success('Contact mis à jour');
        router.push(`/contacts/${contact.id}`);
      } else {
        const created = await createContact(data);
        toast.success('Contact créé avec succès');
        router.push(`/contacts/${created.id}`);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      const message = error?.response?.data?.error?.message || 'Une erreur est survenue';
      toast.error(message);
    }
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{isEditing ? 'Modifier le contact' : 'Créer un contact'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="firstName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Prénom</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="lastName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail</FormLabel>
                <FormControl><Input type="email" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="phone" render={({ field }) => (
              <FormItem>
                <FormLabel>Téléphone</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="lifecycleStage" render={({ field }) => (
              <FormItem>
                <FormLabel>Étape du cycle de vie</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="SUBSCRIBER">Abonné</SelectItem>
                    <SelectItem value="LEAD">Prospect</SelectItem>
                    <SelectItem value="OPPORTUNITY">Opportunité</SelectItem>
                    <SelectItem value="CUSTOMER">Client</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="companyId" render={({ field }) => (
              <FormItem>
                <FormLabel>Entreprise</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner une entreprise..." /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="">Aucune</SelectItem>
                    {companies.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Enregistrement...' : isEditing ? 'Mettre à jour le contact' : 'Créer le contact'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Annuler</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
